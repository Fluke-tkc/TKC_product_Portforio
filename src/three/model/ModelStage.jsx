import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Bloom, BrightnessContrast, EffectComposer, HueSaturation, N8AO, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { HotspotPins } from "../HotspotPins";
import { prefersReducedMotion } from "../../components/ui/WebGLBoundary";

// ---------- hotspot objects: hover outline + click to select ----------

const HotContext = createContext({ setHovered: () => {}, select: () => {}, register: () => {} });

export function Hot({ id, children }) {
  const { setHovered, select, register } = useContext(HotContext);
  return (
    <group
      ref={(g) => register(id, g)}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(id);
      }}
      onPointerOut={() => setHovered((h) => (h === id ? null : h))}
      onClick={(e) => {
        e.stopPropagation();
        if (e.delta < 6) select(id);
      }}
    >
      {children}
    </group>
  );
}

// Fresnel "hologram" rim drawn over the hovered / selected hotspot. Attached as a child of each
// mesh so it follows animation, and shares instance matrices so instanced meshes glow too.
const highlightMaterial = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  toneMapped: false,
  uniforms: { time: { value: 0 }, color: { value: new THREE.Color("#5ee7ff") } },
  vertexShader: `varying vec3 vN; varying vec3 vV;
    void main(){
      vec4 p = vec4(position + normal * 0.03, 1.0);
      vec3 n = normal;
      #ifdef USE_INSTANCING
        p = instanceMatrix * p;
        n = mat3(instanceMatrix) * n;
      #endif
      vec4 mv = modelViewMatrix * p;
      vN = normalize(normalMatrix * n);
      vV = -mv.xyz;
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: `uniform float time; uniform vec3 color; varying vec3 vN; varying vec3 vV;
    void main(){
      float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);
      float pulse = 0.7 + 0.3 * sin(time * 3.0);
      gl_FragColor = vec4(color * (0.1 + f * 2.2) * pulse, 1.0);
    }`,
});

function useHighlight(meshes) {
  useEffect(() => {
    const overlays = meshes.map((m) => {
      const o = m.isInstancedMesh ? new THREE.InstancedMesh(m.geometry, highlightMaterial, m.count) : new THREE.Mesh(m.geometry, highlightMaterial);
      if (m.isInstancedMesh) o.instanceMatrix = m.instanceMatrix;
      o.raycast = () => {};
      o.renderOrder = 10;
      o.frustumCulled = false;
      m.add(o);
      return [m, o];
    });
    return () => overlays.forEach(([m, o]) => m.remove(o));
  }, [meshes]);
  useFrame((_, dt) => (highlightMaterial.uniforms.time.value += dt));
}

// ---------- backdrop ----------

const NIGHT = ["#061a3a", "#12386b", "#030d1f"];

function Backdrop({ colors = NIGHT }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { top: { value: new THREE.Color(colors[0]) }, mid: { value: new THREE.Color(colors[1]) }, bottom: { value: new THREE.Color(colors[2]) } },
        vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vP;
          void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(mid, top, smoothstep(0.0, 0.6, h)) : mix(mid, bottom, smoothstep(0.0, 0.35, -h));
          gl_FragColor = vec4(c, 1.0); }`,
      }),
    [colors]
  );
  return (
    <mesh material={material} renderOrder={-10}>
      <sphereGeometry args={[600, 32, 16]} />
    </mesh>
  );
}

// ---------- camera ----------

const IDLE_MS = 7000;
const TMP = new THREE.Vector2();

// Portrait screens see far less width, so pull the camera back along its view direction.
function fitView({ position, target }, aspect, maxFactor) {
  const k = aspect >= 1.2 ? 1 : Math.min(maxFactor, 1.25 / aspect);
  const t = new THREE.Vector3(...target);
  return { target: t, pos: new THREE.Vector3(...position).sub(t).multiplyScalar(k).add(t) };
}

function CameraRig({ home, focus, viewShift }) {
  const controls = useThree((s) => s.controls);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const goal = useRef(null);
  const interacting = useRef(false);
  const lastInteraction = useRef(performance.now());
  const shift = useRef(new THREE.Vector2());
  const reduceMotion = useRef(prefersReducedMotion());

  useEffect(() => {
    if (!controls) return;
    const start = () => {
      interacting.current = true;
      goal.current = null;
      controls.autoRotate = false;
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

  const aspect = size.width / size.height;
  useEffect(() => {
    goal.current = focus ? fitView(focus, aspect, 1.5) : fitView(home, aspect, 1.9);
    lastInteraction.current = performance.now();
    if (controls) controls.autoRotate = false;
  }, [focus, home, controls, aspect]);

  useFrame((state, dt) => {
    if (!controls) return;
    const k = 1 - Math.exp(-dt * 2.2);
    const g = goal.current;
    if (g) {
      camera.position.lerp(g.pos, k);
      controls.target.lerp(g.target, k);
      if (camera.position.distanceToSquared(g.pos) < 0.02 && controls.target.distanceToSquared(g.target) < 0.02) goal.current = null;
    } else if (!focus && !interacting.current && !reduceMotion.current && performance.now() - lastInteraction.current > IDLE_MS) {
      controls.autoRotate = true;
    }
    shift.current.lerp(TMP.set(viewShift[0], viewShift[1]), k);
    if (shift.current.lengthSq() > 0.25) camera.setViewOffset(size.width, size.height, shift.current.x, shift.current.y, size.width, size.height);
    else if (camera.view?.enabled) camera.clearViewOffset();
    controls.update();
  });
  return null;
}

// ---------- stage ----------

export function ModelStage({ scene, hotspots, activeIndex, onSelect, isNarrow }) {
  // baked scenes (Blender lightmaps) carry their own light and AO; anchors come from pins in the glTF
  const { Component, home, maxDistance = 260, baked, sky, grade } = scene;
  const [anchors, setAnchors] = useState(scene.anchors || {});
  const [hovered, setHovered] = useState(null);
  const occluder = useRef();
  const group = useRef();
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const activeId = activeIndex >= 0 ? hotspots[activeIndex].id : null;

  useEffect(() => {
    // intro: start high and far, then the rig glides to the home view
    camera.position.set(home.position[0] * 1.5, home.position[1] * 2.2, home.position[2] * 1.5);
    camera.lookAt(...home.target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);

  const groups = useRef({});
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const ctx = useMemo(
    () => ({
      setHovered,
      select: (id) => onSelect(hotspots.findIndex((h) => h.id === id)),
      register: (id, g) => {
        if (g) groups.current[id] = g;
      },
    }),
    [onSelect, hotspots]
  );
  // Meshes of the hovered / selected hotspot, handed straight to the outline effect.
  const outlined = useMemo(() => {
    const out = [];
    new Set([hovered, activeId]).forEach((id) => id && groups.current[id]?.traverse((o) => o.isMesh && !o.userData.noHighlight && o.material !== highlightMaterial && out.push(o)));
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovered, activeId, mounted]);
  useHighlight(outlined);

  const pins = useMemo(() => hotspots.filter((h) => anchors[h.id]).map((h) => ({ id: h.id, title: h.title, position: anchors[h.id].pin })), [hotspots, anchors]);
  const focus = (activeId && anchors[activeId]) || null;
  const viewShift = !focus ? [0, 0] : isNarrow ? [0, size.height * 0.19] : [Math.min(420, size.width * 0.4) / 2 + 12, 0];

  useEffect(() => {
    // Only the hero structure hides pins behind it; raycasting the whole diorama every frame is wasteful.
    occluder.current = group.current?.getObjectByName("occluder") || group.current;
  });

  return (
    <HotContext.Provider value={ctx}>
      <Backdrop colors={sky} />
      {!baked && <hemisphereLight args={["#cfe3ff", "#b9a88f", 0.25]} />}
      {!baked && <directionalLight
        castShadow
        position={[70, 95, 55]}
        intensity={1.9}
        color="#fff0d8"
        shadow-mapSize={[isNarrow ? 1024 : 2048, isNarrow ? 1024 : 2048]}
        shadow-camera-left={-95}
        shadow-camera-right={95}
        shadow-camera-top={95}
        shadow-camera-bottom={-95}
        shadow-camera-near={10}
        shadow-camera-far={320}
        shadow-bias={-0.0004}
        shadow-normalBias={0.05}
      />}
      <Environment resolution={256} frames={1} environmentIntensity={0.45}>
        <color attach="background" args={[baked ? "#a9c4e0" : "#1a2e4a"]} />
        {baked && <Backdrop colors={sky} />}
        <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[0, 80, 0]} rotation-x={Math.PI / 2} scale={[120, 120, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ffd9a8" position={[120, 30, 60]} target={[0, 0, 0]} scale={[100, 30, 1]} />
        <Lightformer form="rect" intensity={1.1} color="#9fd0ff" position={[-120, 25, -40]} target={[0, 0, 0]} scale={[100, 30, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#5ee7ff" position={[0, 20, -140]} scale={40} />
      </Environment>

      <group ref={group}>
        <Component onAnchors={setAnchors} />
      </group>

      <HotspotPins pins={pins} activeIndex={activeIndex} visible onSelect={onSelect} occlude={[occluder]} />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.07}
        rotateSpeed={0.55}
        zoomSpeed={0.8}
        autoRotateSpeed={0.45}
        minDistance={4}
        maxDistance={maxDistance * (size.width < size.height ? 1.9 : 1)}
        minPolarAngle={0.12}
        maxPolarAngle={1.38}
      />
      <CameraRig home={home} focus={focus} viewShift={viewShift} />

      <EffectComposer multisampling={0} disableNormalPass>
        {!isNarrow && !baked && <N8AO aoRadius={3} intensity={2.2} distanceFalloff={1.2} halfRes quality="medium" />}
        {/* baked scenes reach ~1.5 on sunlit white; only the LEDs should glow */}
        <Bloom mipmapBlur luminanceThreshold={baked ? 1.6 : 1.1} luminanceSmoothing={0.1} intensity={baked ? 1.1 : 0.7} />
        <ToneMapping mode={baked ? ToneMappingMode.NEUTRAL : ToneMappingMode.ACES_FILMIC} />
        {/* per-scene colour grade: the newer dioramas ask for a more vivid look */}
        {grade && <HueSaturation saturation={grade.saturation ?? 0} />}
        {grade && <BrightnessContrast brightness={grade.brightness ?? 0} contrast={grade.contrast ?? 0} />}
        <Vignette offset={0.28} darkness={baked ? 0.35 : 0.55} />
        <SMAA />
      </EffectComposer>
    </HotContext.Provider>
  );
}
