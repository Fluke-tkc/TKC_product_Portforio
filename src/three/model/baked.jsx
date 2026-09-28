// Loader for dioramas modelled in Blender (public/Blender/scripts) with baked lighting.
// Every exported node carries glTF extras from the build script: kind (bake/anim/glass/led/screen),
// hot (hotspot id), atlas (which lightmap), spin (+ spin_speed) for rotating parts, swing (+ swing_axis / _amp /
// _speed) for parts turning to and fro, bob for floating
// badges, blink for warning lights, walk/drive + path for people and cars, slide/lift + sense for doors
// and barriers that open when someone comes close.
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { acceleratedRaycast, computeBoundsTree } from "three-mesh-bvh";
import { Hot } from "./ModelStage";
import { screenMaterial } from "./screens";

const LED_COLORS = {
  led_cyan: ["#40b8ff", 3.2],
  led_warm: ["#ffc98a", 2.4],
  led_white: ["#ffffff", 2.6],
  led_green: ["#4dff8c", 2.6],
  led_red: ["#ff4a3d", 2.6],
  led_blue: ["#4d8cff", 2.8],
};

// dark tint + sky reflections, so the warm baked interiors read through it instead of a milky film
const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: "#10263d",
  metalness: 0,
  roughness: 0.03,
  transparent: true,
  opacity: 0.3,
  envMapIntensity: 2.4,
  clearcoat: 1,
  clearcoatRoughness: 0.03,
  depthWrite: false,
  side: THREE.DoubleSide,
});

// Soft round contact shadow under people and cars: they are left out of the light bake.
let blobMaterial;
function blob(w, d, clip) {
  if (!blobMaterial) {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(0,0,0,0.5)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    blobMaterial = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, clippingPlanes: clip });
  }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), blobMaterial);
  m.position.y = 0.03;
  m.raycast = () => {};
  m.userData.noHighlight = true;
  return m;
}

// holograms: see-through additive cyan, no lighting
const holoMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color("#4fe3ff").multiplyScalar(1.6),
  transparent: true,
  opacity: 0.32,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
  toneMapped: false,
});

function extras(obj) {
  for (let o = obj; o; o = o.parent) if (o.userData && o.userData.kind) return o.userData;
  return {};
}

export function useLightmaps(urls) {
  const list = Object.entries(urls);
  const textures = useLoader(THREE.TextureLoader, list.map(([, u]) => u));
  return useMemo(() => {
    const out = {};
    list.forEach(([k], i) => {
      const t = textures[i];
      t.flipY = false; // glTF UV convention
      t.colorSpace = THREE.SRGBColorSpace;
      t.channel = 0;
      t.anisotropy = 8;
      t.needsUpdate = true;
      out[k] = t;
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textures]);
}

// Prepare the glTF: swap materials, group hotspot parts, collect pins and animated nodes.
// Lightmaps and vertex light both store half the baked light, hence the factor 2 (= intensity).
function prepare(scene, lightmaps, intensity, clip) {
  const cache = new Map();
  const baked = (src, atlas, vertexLit, clipped) => {
    const key = `${src.uuid}|${vertexLit ? "v" : atlas}|${clipped ? "c" : ""}`;
    if (!cache.has(key)) {
      const color = src.color ? src.color.clone() : new THREE.Color(1, 1, 1);
      cache.set(
        key,
        vertexLit
          ? new THREE.MeshBasicMaterial({ color: color.multiplyScalar(intensity), vertexColors: true, clippingPlanes: clipped ? clip : null })
          : new THREE.MeshBasicMaterial({ color, lightMap: lightmaps[atlas] || null, lightMapIntensity: Math.PI * intensity })
      );
    }
    return cache.get(key);
  };
  const pins = {};
  const hot = {};
  const anim = [];
  const movers = []; // walkers (walk) and cars (drive) following a polyline path
  const sliders = []; // automatic doors, gate flaps and car-park barriers
  const toGroup = [];
  scene.updateMatrixWorld(true);
  scene.traverse((o) => {
    if (o.name.startsWith("pin_")) pins[o.name.slice(4)] = o.getWorldPosition(new THREE.Vector3());
    if (o.userData?.hot && o.parent === scene) toGroup.push(o);
    if (o.userData?.spin || "bob" in (o.userData || {}) || "blink" in (o.userData || {}) || "swing" in (o.userData || {})) anim.push(o);
    if (o.userData?.walk || o.userData?.drive) movers.push(o);
    if (o.userData?.slide || o.userData?.lift) sliders.push(o);
    if (!o.isMesh) return;
    const x = extras(o);
    const mat = o.material;
    const name = mat?.name || x.mat || "";
    if (name.startsWith("holo")) {
      o.material = holoMaterial;
      o.renderOrder = 3;
      o.raycast = () => {};
    } else if (x.kind === "glass" || name === "glass") {
      o.material = glassMaterial;
      o.renderOrder = 2;
      o.raycast = () => {}; // see-through: never blocks clicks or hides pins
    } else if (x.kind === "led" || name.startsWith("led_")) {
      const [c, k] = LED_COLORS[name] || LED_COLORS.led_cyan;
      o.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), toneMapped: false, clippingPlanes: x.kind === "move" ? clip : null });
    } else if (x.kind === "screen" || name.startsWith("screen_")) {
      o.material = screenMaterial(name);
    } else {
      o.material = baked(mat, x.atlas, x.kind === "vbake" || x.kind === "move", x.kind === "move");
    }
    // BVH keeps the pins' occlusion raycasts cheap. The tree lives on the cached geometry, so every
    // visit reuses it; each fresh clone must still switch to the accelerated raycast.
    if (o.raycast === THREE.Mesh.prototype.raycast) {
      if (!o.geometry.boundsTree) computeBoundsTree.call(o.geometry);
      o.raycast = acceleratedRaycast;
    }
  });
  toGroup.forEach((o) => {
    const id = o.userData.hot;
    if (!hot[id]) hot[id] = new THREE.Group();
    hot[id].add(o);
  });
  movers.forEach((o) => {
    const u = o.userData;
    const pts = [];
    for (let i = 0; i < u.path.length; i += 2) pts.push(new THREE.Vector3(u.path[i], o.position.y, -u.path[i + 1])); // Blender xy -> three xz
    if (u.closed) pts.push(pts[0].clone());
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
    u.run = { pts, cum, limbs: o.children.filter((c) => c.userData.limb) };
    o.add(u.blob ? blob(u.blob[0], u.blob[1], clip) : u.walk ? blob(0.9, 0.9, clip) : blob(5.4, 2.5, clip));
  });
  anim.forEach((o) => {
    o.userData.base = o.position.y;
    o.userData.rot0 = o.rotation.clone();
  });
  sliders.forEach((o) => {
    o.userData.home = o.position.clone();
    o.userData.q0 = o.quaternion.clone();
    o.userData.open = 0;
  });
  return { pins, hot, anim, movers, sliders };
}

// Put `out` at distance d along the path (wrapping) and return the yaw that faces along it.
function along({ pts, cum }, d, out) {
  const total = cum[cum.length - 1];
  d = ((d % total) + total) % total;
  let i = 1;
  while (i < cum.length - 1 && cum[i] < d) i++;
  const a = pts[i - 1];
  const b = pts[i];
  out.lerpVectors(a, b, (d - cum[i - 1]) / (cum[i] - cum[i - 1] || 1));
  return Math.atan2(a.z - b.z, b.x - a.x); // actors face their local +x
}

const Z_AXIS = new THREE.Vector3(0, 0, 1);
const LIFT = new THREE.Quaternion();

// clip = [half width, half depth] of the base: people and cars are cut off cleanly where they leave it
export function BakedModel({ url, lightmaps: lightmapUrls, intensity = 1, clip: base, views, onAnchors }) {
  const gl = useThree((s) => s.gl);
  const clip = useMemo(
    () =>
      base && [
        new THREE.Plane(new THREE.Vector3(1, 0, 0), base[0]),
        new THREE.Plane(new THREE.Vector3(-1, 0, 0), base[0]),
        new THREE.Plane(new THREE.Vector3(0, 0, 1), base[1]),
        new THREE.Plane(new THREE.Vector3(0, 0, -1), base[1]),
      ],
    [base]
  );
  const raycaster = useThree((s) => s.raycaster);
  useEffect(() => {
    gl.localClippingEnabled = true;
    raycaster.firstHitOnly = true; // pins only need to know whether anything is in front of them
  }, [gl, raycaster]);
  const gltf = useGLTF(url, "/draco/");
  const lightmaps = useLightmaps(lightmapUrls);
  // prepare() regroups nodes, so work on a clone: the cached glTF stays intact for the next visit
  const { root, pins, hot, anim, movers, sliders } = useMemo(() => {
    const root = gltf.scene.clone(true);
    return { root, ...prepare(root, lightmaps, intensity, clip) };
  }, [gltf, lightmaps, intensity, clip]);
  const t = useRef(0);

  useEffect(() => {
    const anchors = {};
    Object.entries(pins).forEach(([id, p]) => {
      const v = views?.[id] || {};
      const offset = v.offset || [14, 10, 18];
      anchors[id] = {
        pin: [p.x, p.y, p.z],
        target: v.target || [p.x, p.y - (v.drop ?? 1.5), p.z],
        position: v.position || [p.x + offset[0], p.y + offset[1], p.z + offset[2]],
      };
    });
    onAnchors?.(anchors);
  }, [pins, views, onAnchors]);

  useFrame((_, dt) => {
    t.current += dt;
    anim.forEach((o) => {
      const u = o.userData;
      if (u.spin === "z") o.rotation.y += dt * (u.spin_speed ?? 6);
      else if (u.spin === "x") o.rotation.x += dt * (u.spin_speed ?? 2.2);
      else if (u.spin === "y") o.rotation.z -= dt * (u.spin_speed ?? 2.2); // Blender y = three -z
      if ("swing" in u) {
        // to-and-fro about Blender z (robot arm turret) or local y (shoulder pitch)
        const a = Math.sin(t.current * (u.swing_speed ?? 0.8) + u.swing) * (u.swing_amp ?? 0.6);
        if (u.swing_axis === "y") o.rotation.z = u.rot0.z - a;
        else o.rotation.y = u.rot0.y + a;
      }
      if ("bob" in u) {
        const w = Math.sin(t.current * (u.bob_speed ?? 1.4) + u.bob); // bounce: a ball hopping off the ground
        o.position.y = u.base + (u.bounce ? Math.abs(w) : w) * (u.bob_amp ?? 0.12);
      }
      if ("blink" in u) o.visible = (t.current * 2.2 + u.blink) % 1 < 0.5;
    });
    movers.forEach((o) => {
      const u = o.userData;
      const speed = u.walk || u.drive;
      o.rotation.set(0, along(u.run, u.path_at + speed * t.current, o.position), 0);
      if (u.walk) {
        const phase = t.current * speed * 4.4;
        o.position.y += Math.abs(Math.sin(phase)) * 0.04;
        u.run.limbs.forEach((l) => (l.rotation.z = l.userData.limb * Math.sin(phase) * 0.45));
      }
    });
    sliders.forEach((o) => {
      const u = o.userData;
      const who = u.sense_for || "walk";
      const near = movers.some((m) => m.userData[who] && Math.hypot(m.position.x - u.home.x, m.position.z - u.home.z) < u.sense);
      u.open = THREE.MathUtils.damp(u.open, near ? 1 : 0, u.lift ? 3.5 : 5, dt);
      if (u.slide && u.slide_axis === "y") o.position.z = u.home.z - u.slide * u.slide_dist * u.open; // Blender y = three -z
      else if (u.slide) o.position.x = u.home.x + u.slide * u.slide_dist * u.open;
      else o.quaternion.copy(u.q0).multiply(LIFT.setFromAxisAngle(Z_AXIS, -1.35 * u.open)); // arm points along local -x
    });
  });

  return (
    <group>
      <primitive object={root} />
      {Object.entries(hot).map(([id, g]) => (
        <Hot key={id} id={id}>
          <primitive object={g} />
        </Hot>
      ))}
    </group>
  );
}
