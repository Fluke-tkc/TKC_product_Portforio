// Reactions: what a baked diorama does when a hotspot is selected, drawn live on top of the baked model.
// Small reusable effects (rings, packets, rays, cones, detection boxes, arrows, scan line, tags) plus the
// per-scene sets that combine them live next to their scene (e.g. scenes/buildingSystems.jsx for 01).
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import styles from "./reactions.module.css";

const ADD = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide };
const glow = (c, k = 2) => new THREE.Color(c).multiplyScalar(k);
const NOOP = () => {};
const UP = new THREE.Vector3(0, 1, 0);

function useDispose(...things) {
  useEffect(() => () => things.flat().forEach((x) => x?.dispose?.()), things); // eslint-disable-line react-hooks/exhaustive-deps
}

// grows in over ~0.4 s after mounting
function useIntro() {
  const v = useRef(0);
  useFrame((_, dt) => (v.current = Math.min(1, v.current + dt * 2.5)));
  return v;
}

export function Tag({ position, children }) {
  return (
    <Html position={position} center zIndexRange={[9, 5]} style={{ pointerEvents: "none" }}>
      <div className={styles.tag}>{children}</div>
    </Html>
  );
}

// signal waves spreading from a point
export function Rings({ at, color = "#5ee7ff", radius = 10, count = 3, period = 2.4, vertical = false }) {
  const geo = useMemo(() => new THREE.RingGeometry(0.93, 1, 72), []);
  const mats = useMemo(() => Array.from({ length: count }, () => new THREE.MeshBasicMaterial({ color: glow(color, 2.2), ...ADD })), [count, color]);
  useDispose(geo, mats);
  const refs = useRef([]);
  const intro = useIntro();
  useFrame(({ clock }) =>
    refs.current.forEach((m, i) => {
      if (!m) return;
      const p = (clock.elapsedTime / period + i / count) % 1;
      m.scale.setScalar(0.3 + p * radius);
      mats[i].opacity = (1 - p) * 0.85 * intro.current;
    })
  );
  return mats.map((mat, i) => (
    <mesh key={i} ref={(o) => (refs.current[i] = o)} geometry={geo} material={mat} position={at} rotation={vertical ? [0, 0, 0] : [-Math.PI / 2, 0, 0]} raycast={NOOP} />
  ));
}

// glowing data packets hopping along arcs from each source to one target
export function Packets({ from, to, color = "#8f9bff", period = 2.2, lift = 6 }) {
  const geo = useMemo(() => new THREE.IcosahedronGeometry(0.32, 1), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow(color, 3), ...ADD }), [color]);
  const trail = useMemo(() => new THREE.MeshBasicMaterial({ color: glow(color, 1.4), ...ADD, opacity: 0.35 }), [color]);
  useDispose(geo, mat, trail);
  const curves = useMemo(
    () =>
      from.map((f) => {
        const a = new THREE.Vector3(...f);
        const b = new THREE.Vector3(...to);
        const m = a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, lift + a.distanceTo(b) * 0.15, 0));
        return new THREE.QuadraticBezierCurve3(a, m, b);
      }),
    [from, to, lift]
  );
  const tubes = useMemo(() => curves.map((c) => new THREE.TubeGeometry(c, 40, 0.05, 5)), [curves]);
  useDispose(tubes);
  const refs = useRef([]);
  useFrame(({ clock }) =>
    refs.current.forEach((m, i) => {
      if (!m) return;
      const p = (clock.elapsedTime / period + i * 0.37) % 1;
      curves[i].getPoint(p, m.position);
      m.scale.setScalar(0.6 + Math.sin(p * Math.PI) * 0.6);
    })
  );
  return curves.map((_, i) => (
    <group key={i}>
      <mesh geometry={tubes[i]} material={trail} raycast={NOOP} />
      <mesh ref={(o) => (refs.current[i] = o)} geometry={geo} material={mat} raycast={NOOP} />
    </group>
  ));
}

// shafts of sunlight falling on an area
export function Rays({ at, radius = 5, count = 7, length = 30, color = "#ffe08a", dir = [0.45, 1, 0.35] }) {
  const d = useMemo(() => new THREE.Vector3(...dir).normalize(), [dir]);
  const geo = useMemo(() => new THREE.CylinderGeometry(0.35, 0.9, length, 10, 1, true), [length]);
  const mats = useMemo(() => Array.from({ length: count }, () => new THREE.MeshBasicMaterial({ color: glow(color, 1.6), ...ADD, opacity: 0 })), [count, color]);
  useDispose(geo, mats);
  const beams = useMemo(
    () =>
      mats.map((_, i) => {
        const a = (i / count) * Math.PI * 2;
        const r = radius * (0.3 + ((i * 0.618) % 1) * 0.7);
        const hit = new THREE.Vector3(at[0] + Math.cos(a) * r, at[1], at[2] + Math.sin(a) * r);
        return { pos: hit.clone().addScaledVector(d, length / 2), quat: new THREE.Quaternion().setFromUnitVectors(UP, d) };
      }),
    [mats, at, radius, count, d, length]
  );
  const intro = useIntro();
  useFrame(({ clock }) => mats.forEach((m, i) => (m.opacity = (0.12 + 0.1 * Math.sin(clock.elapsedTime * 2 + i * 1.7)) * intro.current)));
  return beams.map((b, i) => <mesh key={i} geometry={geo} material={mats[i]} position={b.pos} quaternion={b.quat} raycast={NOOP} />);
}

// motes drifting up (energy off the panels, air out of the handlers)
export function Rising({ at, spread = 4, count = 24, height = 7, color = "#ffd23f", speed = 1.6, size = 0.16 }) {
  const geo = useMemo(() => new THREE.IcosahedronGeometry(size, 0), [size]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow(color, 3), ...ADD }), [color]);
  useDispose(geo, mat);
  const ref = useRef();
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => [Math.cos(i * 2.4) * spread * ((i * 0.37) % 1), Math.sin(i * 2.4) * spread * ((i * 0.37) % 1), (i * 0.618) % 1]), [count, spread]);
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  useFrame(({ clock }) => {
    seeds.forEach(([dx, dz, ph], i) => {
      const p = (clock.elapsedTime * speed / height + ph) % 1;
      const s = Math.sin(p * Math.PI);
      m4.makeScale(s, s, s).setPosition(at[0] + dx, at[1] + p * height, at[2] + dz);
      ref.current.setMatrixAt(i, m4);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, count]} raycast={NOOP} frustumCulled={false} />;
}

// a camera's field of view sweeping to and fro over its target
export function Cone({ at, target, length = 18, spread = 0.38, sweep = 0.4, color = "#ff5a4d" }) {
  const geo = useMemo(() => new THREE.ConeGeometry(Math.tan(spread) * length, length, 32, 1, true).translate(0, -length / 2, 0), [length, spread]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow(color, 1.5), ...ADD, opacity: 0.16 }), [color]);
  useDispose(geo, mat);
  const ref = useRef();
  const base = useMemo(() => {
    const d = new THREE.Vector3(...target).sub(new THREE.Vector3(...at)).normalize();
    return { yaw: Math.atan2(d.x, d.z), pitch: Math.acos(Math.min(1, -d.y)) };
  }, [at, target]);
  useFrame(({ clock }) => ref.current.rotation.set(0, base.yaw + Math.sin(clock.elapsedTime * 0.6) * sweep, 0));
  return (
    <group ref={ref} position={at}>
      <mesh geometry={geo} material={mat} rotation={[-base.pitch, 0, 0]} raycast={NOOP} />
    </group>
  );
}

// AI detection boxes that follow the people walking near a point; reports how many it sees
export function DetectBoxes({ movers, center, radius = 16, max = 6, color = "#ff5a4d", onCount }) {
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.9, 1.95, 0.9)).translate(0, 0.98, 0), []);
  const mat = useMemo(() => new THREE.LineBasicMaterial({ color: glow(color, 2.4), toneMapped: false }), [color]);
  useDispose(geo, mat);
  const refs = useRef([]);
  const last = useRef(-1);
  const walkers = useMemo(() => movers.filter((m) => m.userData.walk), [movers]);
  useFrame(({ clock }) => {
    const near = walkers.filter((w) => Math.hypot(w.position.x - center[0], w.position.z - center[2]) < radius).slice(0, max);
    refs.current.forEach((b, i) => {
      if (!b) return;
      b.visible = i < near.length;
      if (b.visible) {
        b.position.set(near[i].position.x, near[i].position.y, near[i].position.z);
        b.scale.setScalar(1 + Math.sin(clock.elapsedTime * 6 + i) * 0.03);
      }
    });
    if (near.length !== last.current) {
      last.current = near.length;
      onCount?.(near.length);
    }
  });
  return Array.from({ length: max }, (_, i) => <lineSegments key={i} ref={(o) => (refs.current[i] = o)} geometry={geo} material={mat} visible={false} raycast={NOOP} />);
}

// guidance arrows gliding along a path on the ground
export function Chevrons({ points, color = "#4dff9a", spacing = 2.2, speed = 3 }) {
  const path = useMemo(() => {
    const pts = points.map((p) => new THREE.Vector3(...p));
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
    return { pts, cum, total: cum[cum.length - 1] };
  }, [points]);
  const geo = useMemo(() => {
    const s = new THREE.Shape([new THREE.Vector2(-0.6, -0.5), new THREE.Vector2(0, 0.3), new THREE.Vector2(0.6, -0.5), new THREE.Vector2(0.6, -0.05), new THREE.Vector2(0, 0.75), new THREE.Vector2(-0.6, -0.05)]);
    return new THREE.ShapeGeometry(s).rotateX(-Math.PI / 2);
  }, []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow(color, 2.6), ...ADD }), [color]);
  useDispose(geo, mat);
  const n = Math.floor(path.total / spacing);
  const refs = useRef([]);
  useFrame(({ clock }) =>
    refs.current.forEach((m, k) => {
      if (!m) return;
      const d = (k * spacing + clock.elapsedTime * speed) % path.total;
      let i = 1;
      while (i < path.cum.length - 1 && path.cum[i] < d) i++;
      const a = path.pts[i - 1];
      const b = path.pts[i];
      m.position.lerpVectors(a, b, (d - path.cum[i - 1]) / (path.cum[i] - path.cum[i - 1] || 1));
      m.rotation.y = Math.atan2(b.x - a.x, b.z - a.z) + Math.PI;
      mat.opacity = 0.9;
    })
  );
  return Array.from({ length: n }, (_, k) => <mesh key={k} ref={(o) => (refs.current[k] = o)} geometry={geo} material={mat} raycast={NOOP} />);
}

// a scan line sweeping up and down a face terminal
export function Scan({ at, width = 0.5, height = 0.5, color = "#4dff9a" }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow(color, 3), ...ADD }), [color]);
  useDispose(mat);
  const ref = useRef();
  useFrame(({ clock }) => (ref.current.position.y = at[1] + Math.sin(clock.elapsedTime * 3) * height * 0.5));
  return (
    <mesh ref={ref} position={at} material={mat} raycast={NOOP}>
      <boxGeometry args={[width, 0.03, 0.03]} />
    </mesh>
  );
}

// every LED in the scene joins a chasing light show; restored when the reaction ends
export function LedShow({ leds, t }) {
  useEffect(() => () => leds.forEach((l) => l.mesh.material.color.copy(l.base)), [leds]);
  useFrame(() => leds.forEach((l) => l.mesh.material.color.copy(l.base).multiplyScalar(0.3 + 1.6 * Math.max(0, Math.sin(t.current * 2.5 - l.at.x * 0.12 - l.at.z * 0.05)))));
  return null;
}

// motion sensors: a detection cone under each one that flares when someone walks beneath it
export function SensorCones({ sensors, movers, color = "#5ee7ff", onDetect }) {
  const geo = useMemo(() => new THREE.ConeGeometry(2.6, 5.6, 28, 1, true).translate(0, -2.8, 0), []);
  const mats = useMemo(() => sensors.map(() => new THREE.MeshBasicMaterial({ color: glow(color, 1.6), ...ADD, opacity: 0.08 })), [sensors, color]);
  useDispose(geo, mats);
  const walkers = useMemo(() => movers.filter((m) => m.userData.walk), [movers]);
  const hit = useRef(false);
  useFrame(({ clock }, dt) => {
    let any = false;
    sensors.forEach((s, i) => {
      const near = walkers.some((w) => Math.hypot(w.position.x - s[0], w.position.z - s[2]) < 3.2);
      any ||= near;
      mats[i].opacity = THREE.MathUtils.damp(mats[i].opacity, near ? 0.38 : 0.07 + 0.04 * Math.sin(clock.elapsedTime * 3 + i), 6, dt);
    });
    if (any !== hit.current) {
      hit.current = any;
      onDetect?.(any);
    }
  });
  return sensors.map((s, i) => <mesh key={i} geometry={geo} material={mats[i]} position={s} rotation={[Math.PI, 0, 0]} raycast={NOOP} />);
}
