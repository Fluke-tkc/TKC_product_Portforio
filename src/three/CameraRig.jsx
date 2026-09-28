import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { prefersReducedMotion } from "../components/ui/WebGLBoundary";

const IDLE_MS = 6000;
const TMP2 = new THREE.Vector2();

// Drives the camera between the overview and a focused hotspot, and adds a slow idle sway.
// `viewShift` ([x, y] px) shifts the frustum so the focus sits beside the info panel instead of under it.
export function CameraRig({ homeDist, focus, viewShift = [0, 0] }) {
  const controls = useThree((s) => s.controls);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const goal = useRef(null);
  const interacting = useRef(false);
  const lastInteraction = useRef(performance.now());
  const shift = useRef(new THREE.Vector2());
  const spherical = useRef(new THREE.Spherical());
  const offset = useRef(new THREE.Vector3());
  const reduceMotion = useRef(prefersReducedMotion());

  useEffect(() => {
    if (!controls) return;
    const start = () => {
      interacting.current = true;
      goal.current = null;
    };
    const end = () => {
      interacting.current = false;
      lastInteraction.current = performance.now();
    };
    controls.addEventListener("start", start);
    controls.addEventListener("end", end);
    return () => {
      controls.removeEventListener("start", start);
      controls.removeEventListener("end", end);
    };
  }, [controls]);

  useEffect(() => {
    if (focus) {
      const target = focus.clone();
      const dir = new THREE.Vector3(target.x * 0.02, target.y * 0.02, 1).normalize();
      goal.current = { target, pos: target.clone().addScaledVector(dir, homeDist * 0.55) };
    } else {
      goal.current = { target: new THREE.Vector3(0, 0, 0), pos: new THREE.Vector3(0, 0, homeDist) };
    }
    lastInteraction.current = performance.now();
  }, [focus, homeDist]);

  useFrame((state, dt) => {
    if (!controls) return;
    const k = 1 - Math.exp(-dt * 2.6);
    const g = goal.current;
    if (g) {
      camera.position.lerp(g.pos, k);
      controls.target.lerp(g.target, k);
      if (camera.position.distanceToSquared(g.pos) < 1e-4 && controls.target.distanceToSquared(g.target) < 1e-4) {
        goal.current = null;
      }
    } else if (!reduceMotion.current && !interacting.current && !focus && performance.now() - lastInteraction.current > IDLE_MS) {
      const t = state.clock.elapsedTime;
      offset.current.copy(camera.position).sub(controls.target);
      spherical.current.setFromVector3(offset.current);
      spherical.current.theta += (Math.sin(t * 0.18) * 0.16 - spherical.current.theta) * dt * 0.6;
      spherical.current.phi += (Math.PI / 2 - Math.sin(t * 0.13) * 0.05 - spherical.current.phi) * dt * 0.6;
      offset.current.setFromSpherical(spherical.current);
      camera.position.copy(controls.target).add(offset.current);
    }

    shift.current.lerp(TMP2.set(viewShift[0], viewShift[1]), k);
    if (shift.current.lengthSq() > 0.25) {
      camera.setViewOffset(size.width, size.height, shift.current.x, shift.current.y, size.width, size.height);
    } else if (camera.view && camera.view.enabled) {
      camera.clearViewOffset();
    }
    controls.update();
  });

  return null;
}
