// Smart Building, live: built in code and lit in real time, so the time of day, the operating mode, the
// system layers and the exploded view can all be played with (see Panel.jsx). Replaces the baked diorama.
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { acceleratedRaycast, computeBoundsTree } from "three-mesh-bvh";
import { Hot } from "../../model/ModelStage";
import { screenMaterial } from "../../model/screens";
import { Kit, rng } from "../kit";
import { simulate } from "./sim";
import {
  B, BAYS, BASE, FH, LOBBY, NF, ROOF, floorH, floorY,
  buildAccess, buildCanopy, buildCar, buildChillers, buildRoof, buildRoom, buildSite, buildSolar, buildStorey, disposeAll, makeMaterials,
} from "./parts";
import Panel from "./Panel";
import { store } from "./state";


// per-frame state shared by every animated part (not React state: nothing re-renders at 60 fps)
const F = { hour: 10, s: simulate({ hour: 10, mode: "comfort" }), explode: 0, t: 0, sync: 0 };
const GAP = 4.2; // extra height between storeys in the exploded view
const lift = (k) => k * GAP * F.explode;
const clamp01 = (v) => Math.min(1, Math.max(0, v));

function Driver() {
  useFrame((_, dt) => {
    const st = store.get();
    if (st.playing) {
      F.hour = (F.hour + dt * 0.75) % 24;
      F.sync += dt;
      if (F.sync > 0.12) {
        F.sync = 0;
        store.set({ hour: F.hour });
      }
    } else {
      const d = st.hour - F.hour;
      F.hour = Math.abs(d) > 12 ? st.hour : F.hour + d * (1 - Math.exp(-dt * 5));
    }
    F.s = simulate({ hour: F.hour, mode: st.mode });
    F.explode = THREE.MathUtils.damp(F.explode, st.exploded ? 1 : 0, 3.5, dt);
    F.t += dt;
  });
  return null;
}

// ---------------------------------------------------------------- helpers

const NOOP = () => {};

function Meshes({ build, mats, name, cast = true, bvh = false }) {
  useEffect(() => {
    if (bvh) build.forEach(({ geometry }) => geometry.boundsTree || computeBoundsTree.call(geometry));
  }, [build, bvh]);
  return (
    <group name={name}>
      {build.map(({ key, geometry }) => {
        const mat = mats[key];
        return (
          <mesh
            key={key}
            geometry={geometry}
            material={mat}
            castShadow={cast && !mat.transparent}
            receiveShadow={!mat.transparent}
            raycast={mat.transparent ? NOOP : bvh ? acceleratedRaycast : THREE.Mesh.prototype.raycast}
          />
        );
      })}
    </group>
  );
}

// canvas screens from screens.js use glTF UVs (v down); a plain plane needs its v flipped
function screenPlane(w, h) {
  const g = new THREE.PlaneGeometry(w, h);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i));
  return g;
}

function Screen({ size, position, rotation = [0, 0, 0], name }) {
  const geo = useMemo(() => screenPlane(size[0], size[1]), [size]);
  useEffect(() => () => geo.dispose(), [geo]);
  return <mesh geometry={geo} material={screenMaterial(name)} position={position} rotation={rotation} />;
}

function along(path, d, out) {
  const total = path.cum[path.cum.length - 1];
  d = ((d % total) + total) % total;
  let i = 1;
  while (i < path.cum.length - 1 && path.cum[i] < d) i++;
  const a = path.pts[i - 1];
  const b = path.pts[i];
  out.lerpVectors(a, b, (d - path.cum[i - 1]) / (path.cum[i] - path.cum[i - 1] || 1));
  return Math.atan2(b.x - a.x, b.z - a.z);
}

function loop(points, y) {
  const pts = points.map(([x, z]) => new THREE.Vector3(x, y, z));
  pts.push(pts[0].clone());
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
  return { pts, cum };
}

// ---------------------------------------------------------------- light, sky and room

const C = (h) => new THREE.Color(h);
const SUN_DAY = C("#fff4e0");
const SUN_LOW = C("#ffab66");
const SKY_DAY = C("#dbeaff");
const SKY_NIGHT = C("#1c2c4d");
const PANE_DAY = new THREE.Color(1.55, 1.65, 1.75);
const PANE_DUSK = new THREE.Color(1.7, 0.95, 0.55);
const PANE_NIGHT = new THREE.Color(0.05, 0.09, 0.18);
const FOG_DAY = C("#d9d4cb");
const FOG_NIGHT = C("#141b29");
const TMPC = new THREE.Color();

function Sky({ mats }) {
  const sun = useRef();
  const moon = useRef();
  const hemi = useRef();
  const scene = useThree((s) => s.scene);
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.localClippingEnabled = true;
    scene.fog = new THREE.Fog("#d9d4cb", 170, 520);
    return () => (scene.fog = null);
  }, [scene, gl]);
  useFrame(() => {
    const s = F.s;
    const a = ((F.hour - 6.25) / 12) * Math.PI; // 0 sunrise (east, +x) ... PI sunset (west)
    const up = Math.sin(a);
    const low = 1 - clamp01(up * 1.8);
    sun.current.position.set(Math.cos(a) * 70, Math.max(6, up * 85), 34);
    sun.current.intensity = 3.1 * clamp01(up * 3);
    sun.current.color.copy(SUN_DAY).lerp(SUN_LOW, low);
    moon.current.intensity = 0.35 * (1 - s.daylight);
    hemi.current.intensity = 0.4 + 0.45 * s.daylight;
    hemi.current.color.copy(SKY_NIGHT).lerp(SKY_DAY, s.daylight);
    const dusk = clamp01(1 - Math.abs(up - 0.12) * 5) * (up > -0.2 ? 1 : 0);
    TMPC.copy(PANE_NIGHT).lerp(PANE_DAY, clamp01(up * 3)).lerp(PANE_DUSK, dusk * 0.8);
    mats.windowPane.color.copy(TMPC);
    scene.fog.color.copy(FOG_NIGHT).lerp(FOG_DAY, s.daylight);
    scene.environmentIntensity = 0.12 + 0.38 * s.daylight;
    // things the simulation switches on and off
    const dark = 1 - s.daylight;
    mats.ceilLight.emissiveIntensity = 0.05 + s.lights * 2.6;
    mats.ceilNight.emissiveIntensity = 0.05 + Math.max(s.lights, 0.6 * dark) * 2.6;
    mats.facadeLed.emissiveIntensity = s.streetLights * (s.mode === "away" ? 1.2 : 2.6);
    glowMat.opacity = s.streetLights * 0.55;
    const lit = Math.max(s.lights, 0.35 * dark) * dark;
    mats.floorIn.emissiveIntensity = s.lights * 0.45;
    mats.terrazzo.emissiveIntensity = 0.5 * dark;
    mats.interiorGlow.opacity = lit * 0.24;
    mats.lampHead.emissiveIntensity = s.streetLights * 3.2;
    mats.sign.emissiveIntensity = 0.2 + s.signage * 2.2;
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={["#dbeaff", "#8a7a66", 0.6]} />
      <directionalLight
        ref={sun}
        castShadow
        intensity={3}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-44}
        shadow-camera-right={44}
        shadow-camera-top={44}
        shadow-camera-bottom={-44}
        shadow-camera-near={1}
        shadow-camera-far={220}
        shadow-bias={-0.0003}
        shadow-normalBias={0.04}
      />
      <directionalLight ref={moon} position={[-40, 70, -30]} color="#8fb0ff" intensity={0.2} />
    </>
  );
}

function Room({ mats }) {
  const build = useMemo(() => buildRoom(), []);
  const panes = useMemo(() => [new THREE.PlaneGeometry(240, 120), new THREE.PlaneGeometry(200, 120)], []);
  useEffect(
    () => () => {
      build.forEach((b) => b.geometry.dispose());
      panes.forEach((p) => p.dispose());
    },
    [build, panes]
  );
  return (
    <group>
      <Meshes build={build} mats={mats} cast={false} />
      <mesh geometry={panes[0]} material={mats.windowPane} position={[0, 58, -164]} raycast={() => {}} />
      <mesh geometry={panes[1]} material={mats.windowPane} position={[-204, 58, -10]} rotation={[0, Math.PI / 2, 0]} raycast={() => {}} />
    </group>
  );
}

// ---------------------------------------------------------------- building

const SEATED = (() => {
  const k = new Kit();
  k.box("body", [0, 0.45, 0.16], [0.36, 0.16, 0.5], { r: 0.06 });
  k.box("body", [0, 0.5, 0], [0.44, 0.62, 0.3], { r: 0.12 });
  k.ico("head", [0, 1.28, 0], 0.15, { detail: 1 });
  return Object.fromEntries(k.build().map((b) => [b.key, b.geometry]));
})();
const SHIRTS = ["#f1f1f1", "#3d84c6", "#e2734f", "#4fae8a", "#8a6fd1", "#f2c14e"].map((c) => new THREE.Color(c));

function People({ seats, seed }) {
  const bodies = useRef();
  const heads = useRef();
  const mats = useMemo(() => [new THREE.MeshStandardMaterial({ roughness: 0.9 }), new THREE.MeshStandardMaterial({ color: "#e0b08a", roughness: 0.7 })], []);
  useEffect(() => {
    const r = rng(seed);
    seats.forEach((_, i) => bodies.current.setColorAt(i, SHIRTS[Math.floor(r() * SHIRTS.length)]));
    bodies.current.instanceColor.needsUpdate = true;
    return () => mats.forEach((m) => m.dispose());
  }, [seats, seed, mats]);
  const last = useRef(-1);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  useFrame(() => {
    const occ = Math.round(F.s.occ * 50) / 50;
    if (occ === last.current) return;
    last.current = occ;
    seats.forEach((s, i) => {
      const on = s.t < occ ? 1 : 0;
      q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, s.ry);
      m.compose(new THREE.Vector3(s.x, 0.35, s.z), q, new THREE.Vector3(on, on, on));
      bodies.current.setMatrixAt(i, m);
      heads.current.setMatrixAt(i, m);
    });
    bodies.current.instanceMatrix.needsUpdate = true;
    heads.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh ref={bodies} args={[SEATED.body, mats[0], seats.length]} castShadow raycast={() => {}} />
      <instancedMesh ref={heads} args={[SEATED.head, mats[1], seats.length]} raycast={() => {}} />
    </>
  );
}

// automatic louvres on the east and west faces: they roll down from the top of each storey
function Louvres({ side, h, mats }) {
  const ref = useRef();
  const geo = useMemo(() => {
    const k = new Kit();
    const x = side > 0 ? B.x1 + 0.35 : B.x0 - 0.35;
    for (let i = 0; i < Math.floor((h - 0.5) / 0.28); i++) k.box("frame", [x, -0.28 * (i + 1), (B.z0 + B.z1) / 2], [0.06, 0.16, B.z1 - B.z0 - 0.4]);
    return k.build()[0].geometry;
  }, [side, h]);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame(() => {
    const v = side > 0 ? F.s.east : F.s.west;
    const sc = ref.current.scale;
    sc.y = THREE.MathUtils.lerp(sc.y, Math.max(0.02, v), 0.08);
    ref.current.visible = sc.y > 0.03;
  });
  return <mesh ref={ref} geometry={geo} material={mats.frame} position={[0, h - 0.1, 0]} scale={[1, 0.02, 1]} castShadow raycast={() => {}} />;
}

function Storey({ k, mats, children }) {
  const ref = useRef();
  const build = useMemo(() => {
    const kit = new Kit();
    const info = buildStorey(kit, k, 100 + k * 17);
    return { meshes: kit.build(), ...info };
  }, [k]);
  useEffect(() => () => build.meshes.forEach((b) => b.geometry.dispose()), [build]);
  useFrame(() => {
    ref.current.position.y = floorY(k) + lift(k);
  });
  return (
    <group ref={ref}>
      <Meshes build={build.meshes} mats={mats} bvh />
      {build.seats.length > 0 && <People seats={build.seats} seed={k * 31} />}
      <Louvres side={1} h={floorH(k)} mats={mats} />
      <Louvres side={-1} h={floorH(k)} mats={mats} />
      {children}
    </group>
  );
}

function Lifted({ k, children }) {
  const ref = useRef();
  useFrame(() => {
    ref.current.position.y = (k === NF + 1 ? ROOF : floorY(k)) + lift(k);
  });
  return <group ref={ref}>{children}</group>;
}

function Fans({ mats }) {
  const refs = useRef([]);
  const geo = useMemo(() => new THREE.CylinderGeometry(0.8, 0.8, 0.12, 5), []);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame((_, dt) => refs.current.forEach((f) => f && (f.rotation.y += dt * (1 + F.s.hvac / 12))));
  return [-10.5, -6.8].flatMap((z, i) =>
    [5, 7].map((x, j) => <mesh key={`${i}${j}`} ref={(o) => (refs.current[i * 2 + j] = o)} geometry={geo} material={mats.frame} position={[x, 2.15, z]} raycast={() => {}} />)
  );
}

function Building({ mats }) {
  const roof = useMemo(() => buildRoof(), []);
  const solar = useMemo(() => buildSolar(), []);
  const chillers = useMemo(() => buildChillers(), []);
  const access = useMemo(() => buildAccess(), []);
  const canopy = useMemo(() => buildCanopy(), []);
  const bms = useMemo(() => {
    const k = new Kit();
    k.box("glass", [3.4, 0.35, 1.2], [0.05, FH - 0.5, 4.2]);
    k.box("desk", [6.1, 0.35, 0.6], [3.2, 0.78, 0.9], { r: 0.2 });
    for (let i = 0; i < 3; i++) k.box("monitor", [5.1 + i, 1.13, 0.4], [0.7, 0.42, 0.05]);
    k.box("chair", [5.6, 0.77, 1.4], [0.5, 0.5, 0.5], { r: 0.08 });
    return k.build();
  }, []);
  const gateway = useMemo(() => {
    const k = new Kit();
    k.cyl("metal", [6.8, 0.45, 1.6], 0.09, 4.2, { seg: 8 });
    k.box("slab", [6.8, 1.6, 1.6], [0.6, 0.8, 0.4], { r: 0.08 });
    for (let i = 0; i < 3; i++) k.box("slab", [6.8 + (i - 1) * 0.22, 4.6, 1.6], [0.08, 0.7, 0.18], { r: 0.03 });
    return k.build();
  }, []);
  const sensors = useMemo(() => {
    const k = new Kit();
    for (const [x, z] of [[-11, 1], [-7, -1], [-3, 2], [1, 0.5], [5, -1.5]]) k.cyl("slab", [x, LOBBY - 0.18, z], 0.16, 0.1, { seg: 12 });
    return k.build();
  }, []);
  useEffect(() => () => [roof, solar, chillers, access, canopy, bms, gateway, sensors].flat().forEach((b) => b.geometry.dispose()), [roof, solar, chillers, access, canopy, bms, gateway, sensors]);
  return (
    <group name="occluder">
      <Storey k={0} mats={mats}>
        <Meshes build={canopy} mats={mats} />
        <Hot id="access-control">
          <Meshes build={access} mats={mats} />
          {[-5.6, -4.2, -2.8, -1.4, 0].map((x) => (
            <mesh key={x} position={[x, 1.46, -0.4]} material={mats.ledGreen} raycast={() => {}}>
              <boxGeometry args={[0.3, 0.04, 1.2]} />
            </mesh>
          ))}
        </Hot>
        <Hot id="motion-sensors">
          <Meshes build={sensors} mats={mats} />
        </Hot>
        <Hot id="lighting">
          <Screen size={[5.6, 1.8]} position={[-2, 3.65, -5.15]} name="screen_media" />
        </Hot>
      </Storey>
      {Array.from({ length: NF }, (_, i) => (
        <Storey key={i + 1} k={i + 1} mats={mats}>
          {i === 0 && (
            <Hot id="building-automation">
              <Meshes build={bms} mats={mats} />
              <Screen size={[3.6, 1.8]} position={[8.85, 2.1, 0.9]} rotation={[0, -Math.PI / 2, 0]} name="screen_bms" />
            </Hot>
          )}
        </Storey>
      ))}
      <Lifted k={NF + 1}>
        <Meshes build={roof} mats={mats} bvh />
        <Hot id="renewable-energy">
          <Meshes build={solar} mats={mats} />
        </Hot>
        <Meshes build={chillers} mats={mats} />
        <Fans mats={mats} />
        <Hot id="iot">
          <Meshes build={gateway} mats={mats} />
          <Blink position={[6.8, 5.35, 1.6]} mats={mats} />
        </Hot>
        <mesh position={[-3, 1.2, B.z1 + 0.38]} material={mats.sign} raycast={() => {}}>
          <boxGeometry args={[8, 0.5, 0.04]} />
        </mesh>
      </Lifted>
    </group>
  );
}

function Blink({ position, mats }) {
  const ref = useRef();
  useFrame(() => (ref.current.visible = F.t % 1.2 < 0.6));
  return (
    <mesh ref={ref} position={position} material={mats.ledRed} raycast={() => {}}>
      <sphereGeometry args={[0.12, 10, 8]} />
    </mesh>
  );
}

// ---------------------------------------------------------------- site: parking, traffic, people

function Parking({ mats }) {
  const car = useMemo(() => buildCar("carWhite"), []);
  const paints = useMemo(() => ["#f0f0ee", "#3b6fb6", "#c9503f", "#8c96a3", "#2c3139", "#e9c46a"], []);
  const cars = useMemo(() => {
    const r = rng(7);
    const rank = BAYS.map((_, i) => ({ i, v: r() })).sort((a, b) => a.v - b.v);
    return BAYS.map((b, i) => {
      const paint = new THREE.MeshStandardMaterial({ color: paints[i % paints.length], roughness: 0.3, transparent: true });
      return { ...b, order: rank.findIndex((x) => x.i === i), paint, p: 0 };
    });
  }, [paints]);
  const refs = useRef([]);
  const leds = useRef();
  const sign = useRef();
  const free = useRef(-1);
  const signTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 128;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  useEffect(
    () => () => {
      cars.forEach((c) => c.paint.dispose());
      car.forEach((b) => b.geometry.dispose());
      signTex.dispose();
    },
    [cars, car, signTex]
  );
  useFrame((_, dt) => {
    const n = F.s.parked;
    cars.forEach((c, i) => {
      const g = refs.current[i];
      if (!g) return;
      c.p = THREE.MathUtils.damp(c.p, c.order < n ? 1 : 0, 2.2, dt);
      g.visible = c.p > 0.02;
      g.position.x = c.x + c.aisle * (1 - c.p) * 5;
      c.paint.opacity = clamp01(c.p * 1.6);
      leds.current.setColorAt(i, c.order < n ? RED : GREEN);
    });
    leds.current.instanceColor.needsUpdate = true;
    if (free.current !== BAYS.length - n) {
      free.current = BAYS.length - n;
      const ctx = signTex.image.getContext("2d");
      ctx.fillStyle = "#0b1f33";
      ctx.fillRect(0, 0, 256, 128);
      ctx.fillStyle = "#5ee7ff";
      ctx.font = "600 28px Prompt, sans-serif";
      ctx.fillText("P  FREE", 20, 44);
      ctx.fillStyle = free.current > 3 ? "#51cf66" : "#ff6b6b";
      ctx.font = "700 60px Prompt, sans-serif";
      ctx.fillText(`${free.current}/${BAYS.length}`, 20, 108);
      signTex.needsUpdate = true;
    }
  });
  const ledGeo = useMemo(() => new THREE.CylinderGeometry(0.16, 0.16, 0.06, 10), []);
  const ledMat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), []);
  useEffect(() => {
    const m = new THREE.Matrix4();
    BAYS.forEach((b, i) => {
      m.makeTranslation(b.x - b.aisle * 1.5, 0.2, b.z);
      leds.current.setMatrixAt(i, m);
      leds.current.setColorAt(i, GREEN);
    });
    leds.current.instanceMatrix.needsUpdate = true;
    return () => {
      ledGeo.dispose();
      ledMat.dispose();
    };
  }, [ledGeo, ledMat]);
  return (
    <Hot id="smart-parking">
      {cars.map((c, i) => (
        <group key={i} ref={(o) => (refs.current[i] = o)} position={[c.x, 0.16, c.z]} rotation={[0, c.ry, 0]}>
          {car.map(({ key, geometry }) => (
            <mesh key={key} geometry={geometry} material={key === "carWhite" ? c.paint : mats[key]} castShadow />
          ))}
        </group>
      ))}
      <instancedMesh ref={leds} args={[ledGeo, ledMat, BAYS.length]} />
      <mesh ref={sign} position={[19, 3.9, 12.9]} rotation={[0, 0, 0]}>
        <planeGeometry args={[2.2, 1.1]} />
        <meshBasicMaterial map={signTex} toneMapped={false} />
      </mesh>
    </Hot>
  );
}
const RED = new THREE.Color(3, 0.5, 0.4);
const GREEN = new THREE.Color(0.5, 3, 1);

const CLIP = [new THREE.Plane(new THREE.Vector3(1, 0, 0), BASE.x), new THREE.Plane(new THREE.Vector3(-1, 0, 0), BASE.x)];

function Traffic({ mats }) {
  const kits = useMemo(() => ["carBlue", "carWhite", "carRed"].map((p) => ({ paint: p, build: buildCar(p) })), []);
  const clipped = useMemo(() => {
    const out = {};
    for (const key of ["carBlue", "carWhite", "carRed", "carGlass", "tyre"]) {
      out[key] = mats[key].clone();
      out[key].clippingPlanes = CLIP;
    }
    return out;
  }, [mats]);
  useEffect(() => () => Object.values(clipped).forEach((m) => m.dispose()) || kits.forEach((k) => k.build.forEach((b) => b.geometry.dispose())), [clipped, kits]);
  const refs = useRef([]);
  const lanes = [
    { z: 17.6, dir: 1, at: 0 },
    { z: 17.6, dir: 1, at: 40 },
    { z: 21.4, dir: -1, at: 20 },
  ];
  useFrame(() => {
    lanes.forEach((l, i) => {
      const g = refs.current[i];
      const x = ((((l.at + F.t * 7) % 84) + 84) % 84) - 42;
      g.position.x = l.dir * x;
    });
  });
  return lanes.map((l, i) => (
    <group key={i} ref={(o) => (refs.current[i] = o)} position={[0, 0.12, l.z]} rotation={[0, l.dir > 0 ? 0 : Math.PI, 0]}>
      {kits[i].build.map(({ key, geometry }) => (
        <mesh key={key} geometry={geometry} material={clipped[key]} castShadow raycast={() => {}} />
      ))}
    </group>
  ));
}

const WALK = {
  body: new THREE.CapsuleGeometry(0.22, 0.8, 3, 8),
  head: new THREE.IcosahedronGeometry(0.16, 1),
};
function Walkers() {
  const paths = useMemo(
    () => [
      [loop([[-16, 6.2], [9.5, 6.2], [9.5, 9.6], [-16, 9.6]], 0.22), 3, 1.1],
      [loop([[-31, 13.3], [31, 13.3], [31, 14.1], [-31, 14.1]], 0.26), 3, 1.25],
      [loop([[-26.2, -20], [-26.2, 8.6], [-25.6, 8.6], [-25.6, -20]], 0.26), 2, 1.0],
    ],
    []
  );
  const walkers = useMemo(() => {
    const r = rng(5);
    return paths.flatMap(([path, n, speed], p) =>
      Array.from({ length: n }, (_, j) => ({ path, speed, at: (j / n) * path.cum[path.cum.length - 1] + p * 3, color: SHIRTS[Math.floor(r() * SHIRTS.length)] }))
    );
  }, [paths]);
  const mats = useMemo(() => walkers.map((w) => new THREE.MeshStandardMaterial({ color: w.color, roughness: 0.9 })), [walkers]);
  const skin = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e0b08a", roughness: 0.7 }), []);
  useEffect(() => () => mats.forEach((m) => m.dispose()) || skin.dispose(), [mats, skin]);
  const refs = useRef([]);
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    walkers.forEach((w, i) => {
      const g = refs.current[i];
      const ry = along(w.path, w.at + F.t * w.speed, v);
      g.position.set(v.x, v.y + Math.abs(Math.sin(F.t * w.speed * 5 + i)) * 0.05, v.z);
      g.rotation.y = ry;
    });
  });
  return walkers.map((w, i) => (
    <group key={i} ref={(o) => (refs.current[i] = o)}>
      <mesh geometry={WALK.body} material={mats[i]} position={[0, 0.62, 0]} castShadow raycast={() => {}} />
      <mesh geometry={WALK.head} material={skin} position={[0, 1.42, 0]} raycast={() => {}} />
    </group>
  ));
}

// soft pool of light under each street lamp (fades in with the lamps)
const glowMat = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,214,150,1)");
  grad.addColorStop(1, "rgba(255,214,150,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
})();
const GLOW_GEO = new THREE.PlaneGeometry(7, 7).rotateX(-Math.PI / 2);

function SiteExtras({ mats }) {
  const cctv = useMemo(() => {
    const k = new Kit();
    for (const [x, z] of CAMS) {
      k.cyl("frame", [x, 0.2, z], 0.1, 5.6, { seg: 8 });
      k.box("slab", [x, 5.4, z], [0.34, 0.26, 0.55], { r: 0.06 });
    }
    return k.build();
  }, []);
  const bess = useMemo(() => {
    const k = new Kit();
    k.box("bess", [-24.8, 0.22, -15.5], [6.1, 2.62, 2.6], { r: 0.12 });
    return k.build();
  }, []);
  const heads = useMemo(() => {
    const k = new Kit();
    for (const x of [-28, -18, -8, 6, 16, 26]) k.box("lampHead", [x, 5.45, 15.6], [0.5, 0.1, 0.9], { r: 0.04 });
    return k.build();
  }, []);
  useEffect(() => () => [cctv, bess, heads].flat().forEach((b) => b.geometry.dispose()), [cctv, bess, heads]);
  return (
    <>
      <Hot id="surveillance">
        <Meshes build={cctv} mats={mats} />
      </Hot>
      <Hot id="renewable-energy">
        <Meshes build={bess} mats={mats} />
      </Hot>
      <Meshes build={heads} mats={mats} cast={false} />
      {[-28, -18, -8, 6, 16, 26].map((x) => (
        <mesh key={x} geometry={GLOW_GEO} material={glowMat} position={[x, 0.3, 15.8]} renderOrder={4} raycast={NOOP} />
      ))}
      <Hot id="lighting">
        <mesh position={[11.4, 0.22, 9.5]} material={mats.slab}>
          <boxGeometry args={[1.2, 3.6, 0.4]} />
        </mesh>
        <Screen size={[1, 2.6]} position={[11.4, 2.2, 9.72]} name="screen_totem" />
      </Hot>
    </>
  );
}
// CCTV poles: position and the point each one watches
const CAMS = [[-16.4, 11.2, -4, 4], [11.6, 11.2, -2, 4], [31, 11, 21, -2], [31, -20.5, 21, -8], [-31, -22, -24, -10]];

// ---------------------------------------------------------------- system layers

const flowVertex = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const flowFragment = `uniform float time; uniform float speed; uniform float len; uniform vec3 color; uniform float alpha; varying vec2 vUv;
  void main(){
    float d = fract(vUv.x * len - time * speed);
    float dash = smoothstep(0.0, 0.12, d) * smoothstep(0.55, 0.3, d);
    gl_FragColor = vec4(color * (0.6 + 2.4 * dash), (0.25 + 0.75 * dash) * alpha);
  }`;
function flowMaterial(color, len) {
  return new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, speed: { value: 1 }, len: { value: len }, color: { value: new THREE.Color(color) }, alpha: { value: 0 } },
    vertexShader: flowVertex,
    fragmentShader: flowFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
}

// a glowing pipe along a polyline with flowing dashes; fades in and out with its layer
function Flow({ points, color, radius = 0.12, layer, speed = () => 1, tint }) {
  const on = store.use((s) => s[layer]);
  const { geo, mat } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.1);
    const len = curve.getLength();
    return { geo: new THREE.TubeGeometry(curve, Math.max(16, Math.round(len * 3)), radius, 8), mat: flowMaterial(color, len / 1.6) };
  }, [points, color, radius]);
  useEffect(() => () => geo.dispose() || mat.dispose(), [geo, mat]);
  useFrame((_, dt) => {
    const u = mat.uniforms;
    u.time.value = F.t;
    u.speed.value = speed();
    u.alpha.value = THREE.MathUtils.damp(u.alpha.value, on ? 1 : 0, 5, dt);
    if (tint) u.color.value.copy(tint());
  });
  return <mesh geometry={geo} material={mat} renderOrder={5} raycast={() => {}} />;
}

const EXPORT = new THREE.Color("#4dff9a");
const IMPORT = new THREE.Color("#ffa24d");
const SOLARC = "#ffd23f";

function Layers() {
  const hideRisers = () => (F.explode > 0.05 ? 0 : 1);
  return (
    <group>
      {/* energy: solar roof -> riser -> battery; grid transformer <-> building (green when exporting) */}
      <Flow layer="energy" color={SOLARC} radius={0.16} speed={() => (F.s.solar > 3 ? 1.2 * hideRisers() : 0)} points={[[-6, ROOF + 1.4, -4], [-6, ROOF + 1.4, B.z0 - 0.6], [B.x0 - 0.6, ROOF + 1.2, B.z0 - 0.6], [B.x0 - 0.6, 0.6, B.z0 - 0.6], [-24.8, 0.6, -14]]} />
      <Flow layer="energy" color="#ffa24d" radius={0.16} speed={() => Math.sign(F.s.grid) * 1.1} tint={() => (F.s.grid < 0 ? EXPORT : IMPORT)} points={[[-29.6, 1.2, -3.2], [-22, 0.6, -2.5], [B.x0 - 0.6, 0.6, -2.5], [B.x0 + 0.8, 1.2, -2.5]]} />
      {Array.from({ length: NF + 1 }, (_, k) => (
        <Lifted key={k} k={k}>
          <Flow layer="energy" color={SOLARC} radius={0.07} points={[[B.x0 + 0.4, floorH(k) - 0.4, -11.4], [8.4, floorH(k) - 0.4, -11.4], [8.4, floorH(k) - 0.4, 2.8], [B.x0 + 0.4, floorH(k) - 0.4, 2.8]]} />
          {/* HVAC: cool supply loop and warm return loop on each storey */}
          <Flow layer="hvac" color="#4fd1ff" radius={0.11} speed={() => 0.4 + F.s.hvac / 90} points={[[-12, floorH(k) - 0.55, -3.5], [6.5, floorH(k) - 0.55, -3.5], [6.5, floorH(k) - 0.55, 1.8], [-12, floorH(k) - 0.55, 1.8], [-12, floorH(k) - 0.55, -3.3]]} />
          <Flow layer="hvac" color="#ff9f5a" radius={0.09} speed={() => -(0.3 + F.s.hvac / 120)} points={[[-13.2, floorH(k) - 0.8, -10.5], [-6, floorH(k) - 0.8, -10.5], [-6, floorH(k) - 0.8, -5], [-13.2, floorH(k) - 0.8, -5]]} />
          {/* IoT: sensors report to the floor gateway at the core */}
          {[[-12, 1.5], [-7, -2.5], [4, 0.5], [6.5, -9], [-12, -9]].map(([x, z], i) => (
            <Flow key={i} layer="network" color="#8f9bff" radius={0.045} speed={() => 1.6} points={[[x, floorH(k) - 0.3, z], [(x - 2) / 2, floorH(k) - 0.3, (z - 5) / 2], [-2, floorH(k) - 0.3, -5.2]]} />
          ))}
        </Lifted>
      ))}
      <Flow layer="hvac" color="#4fd1ff" radius={0.22} speed={() => (0.4 + F.s.hvac / 90) * hideRisers()} points={[[4.2, ROOF + 1.2, -8.6], [1.8, ROOF + 1.2, -8.6], [1.8, 0.6, -8.6]]} />
      <Flow layer="network" color="#8f9bff" radius={0.1} speed={() => 2 * hideRisers()} points={[[-2, 0.8, -5.3], [-2, ROOF + 0.8, -5.3], [6.8, ROOF + 0.8, 1.6], [6.8, ROOF + 4.8, 1.6]]} />
      <Flow layer="network" color="#8f9bff" radius={0.08} speed={() => 2} points={[[6.8, ROOF + 5, 1.6], [4, ROOF + 12, -2], [-2, ROOF + 16, -4]]} />
      <Cloud />
      <SecurityLayer />
    </group>
  );
}

function Cloud() {
  const on = store.use((s) => s.network);
  const ref = useRef();
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(0.55, 0.62, 1.6), transparent: true, opacity: 0, toneMapped: false, depthWrite: false }), []);
  useEffect(() => () => mat.dispose(), [mat]);
  useFrame((_, dt) => {
    mat.opacity = THREE.MathUtils.damp(mat.opacity, on ? 0.55 : 0, 5, dt);
    ref.current.visible = mat.opacity > 0.01;
    ref.current.position.y = ROOF + 17 + lift(NF + 1) + Math.sin(F.t * 1.3) * 0.3;
  });
  return (
    <group ref={ref} position={[-2, ROOF + 17, -4]}>
      {[[0, 0, 0, 1.4], [1.3, -0.3, 0, 1], [-1.3, -0.3, 0, 1.05], [0.6, 0.6, 0, 0.9]].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} material={mat} raycast={() => {}}>
          <icosahedronGeometry args={[r, 1]} />
        </mesh>
      ))}
    </group>
  );
}

function SecurityLayer() {
  const on = store.use((s) => s.security);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 0.35, 0.3), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }), []);
  const cone = useMemo(() => new THREE.ConeGeometry(4.2, 9, 20, 1, true).translate(0, -4.5, 0), []);
  useEffect(() => () => mat.dispose() || cone.dispose(), [mat, cone]);
  const refs = useRef([]);
  useFrame((_, dt) => {
    mat.opacity = THREE.MathUtils.damp(mat.opacity, on ? 0.16 : 0, 5, dt);
    refs.current.forEach((o, i) => {
      if (!o) return;
      const [x, z, tx, tz] = CAMS[i];
      o.visible = mat.opacity > 0.01;
      o.rotation.y = Math.atan2(tx - x, tz - z) + Math.sin(F.t * 0.5 + i) * 0.45;
    });
  });
  // each camera sweeps round the area it watches: the cone is tilted down towards local +z, then yawed at the target
  return CAMS.map(([x, z], i) => (
    <group key={i} position={[x, 5.5, z]}>
      <group ref={(o) => (refs.current[i] = o)}>
        <mesh geometry={cone} material={mat} rotation={[-0.95, 0, 0]} raycast={() => {}} />
      </group>
    </group>
  ));
}

// ---------------------------------------------------------------- scene

function SmartBuildingLive({ onAnchors }) {
  const mats = useMemo(() => makeMaterials(), []);
  const site = useMemo(() => buildSite(), []);
  useEffect(() => () => disposeAll(mats, [site]), [mats, site]);
  useEffect(() => onAnchors?.(ANCHORS), [onAnchors]);
  useEffect(() => {
    // nothing is downloaded: tell the page loader (drei useProgress) the scene is ready
    THREE.DefaultLoadingManager.itemStart("live-building");
    THREE.DefaultLoadingManager.itemEnd("live-building");
  }, []);
  return (
    <group>
      <Driver />
      <Sky mats={mats} />
      <Room mats={mats} />
      <Meshes build={site} mats={mats} />
      <SiteExtras mats={mats} />
      <Building mats={mats} />
      <Parking mats={mats} />
      <Traffic mats={mats} />
      <Walkers />
      <Layers />
    </group>
  );
}

// hotspot pins and the camera for each (three.js axes)
const ANCHORS = {
  "renewable-energy": { pin: [-6, ROOF + 3.4, -4], target: [-6, ROOF - 2, -6], position: [22, ROOF + 22, 30] },
  iot: { pin: [6.8, ROOF + 6.4, 1.6], target: [3, ROOF, -2], position: [28, ROOF + 12, 30] },
  "building-automation": { pin: [6, LOBBY + 3.2, 1.4], target: [6, LOBBY + 1.6, 0.4], position: [24, LOBBY + 6, 20] },
  lighting: { pin: [11.4, 4.8, 9.6], target: [2, 2.6, -1], position: [16, 7, 24] },
  surveillance: { pin: [11.6, 7, 11.2], target: [10, 3, 8], position: [26, 12, 32] },
  "motion-sensors": { pin: [-9.5, 3.8, 4.2], target: [-7, 2.4, -1], position: [-12, 6.5, 20] },
  "access-control": { pin: [-3, 2.8, 2.2], target: [-3, 1.3, 0], position: [4, 4.6, 17] },
  "smart-parking": { pin: [21.3, 3.2, -6], target: [21.3, 0, -5], position: [46, 24, 22] },
};

export default {
  Component: SmartBuildingLive,
  Panel,
  store,
  ownLights: true,
  autoRotate: false,
  home: { position: [56, 40, 68], target: [0, 5, -1] },
  maxDistance: 125,
  sky: ["#cfc6b8", "#e8e2d8", "#b8ad9e"],
};
