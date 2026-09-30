// Glowing pipe along a polyline with dashes flowing through it: energy, chilled water, air, data.
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const vertex = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const fragment = `uniform float time; uniform float speed; uniform float len; uniform vec3 color; uniform float alpha; varying vec2 vUv;
  void main(){
    float d = fract(vUv.x * len - time * speed);
    float dash = smoothstep(0.0, 0.12, d) * smoothstep(0.55, 0.3, d);
    gl_FragColor = vec4(color * (0.55 + 2.6 * dash), (0.3 + 0.7 * dash) * alpha);
  }`;

// speed: dashes per second along the pipe (negative runs backwards); may be a function of time for live values.
// on: fades the pipe in and out; tint: optional function returning the colour each frame.
export function Flow({ points, color = "#ffd23f", radius = 0.14, speed = 1, on = true, tint, dash = 1.8 }) {
  const { geo, mat } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.05);
    const len = curve.getLength();
    return {
      geo: new THREE.TubeGeometry(curve, Math.max(24, Math.round(len * 2.5)), radius, 8),
      mat: new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 }, speed: { value: 1 }, len: { value: len / dash }, color: { value: new THREE.Color(color) }, alpha: { value: 0 } },
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    };
  }, [points, color, radius, dash]);
  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat]
  );
  useFrame(({ clock }, dt) => {
    const u = mat.uniforms;
    u.time.value = clock.elapsedTime;
    u.speed.value = typeof speed === "function" ? speed() : speed;
    u.alpha.value = THREE.MathUtils.damp(u.alpha.value, on ? 1 : 0, 4, dt);
    if (tint) u.color.value.copy(tint());
  });
  return <mesh geometry={geo} material={mat} renderOrder={6} raycast={() => {}} />;
}
