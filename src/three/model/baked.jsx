// Loader for dioramas modelled in Blender (public/Blender/scripts) with baked lighting.
// Every exported node carries glTF extras from the build script: kind (bake/anim/glass/led/screen),
// hot (hotspot id), atlas (which lightmap), spin (+ spin_speed) for rotating parts, swing (+ swing_axis / _amp /
// _speed) for parts turning to and fro, bob for floating
// badges, blink for warning lights, walk/drive + path for people and cars, slide/lift + sense for doors
// and barriers that open when someone comes close. Movers may also carry stops (see timeline()), axles (both on
// the path, so a long vehicle turns like a real one), path_z (a height per path point), hide (time windows when
// they are out of sight) and child door leaves with fold, which fold open while the mover waits at a stop.
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { acceleratedRaycast, computeBoundsTree } from "three-mesh-bvh";
import { Hot } from "./ModelStage";
import { screenMaterial } from "./screens";
import { addNormalMap, normalRule, normalUrl, sunDirection } from "./normalMaps";
import { addInterior, isFacadeGlass } from "./interiors";
import { glazeVehicles } from "./vehicleGlass";

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

// the normal maps this model's materials use (see normalMaps.js), by map name
function useNormalMaps(gltf) {
  const maps = useMemo(() => [...new Set(gltf.parser.json.materials.map((m) => normalRule(m.name || "")?.[0]).filter(Boolean))], [gltf]);
  const textures = useLoader(THREE.TextureLoader, maps.map(normalUrl));
  return useMemo(() => {
    const out = {};
    maps.forEach((m, i) => {
      const t = textures[i];
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = 8;
      t.needsUpdate = true;
      out[m] = t;
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textures]);
}

// Prepare the glTF: swap materials, group hotspot parts, collect pins and animated nodes.
// Lightmaps and vertex light both store half the baked light, hence the factor 2 (= intensity).
function prepare(scene, lightmaps, intensity, clip, normals, sun) {
  const cache = new Map();
  let movingGlass;
  const clearGlass = (moving) => (moving && clip ? (movingGlass ??= Object.assign(glassMaterial.clone(), { clippingPlanes: clip })) : glassMaterial); // cut off with a mover at the plinth edge
  const carGlass = []; // vehicle glass, made see-through with seats inside once every mesh is ready
  const baked = (src, name, atlas, vertexLit, clipped) => {
    const key = `${src.uuid}|${vertexLit ? "v" : atlas}|${clipped ? "c" : ""}`;
    if (!cache.has(key)) {
      const color = src.color ? src.color.clone() : new THREE.Color(1, 1, 1);
      const m = vertexLit
        ? new THREE.MeshBasicMaterial({ color: color.multiplyScalar(intensity), vertexColors: true, clippingPlanes: clipped ? clip : null })
        : new THREE.MeshBasicMaterial({ color, lightMap: lightmaps[atlas] || null, lightMapIntensity: Math.PI * intensity });
      m.userData = { atlas: vertexLit ? null : atlas, base: m.color.clone() }; // a demo may tint a whole atlas (lighting scenes)
      const [map, tile, strength] = normalRule(name) || [];
      if (normals[map] && !clipped) addNormalMap(m, normals[map], tile, strength, sun); // not on people / cars: they move
      else if (isFacadeGlass(name) && !clipped) addInterior(m, vertexLit ? intensity : 1); // rooms behind the facade glass
      cache.set(key, m);
    }
    return cache.get(key);
  };
  const pins = {};
  const hot = {};
  const anim = [];
  const movers = []; // walkers (walk) and cars (drive) following a polyline path
  const sliders = []; // automatic doors, gate flaps and car-park barriers
  const leds = []; // LED meshes: the selected hotspot pulses its own, reactions may drive the rest
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
      o.material = clearGlass(x.kind === "move");
      o.renderOrder = 2;
      o.raycast = () => {}; // see-through: never blocks clicks or hides pins
    } else if (x.kind === "led" || name.startsWith("led_")) {
      const [c, k] = LED_COLORS[name] || LED_COLORS.led_cyan;
      o.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), toneMapped: false, clippingPlanes: x.kind === "move" ? clip : null });
      if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
      leds.push({ mesh: o, base: o.material.color.clone(), hot: x.hot, at: o.geometry.boundingSphere.center.clone().applyMatrix4(o.matrixWorld) });
    } else if (x.kind === "screen" || name.startsWith("screen_")) {
      o.material = screenMaterial(name);
    } else {
      o.material = baked(mat, name, x.atlas, x.kind === "vbake" || x.kind === "move", x.kind === "move");
      if (name === "carglass") carGlass.push({ mesh: o, mover: x.kind === "move" });
    }
    // BVH keeps the pins' occlusion raycasts cheap. The tree lives on the cached geometry, so every
    // visit reuses it; each fresh clone must still switch to the accelerated raycast.
    if (o.raycast === THREE.Mesh.prototype.raycast) {
      if (!o.geometry.boundsTree) computeBoundsTree.call(o.geometry);
      o.raycast = acceleratedRaycast;
    }
  });
  glazeVehicles(scene, carGlass, clearGlass, clip);
  toGroup.forEach((o) => {
    const id = o.userData.hot;
    if (!hot[id]) hot[id] = new THREE.Group();
    hot[id].add(o);
  });
  movers.forEach((o) => {
    const u = o.userData;
    const pts = [];
    for (let i = 0; i < u.path.length; i += 2) pts.push(new THREE.Vector3(u.path[i], u.path_z?.[i / 2] ?? o.position.y, -u.path[i + 1])); // Blender xy -> three xz
    if (u.closed) pts.push(pts[0].clone());
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z));
    const doors = [];
    o.traverse((c) => {
      if (c.userData.fold) {
        c.userData.rot0 = c.rotation.y;
        doors.push(c);
      }
    });
    const lamps = [];
    o.traverse((c) => {
      if (c.isMesh && c.material.toneMapped === false && c.material.isMeshBasicMaterial) {
        c.userData.c0 = c.material.color.clone(); // head / tail lights flash when the car is clicked
        lamps.push(c);
      }
    });
    const tl = u.stops && timeline(cum[cum.length - 1], u.walk || u.drive, u.stops, u.ease ?? 1);
    u.run = { pts, cum, limbs: o.children.filter((c) => c.userData.limb), lamps, doors, tl };
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
  return { pins, hot, anim, movers, sliders, leds, materials: [...cache.values()] };
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

// Timeline movers (extras stops = [d, wait, ...], ease in metres): they brake to each stop, wait and pull away again;
// the round (travel + waits) repeats and t_at (s) sets where in it a mover starts. smart_learning.py mirrors this
// to time the 03 bus and its riders against each other, so keep the two in step.
function timeline(total, speed, stops, ease) {
  const at = new Map();
  for (let i = 0; i < stops.length; i += 2) at.set(total - stops[i] < 1e-3 ? total : stops[i], stops[i + 1]);
  const marks = [...new Set([0, total, ...at.keys()])].sort((a, b) => a - b);
  const parts = [];
  let T = 0;
  marks.forEach((d0, i) => {
    if (at.has(d0)) {
      parts.push({ t0: T, dur: at.get(d0), d0, D: 0 });
      T += at.get(d0);
    }
    if (i === marks.length - 1) return;
    const D = marks[i + 1] - d0;
    const e0 = at.has(d0) ? Math.min(ease, D / 2) : 0;
    const e1 = at.has(marks[i + 1]) ? Math.min(ease, D / 2) : 0;
    parts.push({ t0: T, dur: (D + e0 + e1) / speed, d0, D, e0, e1 });
    T += (D + e0 + e1) / speed;
  });
  return { parts, T };
}

// where a timeline mover is at `lt` (its own clock): distance d, speed v (0..1) and, at a stop, seconds waited / left
function onTimeline({ parts }, speed, lt, out) {
  const p = parts.find((q) => lt < q.t0 + q.dur) || parts[parts.length - 1];
  const s = lt - p.t0;
  out.waited = out.left = -1;
  if (!p.D) return Object.assign(out, { d: p.d0, v: 0, waited: s, left: p.dur - s });
  const a0 = (2 * p.e0) / speed;
  const a1 = (2 * p.e1) / speed;
  if (s < a0) return Object.assign(out, { d: p.d0 + (speed * speed * s * s) / (4 * p.e0), v: s / a0 });
  if (s > p.dur - a1) return Object.assign(out, { d: p.d0 + p.D - (speed * speed * (p.dur - s) ** 2) / (4 * p.e1), v: (p.dur - s) / a1 });
  return Object.assign(out, { d: p.d0 + p.e0 + speed * (s - a0), v: 1 });
}

// Long vehicles: front and rear axle both on the path, the body along the line between them; returns the yaw.
const FRONT = new THREE.Vector3();
const REAR = new THREE.Vector3();
function onAxles(run, d, [front, rear], out) {
  const total = run.cum[run.cum.length - 1];
  along(run, Math.min(d + front, total - 1e-6), FRONT);
  along(run, Math.max(d - rear, 0), REAR);
  out.copy(FRONT).sub(REAR).normalize().multiplyScalar(rear).add(REAR);
  return Math.atan2(REAR.z - FRONT.z, FRONT.x - REAR.x);
}

const Z_AXIS = new THREE.Vector3(0, 0, 1);
const STATE = {};
const ramp = (x) => THREE.MathUtils.clamp(x / 0.8, 0, 1);

function moverOf(o) {
  while (o && !(o.userData.walk || o.userData.drive)) o = o.parent;
  return o;
}

// expanding ring on the ground where a person / car was clicked
function pokeRing() {
  const m = new THREE.Mesh(
    new THREE.RingGeometry(0.8, 1, 48).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: new THREE.Color("#5ee7ff").multiplyScalar(2), transparent: true, depthWrite: false, toneMapped: false })
  );
  m.visible = false;
  m.raycast = () => {};
  return m;
}
const LIFT = new THREE.Quaternion();

// clip = [half width, half depth] of the base: people and cars are cut off cleanly where they leave it
// activeId: the selected hotspot, whose moving parts switch to a demo (doors open, fans speed up, LEDs pulse);
// reactions: optional scene-specific overlay shown for the selected hotspot (see reactions.jsx); sun: the bake's sun
// ([elevation, x, y] from the Blender script's lighting()), which lights the normal maps. A scene may take a
// mover over (userData.scripted: it positions it itself) or hold a door / barrier (userData.override = 0 | 1).
export function BakedModel({ url, lightmaps: lightmapUrls, intensity = 1, clip: base, views, onAnchors, activeId, reactions: Reactions, sun }) {
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
  const normals = useNormalMaps(gltf);
  const sunU = useMemo(() => ({ value: new THREE.Vector3() }), []);
  sunDirection(sun, sunU.value);
  // prepare() regroups nodes, so work on a clone: the cached glTF stays intact for the next visit
  const { root, pins, hot, anim, movers, sliders, leds, materials } = useMemo(() => {
    const root = gltf.scene.clone(true);
    return { root, ...prepare(root, lightmaps, intensity, clip, normals, sunU) };
  }, [gltf, lightmaps, intensity, clip, normals, sunU]);
  const t = useRef(0);
  const active = useRef(activeId);
  active.current = activeId;
  const poke = useRef({ at: -9, pos: new THREE.Vector3() });
  const ring = useMemo(() => pokeRing(), []);
  useEffect(() => () => ring.geometry.dispose() || ring.material.dispose(), [ring]);

  useEffect(() => {
    const anchors = {};
    Object.entries(pins).forEach(([id, p]) => {
      const v = views?.[id] || {};
      const offset = v.offset || [14, 10, 18];
      anchors[id] = {
        pin: v.pin || [p.x, p.y, p.z], // a view may move its label where the camera sees it best
        focusPin: v.focusPin, // where the label sits while its own hotspot is open (default: pin)
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
      const fast = (u.hot && u.hot === active.current ? 3 : 1) * (u.mult ?? 1); // demo: the selected system runs flat out; mult: set by a demo (wind)
      if (u.spin === "z") o.rotation.y += dt * (u.spin_speed ?? 6) * fast;
      else if (u.spin === "x") o.rotation.x += dt * (u.spin_speed ?? 2.2) * fast;
      else if (u.spin === "y") o.rotation.z -= dt * (u.spin_speed ?? 2.2) * fast; // Blender y = three -z
      if ("swing" in u) {
        // to-and-fro about Blender z (robot arm turret) or local y (shoulder pitch); a demo may freeze it with
        // hold (the clock value to show) and resume it where it stopped with toff (time spent paused)
        const a = Math.sin((u.hold ?? t.current - (u.toff ?? 0)) * (u.swing_speed ?? 0.8) + u.swing) * (u.swing_amp ?? 0.6);
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
      const { tl, doors } = u.run;
      const lt = tl && (((t.current + (u.t_at ?? 0)) % tl.T) + tl.T) % tl.T;
      const st = tl && onTimeline(tl, speed, lt, STATE);
      const d = tl ? st.d : u.path_at + speed * t.current;
      if (!u.scripted) o.rotation.set(0, u.axles ? onAxles(u.run, d, u.axles, o.position) : along(u.run, d, o.position), 0); // scripted: a scene drives it
      if (u.hide) o.visible = !u.hide.some((h, i) => i % 2 === 0 && lt >= h && lt < u.hide[i + 1]);
      if (doors.length) {
        const open = tl && st.waited >= 0 ? ramp(st.waited - 0.6) * ramp(st.left - 0.6) : 0; // open once stopped, shut before pulling away
        doors.forEach((c) => (c.rotation.y = c.userData.rot0 + c.userData.fold * 1.35 * open));
      }
      const p = (t.current - (u.poked ?? -9)) / 1.1; // clicked: hop (people cheer, cars flash their lights)
      const hop = p < 1 ? Math.sin(p * Math.PI) : 0;
      o.position.y += hop * (u.walk ? 0.55 : 0.35);
      if (u.walk && !u.scripted) {
        const phase = d * 4.4;
        const stride = tl ? st.v : 1; // standing still at a stop
        o.position.y += Math.abs(Math.sin(phase)) * 0.04 * stride;
        u.run.limbs.forEach((l) => {
          l.rotation.z = l.userData.limb * Math.sin(phase) * 0.45 * stride * (1 - hop);
          l.rotation.x = l.name.includes("arm") ? -l.userData.limb * 2.4 * hop : 0;
        });
      } else if (p < 1.2) u.run.lamps.forEach((m) => m.material.color.copy(m.userData.c0).multiplyScalar(p < 1 && Math.sin(p * 30) > 0 ? 5 : 1));
    });
    const pk = (t.current - poke.current.at) / 1.1;
    ring.visible = pk < 1;
    if (ring.visible) {
      ring.position.copy(poke.current.pos);
      ring.scale.setScalar(0.6 + pk * 3.4);
      ring.material.opacity = 1 - pk;
    }
    leds.forEach((l) => {
      const on = l.hot && l.hot === active.current;
      if (on) l.mesh.material.color.copy(l.base).multiplyScalar(0.45 + 1.1 * Math.abs(Math.sin(t.current * 3 + l.at.x * 0.2)));
      else if (l.mesh.userData.pulsed) l.mesh.material.color.copy(l.base);
      l.mesh.userData.pulsed = on;
    });
    sliders.forEach((o) => {
      const u = o.userData;
      const who = u.sense_for || "walk";
      const demo = u.hot && u.hot === active.current; // selecting the hotspot opens its doors / lifts its barriers
      const near = demo || movers.some((m) => m.userData[who] && Math.hypot(m.position.x - u.home.x, m.position.z - u.home.z) < u.sense);
      const want = u.override ?? (near ? 1 : 0); // override: a demo holds it open (1) or shut (0)
      u.open = THREE.MathUtils.damp(u.open, want, u.lift ? 3.5 : 5, dt);
      if (u.slide && u.slide_axis === "y") o.position.z = u.home.z - u.slide * u.slide_dist * u.open; // Blender y = three -z
      else if (u.slide) o.position.x = u.home.x + u.slide * u.slide_dist * u.open;
      else o.quaternion.copy(u.q0).multiply(LIFT.setFromAxisAngle(Z_AXIS, -1.35 * u.open)); // arm points along local -x
    });
  });

  return (
    <group>
      <primitive
        object={root}
        onClick={(e) => {
          const m = moverOf(e.object);
          if (!m || e.delta > 6) return;
          e.stopPropagation();
          m.userData.poked = t.current;
          poke.current.at = t.current;
          poke.current.pos.set(m.position.x, 0.2, m.position.z);
        }}
        onPointerOver={(e) => moverOf(e.object) && (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      />
      <primitive object={ring} />
      {Reactions && <Reactions active={activeId} pins={pins} movers={movers} leds={leds} sliders={sliders} anim={anim} materials={materials} t={t} />}
      {Object.entries(hot).map(([id, g]) => (
        <Hot key={id} id={id}>
          <primitive object={g} />
        </Hot>
      ))}
    </group>
  );
}
