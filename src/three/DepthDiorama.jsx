import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";

// The AI image is laid out WORLD_WIDTH units wide at z = 0; depth pushes pixels towards the camera.
export const WORLD_WIDTH = 16;
export const FOV = 35;
const HALF_FOV_TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

export function layoutFor(scene) {
  return { w: WORLD_WIDTH, h: WORLD_WIDTH / scene.aspect };
}

// Distance that frames the whole image in a viewport of the given aspect.
export function homeDistance(layout, viewportAspect) {
  const byHeight = layout.h / 2 / HALF_FOV_TAN;
  const byWidth = layout.w / 2 / (HALF_FOV_TAN * viewportAspect);
  // Portrait screens: fill the height and let the visitor pan sideways rather than
  // shrinking the scene to a thin strip.
  if (viewportAspect < 1) return byHeight * 1.08;
  return Math.max(byHeight, byWidth) * 1.02;
}

// Half-extent of the view at `dist`, used to keep panning inside the picture.
export function viewHalfSize(dist, viewportAspect) {
  const halfH = dist * HALF_FOV_TAN;
  return [halfH * viewportAspect, halfH];
}

function sampleDepth(depth, gw, gh, u, v, radius = 3) {
  const ci = Math.round(u * (gw - 1));
  const cj = Math.round(v * (gh - 1));
  let d = 0;
  for (let j = cj - radius; j <= cj + radius; j++) {
    for (let i = ci - radius; i <= ci + radius; i++) {
      if (i < 0 || j < 0 || i >= gw || j >= gh) continue;
      d = Math.max(d, depth[j * gw + i] / 65535);
    }
  }
  return d;
}

// World-space position of an image point (u, v in 0..1) on the displaced surface.
// Vertices are pulled toward the home camera (at refZ) so the front view reproduces the original image.
export function pointOnSurface(layout, refZ, depthScale, depthGrid, u, v) {
  const { w, h } = layout;
  const [gw, gh, data] = depthGrid;
  const z = sampleDepth(data, gw, gh, u, v) * depthScale;
  const shrink = (refZ - z) / refZ;
  return new THREE.Vector3((u - 0.5) * w * shrink, (0.5 - v) * h * shrink, z + 0.08);
}

function buildGeometry(data, gw, gh, w, h) {
  const n = gw * gh;
  const position = new Float32Array(n * 3);
  const uv = new Float32Array(n * 2);
  const aDepth = new Float32Array(n);
  const aEdge = new Float32Array(n);
  const at = (i, j) => data[Math.min(gh - 1, Math.max(0, j)) * gw + Math.min(gw - 1, Math.max(0, i))] / 65535;

  for (let j = 0; j < gh; j++) {
    for (let i = 0; i < gw; i++) {
      const k = j * gw + i;
      const u = i / (gw - 1);
      const v = j / (gh - 1);
      position[k * 3] = (u - 0.5) * w;
      position[k * 3 + 1] = (0.5 - v) * h;
      uv[k * 2] = u;
      uv[k * 2 + 1] = 1 - v;
      const d = at(i, j);
      aDepth[k] = d;
      let e = 0;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) e = Math.max(e, Math.abs(d - at(i + di, j + dj)));
      aEdge[k] = e;
    }
  }

  const index = new Uint32Array((gw - 1) * (gh - 1) * 6);
  let p = 0;
  for (let j = 0; j < gh - 1; j++) {
    for (let i = 0; i < gw - 1; i++) {
      const a = j * gw + i, b = a + 1, c = a + gw, d = c + 1;
      index.set([a, c, b, b, c, d], p);
      p += 6;
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(position, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setAttribute("aDepth", new THREE.BufferAttribute(aDepth, 1));
  g.setAttribute("aEdge", new THREE.BufferAttribute(aEdge, 1));
  g.setIndex(new THREE.BufferAttribute(index, 1));
  g.computeBoundingSphere();
  // Displacement happens in the shader, so pad the bounds to avoid frustum culling at glancing angles.
  g.boundingSphere.radius *= 1.5;
  return g;
}

const vertexShader = /* glsl */ `
  uniform float uDepth;
  uniform float uRefZ;
  uniform float uSweep;
  attribute float aDepth;
  attribute float aEdge;
  varying vec2 vUv;
  varying float vEdge;
  varying float vGrow;
  void main() {
    // Left-to-right "scan" that grows the relief during the intro.
    float grow = 1.0 - smoothstep(uSweep - 0.3, uSweep, uv.x);
    float z = aDepth * uDepth * grow;
    vec3 p = position;
    p.xy *= (uRefZ - z) / uRefZ;
    p.z = z;
    vUv = uv;
    vEdge = aEdge;
    vGrow = grow;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uEdge;
  uniform float uSweep;
  uniform vec3 uFade;
  uniform vec2 uFocus;
  uniform float uFocusAmt;
  uniform float uAspect;
  varying vec2 vUv;
  varying float vEdge;
  varying float vGrow;
  void main() {
    // Drop the triangles stretched across depth cliffs; the background layer shows through.
    if (vEdge * vGrow > uEdge) discard;
    vec3 col = texture2D(uMap, vUv).rgb;

    vec2 d = (vUv - uFocus) * vec2(uAspect, 1.0);
    float spot = smoothstep(0.42, 0.12, length(d));
    col *= mix(1.0, 0.38 + 0.62 * spot, uFocusAmt);

    float scan = exp(-pow((vUv.x - uSweep) / 0.012, 2.0)) * step(uSweep, 1.02);
    col += vec3(0.35, 0.85, 1.0) * scan * 0.9;

    float border = smoothstep(0.0, 0.015, vUv.x) * smoothstep(0.0, 0.015, 1.0 - vUv.x)
                 * smoothstep(0.0, 0.03, vUv.y) * smoothstep(0.0, 0.03, 1.0 - vUv.y);
    gl_FragColor = vec4(mix(uFade, col, border), 1.0);
    #include <colorspace_fragment>
  }
`;

export function useSceneAssets(scene) {
  const [color, bg] = useLoader(THREE.TextureLoader, [`${scene.base}/color.webp`, `${scene.base}/bg.webp`]);
  const buffer = useLoader(THREE.FileLoader, `${scene.base}/depth.bin`, (l) => l.setResponseType("arraybuffer"));
  const depthGrid = useMemo(() => [scene.grid[0], scene.grid[1], new Uint16Array(buffer)], [buffer, scene.grid]);
  useMemo(() => {
    for (const t of [color, bg]) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.needsUpdate = true;
    }
  }, [color, bg]);
  return { color, bg, depthGrid };
}

const FADE = new THREE.Color("#04152d");
const ORIGIN = new THREE.Vector3();
const TMP = new THREE.Vector3();

export function DepthDiorama({ scene, layout, refZ, depthScale, assets, focusUv, introStart }) {
  const { color, bg, depthGrid } = assets;
  const [gw, gh, data] = depthGrid;
  const geometry = useMemo(() => buildGeometry(data, gw, gh, layout.w, layout.h), [data, gw, gh, layout]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uMap: { value: color },
      uDepth: { value: depthScale },
      uRefZ: { value: refZ },
      uSweep: { value: -0.3 },
      uEdge: { value: 0.045 },
      uFade: { value: FADE.clone().convertSRGBToLinear() },
      uFocus: { value: new THREE.Vector2(0.5, 0.5) },
      uFocusAmt: { value: 0 },
      uAspect: { value: scene.aspect },
    }),
    [color, depthScale, scene.aspect]
  );
  uniforms.uRefZ.value = refZ;

  useFrame((state, dt) => {
    // Front-on, keep every triangle so the view matches the source image; open up depth
    // cliffs progressively as the camera swings away and the stretching becomes visible.
    const eye = state.camera.position;
    const target = state.controls?.target || ORIGIN;
    const off = TMP.copy(eye).sub(target).normalize();
    const angle = Math.acos(THREE.MathUtils.clamp(off.z, -1, 1));
    uniforms.uEdge.value = THREE.MathUtils.lerp(0.3, 0.055, THREE.MathUtils.smoothstep(angle, 0.03, 0.22));

    const t = (performance.now() - introStart) / 1000;
    uniforms.uSweep.value = THREE.MathUtils.clamp(-0.3 + t * 0.75, -0.3, 1.35);
    const k = 1 - Math.exp(-dt * 4);
    if (focusUv) uniforms.uFocus.value.lerp(new THREE.Vector2(focusUv[0], 1 - focusUv[1]), k);
    uniforms.uFocusAmt.value += ((focusUv ? 1 : 0) - uniforms.uFocusAmt.value) * k;
  });

  return (
    <group>
      <mesh position={[0, 0, -0.4]} scale={1.3} renderOrder={-1}>
        <planeGeometry args={[layout.w, layout.h]} />
        <meshBasicMaterial map={bg} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh geometry={geometry} frustumCulled={false}>
        <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
      </mesh>
    </group>
  );
}
