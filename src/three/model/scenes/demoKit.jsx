// Building blocks shared by the scene demos (02 hospital, 03 learning, ...): one-shot scenario phases, tinting
// the baked model, cloned walkers the demo can steer, things that follow movers, and the dock's segment control.
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { along, stride, useActor } from "./buildingDemos";
import dock from "./buildingDemos.module.css";
import cards from "./buildingDemos2.module.css";

export const NOOP = () => {};
export const ADD = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide };
export const glow = (c, k = 2) => new THREE.Color(c).multiplyScalar(k);
export const TH = (lang) => lang === "th";
export const now = () => Date.now();

// A one-shot scenario started by a dock button (stamp = Date.now()): phase = index of the last mark passed,
// -1 while idle and again after `end` seconds; t = seconds since the start. Stamps from before mounting are ignored.
export function usePhase(stamp, marks, end) {
  const mounted = useRef(stamp);
  const start = useRef(null);
  const t = useRef(-1);
  const [phase, setPhase] = useState(-1);
  useEffect(() => {
    if (stamp && stamp !== mounted.current) start.current = undefined;
  }, [stamp]);
  useFrame(({ clock }) => {
    if (start.current === undefined) start.current = clock.elapsedTime;
    t.current = start.current === null ? -1 : clock.elapsedTime - start.current;
    if (t.current > end) {
      start.current = null;
      t.current = -1;
    }
    let p = -1;
    if (t.current >= 0) {
      p = 0;
      while (p + 1 < marks.length && t.current >= marks[p + 1]) p++;
    }
    if (p !== phase) setPhase(p);
  });
  return [phase, t];
}

// eases the whole baked model (not the site) toward base colour x target() (null = back to normal); restores on unmount
export function useTint(materials, target) {
  const room = useMemo(() => materials.filter((m) => m.userData.atlas !== "site"), [materials]);
  const tmp = useMemo(() => new THREE.Color(), []);
  useEffect(() => () => room.forEach((m) => m.color.copy(m.userData.base)), [room]);
  useFrame((_, dt) => {
    const c = target();
    const k = 1 - Math.exp(-dt * 3);
    room.forEach((m) => m.color.lerp(c ? tmp.copy(m.userData.base).multiply(c) : m.userData.base, k));
  });
}

// a clone of one particular walker of the model (by name), so the demo can choose who plays the part
export function useWalker(movers, name) {
  const list = useMemo(() => {
    const m = movers.find((o) => o.name === name);
    return m ? [m] : movers;
  }, [movers, name]);
  return useActor(list);
}

export function place(actor, route, d, t, speed, moving = true) {
  const yaw = along(route, d, actor.o.position);
  actor.o.rotation.set(0, yaw, 0);
  actor.o.position.y += stride(actor, t, speed, moving);
}

// a group that sticks to a moving object each frame (for tags and effects that follow robots and drones);
// within = [half x, half z] or (position) => bool: children unmount while it is false (Html tags ignore `visible`)
export function Follow({ target, children, dy = 0, within, turn = false }) {
  const ref = useRef();
  const [inside, setInside] = useState(true);
  useFrame(() => {
    if (ref.current && target) {
      const p = ref.current.position;
      target.getWorldPosition(p);
      p.y += dy;
      if (turn) target.getWorldQuaternion(ref.current.quaternion); // turn: children face where the object heads (+x)
      const ok = !within || (typeof within === "function" ? within(p) : Math.abs(p.x) < within[0] && Math.abs(p.z) < within[1]);
      if (ok !== inside) setInside(ok);
    }
  });
  return <group ref={ref}>{inside && children}</group>;
}

// a `within` for Follow: true while the point projects into the clear middle of the page, clear of the title, the
// Try-it dock (bottom left) and the info panel (right) of the desktop layout; a centred tag needs ~0.1 of the width per side
export function useClearSpot() {
  const camera = useThree((s) => s.camera);
  return useMemo(() => {
    const v = new THREE.Vector3();
    return (p) => {
      v.copy(p).project(camera);
      const x = (v.x + 1) / 2, y = (1 - v.y) / 2;
      return x > 0.08 && x < 0.56 && y > 0.18 && y < 0.84 && !(x < 0.38 && y > 0.5);
    };
  }, [camera]);
}

// a detection box (edges) that follows the object in `at` (a ref)
export function Box({ at, size = [0.9, 1.9, 0.9], offset = [0, 0, 0], color = "#ff4d4d" }) {
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(...size)).translate(0, size[1] / 2, 0), [size]);
  const mat = useMemo(() => new THREE.LineBasicMaterial({ color: glow(color, 2.6), toneMapped: false }), [color]);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  const ref = useRef();
  useFrame(() => at?.current && ref.current.position.copy(at.current.position).add({ x: offset[0], y: offset[1], z: offset[2] }));
  return <lineSegments ref={ref} geometry={geo} material={mat} raycast={NOOP} />;
}

// small glowing balls that pop up over a list of points: shown(i) (0..1) decides each one's size, colors(i) its colour
export function Pops({ points, shown, colors, size = 0.14, dy = 0.5 }) {
  const geo = useMemo(() => new THREE.SphereGeometry(size, 12, 10), [size]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), []);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  const ref = useRef();
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  const c = useMemo(() => new THREE.Color(), []);
  useFrame(({ clock }) => {
    const mesh = ref.current;
    points.forEach((p, i) => {
      const s = shown(i) * (1 + 0.12 * Math.sin(clock.elapsedTime * 6 + i));
      m4.makeScale(s, s, s).setPosition(p[0], p[1] + dy, p[2]);
      mesh.setMatrixAt(i, m4);
      mesh.setColorAt(i, c.set(colors(i)).multiplyScalar(2.4));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, points.length]} frustumCulled={false} raycast={NOOP} />;
}

// segmented control for the dock; `danger` names the option that shows the risky case (red when picked)
export function Seg({ items, value, onPick, danger }) {
  return (
    <div className={dock.segment}>
      {Object.entries(items).map(([k, name]) => (
        <button key={k} type="button" className={value === k ? (k === danger ? dock.segDanger : dock.segOn) : undefined} aria-pressed={value === k} onClick={() => onPick(k)}>
          {name}
        </button>
      ))}
    </div>
  );
}

// a stand-in person (the demos need someone at a spot the model has no one)
export function Figure({ at, color = "#ff6b6b" }) {
  const body = useMemo(() => new THREE.CapsuleGeometry(0.22, 1.0, 4, 12), []);
  const head = useMemo(() => new THREE.SphereGeometry(0.15, 16, 12), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6, roughness: 0.6 }), [color]);
  useEffect(() => () => [body, head, mat].forEach((x) => x.dispose()), [body, head, mat]);
  return (
    <group position={at}>
      <mesh geometry={body} material={mat} position={[0, 0.72, 0]} raycast={NOOP} />
      <mesh geometry={head} material={mat} position={[0, 1.55, 0]} raycast={NOOP} />
    </group>
  );
}

// the edges of a box (size in three.js x, y, z) standing on `at`
export function Wire({ at, size, color = "#ff4d4d" }) {
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(...size)).translate(0, size[1] / 2, 0), [size]);
  const mat = useMemo(() => new THREE.LineBasicMaterial({ color: glow(color, 2.6), toneMapped: false }), [color]);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  return <lineSegments geometry={geo} material={mat} position={at} raycast={NOOP} />;
}

// radio links that follow moving ends: pairs() returns [[Vector3, Vector3], ...] each frame; each is a thin glowing
// tube (1 px lines vanish at this distance) with a dot running along it
export function LinkLines({ pairs, color = "#5ee7ff", max = 40 }) {
  const tubeGeo = useMemo(() => new THREE.CylinderGeometry(0.07, 0.07, 1, 6, 1, true).translate(0, 0.5, 0), []);
  const tubeMat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow(color, 1.8), transparent: true, opacity: 0.75, toneMapped: false }), [color]);
  const dotGeo = useMemo(() => new THREE.SphereGeometry(0.26, 10, 8), []);
  const dotMat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow(color, 3), toneMapped: false }), [color]);
  useEffect(() => () => [tubeGeo, tubeMat, dotGeo, dotMat].forEach((x) => x.dispose()), [tubeGeo, tubeMat, dotGeo, dotMat]);
  const tubes = useRef();
  const dots = useRef();
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const d = useMemo(() => new THREE.Vector3(), []);
  const s = useMemo(() => new THREE.Vector3(), []);
  const p = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const zero = useMemo(() => new THREE.Matrix4().makeScale(0, 0, 0), []);
  useFrame(({ clock }) => {
    const list = pairs().slice(0, max);
    list.forEach(([a, b], i) => {
      d.subVectors(b, a);
      const len = d.length();
      q.setFromUnitVectors(up, d.normalize());
      tubes.current.setMatrixAt(i, m4.compose(a, q, s.set(1, len, 1)));
      p.lerpVectors(a, b, (clock.elapsedTime * 0.8 + i * 0.37) % 1);
      dots.current.setMatrixAt(i, m4.makeTranslation(p.x, p.y, p.z));
    });
    for (let i = list.length; i < max; i++) {
      tubes.current.setMatrixAt(i, zero);
      dots.current.setMatrixAt(i, zero);
    }
    tubes.current.instanceMatrix.needsUpdate = true;
    dots.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <instancedMesh ref={tubes} args={[tubeGeo, tubeMat, max]} frustumCulled={false} raycast={NOOP} />
      <instancedMesh ref={dots} args={[dotGeo, dotMat, max]} frustumCulled={false} raycast={NOOP} />
    </group>
  );
}

// the dock's stat card: rows of [label, value, fraction 0..1, colour]
export function Bars({ rows }) {
  return (
    <div className={cards.card}>
      {rows.map(([k, v, f, c]) => (
        <div key={k} className={cards.bar}>
          <span>{k}</span>
          <i>
            <u style={{ width: `${f * 100}%`, background: c }} />
          </i>
          <b>{v}</b>
        </div>
      ))}
    </div>
  );
}
