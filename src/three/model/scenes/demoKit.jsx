// Building blocks shared by the scene demos (02 hospital, 03 learning, ...): one-shot scenario phases, tinting
// the baked model, cloned walkers the demo can steer, things that follow movers, and the dock's segment control.
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { along, stride, useActor } from "./buildingDemos";
import dock from "./buildingDemos.module.css";

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

// a group that sticks to a moving object each frame (for tags and effects that follow robots and drones)
export function Follow({ target, children, dy = 0 }) {
  const ref = useRef();
  useFrame(() => {
    if (ref.current && target) {
      target.getWorldPosition(ref.current.position);
      ref.current.position.y += dy;
    }
  });
  return <group ref={ref}>{children}</group>;
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
