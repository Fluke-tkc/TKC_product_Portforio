// Second set of 01 Smart Building demos (from infographics P_1, P_2, P_4, P_7):
// renewable energy (weather, 24 h forecast, surplus trading on a blockchain), IoT (live sensor readings,
// 5G / Wi-Fi / LTE / LoRa, encryption on or off), motion sensors (infrared / ultrasonic / radar / 3D vision,
// edge vs cloud) and building automation (water network with a leak, predictive maintenance, dashboard).
// Coordinates from smart_building_v2.py (Blender x, y, z -> three.js x, z, -y).
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Flow } from "../flow";
import { Packets, Rays, Rings, Rising, SensorCones, Tag } from "../reactions";
import { along, path, stride, useActor } from "./buildingDemos";
import { demo, energyNow } from "./demoStore";
import styles from "./buildingDemos2.module.css";

const W = (x, y, z) => [x, z, -y];
const NOOP = () => {};
const ADD = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide };
const glow = (c, k = 2) => new THREE.Color(c).multiplyScalar(k);
const TH = (lang) => lang === "th";

// ---------------------------------------------------------------- 1 renewable energy

// multipliers on the energy model's solar and wind output and on the turbine's spin (normal: demo off);
// sky: tint of the whole baked scene (overcast days are darker)
export const WEATHER = {
  normal: { solar: 1, wind: 1, spin: 1 },
  sunny: { solar: 1.8, wind: 0.8, spin: 0.8, sky: new THREE.Color(1.06, 1.03, 0.96) },
  cloudy: { solar: 0.55, wind: 1, spin: 1, sky: new THREE.Color(0.66, 0.69, 0.75) },
  windy: { solar: 1.1, wind: 3.2, spin: 2.6, sky: new THREE.Color(0.9, 0.94, 1) },
  rain: { solar: 0.2, wind: 1.6, spin: 1.5, sky: new THREE.Color(0.42, 0.47, 0.56) },
};
const ARRAYS = [W(-8, 0.5, 32.9), W(9, 4.5, 34.1)];
const TOWERS = [W(16, 34.5, 64.4), W(-20, 35.5, 44.4)];
const ROOF = [W(9, 4.5, 36)];

function Clouds({ dark }) {
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 1), []);
  const mat = useMemo(() => new THREE.MeshLambertMaterial({ color: dark ? "#9aa3ad" : "#f4f6f8", flatShading: true, transparent: true, opacity: 0 }), [dark]);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  const puffs = useMemo(() => {
    const out = [];
    for (let c = 0; c < 5; c++)
      for (let k = 0; k < 6; k++) out.push({ c, dx: (k - 2.5) * 2.4 + Math.sin(k * 7) * 1.2, dy: Math.cos(k * 3) * 0.9, dz: Math.sin(k * 5) * 1.8, r: 2 + ((k * 37) % 5) * 0.35 });
    return out;
  }, []);
  const ref = useRef();
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  useFrame(({ clock }, dt) => {
    mat.opacity = Math.min(0.92, mat.opacity + dt * 0.8);
    puffs.forEach((p, i) => {
      const x = ((((p.c * 26 + clock.elapsedTime * 1.6) % 130) + 130) % 130) - 65 + p.dx;
      m4.makeScale(p.r, p.r * 0.7, p.r).setPosition(x, 46 + p.c * 1.6 + p.dy, -20 + p.c * 9 + p.dz);
      ref.current.setMatrixAt(i, m4);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, puffs.length]} frustumCulled={false} raycast={NOOP} />;
}

function Rain() {
  const geo = useMemo(() => new THREE.BoxGeometry(0.06, 1.6, 0.06), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#d6e8fa", transparent: true, opacity: 0.6, depthWrite: false }), []);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  const N = 1600;
  const drops = useMemo(() => Array.from({ length: N }, (_, i) => [((i * 97.13) % 84) - 42, ((i * 53.71) % 76) - 38, (i * 0.6180339) % 1]), []);
  const ref = useRef();
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  useFrame(({ clock }) => {
    drops.forEach(([x, z, ph], i) => {
      const y = 48 - ((clock.elapsedTime * 1.1 + ph) % 1) * 48;
      m4.makeTranslation(x, y, z);
      ref.current.setMatrixAt(i, m4);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, N]} frustumCulled={false} raycast={NOOP} />;
}

function Gusts() {
  const geo = useMemo(() => new THREE.PlaneGeometry(9, 0.08), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#dff4ff", 1.4), ...ADD, opacity: 0.35 }), []);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  const refs = useRef([]);
  useFrame(({ clock }) =>
    refs.current.forEach((m, i) => {
      if (!m) return;
      m.position.set(((((clock.elapsedTime * 14 + i * 17) % 110) + 110) % 110) - 55, 36 + (i % 4) * 2.4, -16 + (i % 5) * 6);
    })
  );
  return Array.from({ length: 14 }, (_, i) => <mesh key={i} ref={(o) => (refs.current[i] = o)} geometry={geo} material={mat} rotation={[0, 0, 0]} raycast={NOOP} />);
}

function forecast(weather) {
  const w = WEATHER[weather];
  const hours = Array.from({ length: 25 }, (_, h) => h);
  const solar = hours.map((h) => Math.max(0, Math.sin(((h - 6.2) / 12) * Math.PI)) * 150 * w.solar);
  const actual = solar.map((v, h) => (h <= 14 ? v * (0.96 + 0.07 * Math.sin(h * 1.3)) : null));
  const demand = hours.map((h) => 60 + 120 * Math.max(0, Math.sin(((h - 7) / 12) * Math.PI)) ** 0.6);
  return { solar, actual, demand };
}

function ForecastCard({ weather, lang }) {
  const f = useMemo(() => forecast(weather), [weather]);
  const X = (h) => 8 + (h / 24) * 204;
  const Y = (v) => 82 - (v / 200) * 72;
  const line = (arr) => arr.map((v, h) => (v == null ? null : `${X(h)},${Y(v)}`)).filter(Boolean).join(" ");
  const th = TH(lang);
  return (
      <div className={styles.card}>
        <div className={styles.cardHead}>{th ? "พยากรณ์โซลาร์ 24 ชม. · AI แม่นยำ 94%" : "24 h solar forecast · AI, 94% accurate"}</div>
        <svg width="220" height="92" viewBox="0 0 220 92">
          <line x1={X(14)} x2={X(14)} y1="6" y2="84" stroke="rgba(255,255,255,0.35)" strokeDasharray="3 3" />
          <polyline points={line(f.demand)} fill="none" stroke="#ff8a3d" strokeWidth="2" />
          <polyline points={line(f.solar)} fill="none" stroke="#ffd23f" strokeWidth="2" strokeDasharray="5 4" />
          <polyline points={line(f.actual)} fill="none" stroke="#ffd23f" strokeWidth="3" />
        </svg>
        <div className={styles.legend}>
          <span className={styles.sun}>━ {th ? "โซลาร์จริง" : "solar actual"}</span>
          <span className={styles.sun}>┅ {th ? "พยากรณ์" : "forecast"}</span>
          <span className={styles.load}>━ {th ? "ความต้องการ" : "demand"}</span>
        </div>
      </div>
  );
}

export function RenewableDemo({ anim, materials }) {
  const weather = demo.use((s) => s.weather);
  const trade = demo.use((s) => s.trade);
  const [selling, setSelling] = useState(false);
  const turbine = useMemo(() => anim.find((o) => o.name.includes("hawt")), [anim]);
  useEffect(() => {
    if (turbine) turbine.userData.mult = WEATHER[weather].spin;
    return () => turbine && (turbine.userData.mult = 1);
  }, [turbine, weather]);
  useEffect(() => () => materials.forEach((m) => m.color.copy(m.userData.base)), [materials]);
  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame((_, dt) => {
    const s = trade && energyNow.grid < -2;
    if (s !== selling) setSelling(s);
    const k = 1 - Math.exp(-dt * 2.5);
    materials.forEach((m) => m.color.lerp(tmp.copy(m.userData.base).multiply(WEATHER[weather].sky), k));
  });
  return (
    <group>
      {(weather === "sunny" || weather === "windy") && ARRAYS.map((a, i) => <Rays key={i} at={a} radius={4.5} />)}
      {weather === "sunny" && <Rising at={ARRAYS[1]} spread={5} color="#ffd23f" />}
      {(weather === "cloudy" || weather === "rain") && <Clouds dark={weather === "rain"} />}
      {weather === "rain" && <Rain />}
      {weather === "windy" && <Gusts />}
      {selling && TOWERS.map((to, i) => <Packets key={i} from={ROOF} to={to} color="#ffd23f" period={2.4} lift={10} />)}
    </group>
  );
}

// ---------------------------------------------------------------- 2 IoT

export const NETS = {
  "5g": { name: "5G", ms: 8, period: 1.2, color: "#5ee7ff" },
  wifi: { name: "Wi-Fi 6", ms: 14, period: 1.8, color: "#8f9bff" },
  lte: { name: "LTE", ms: 38, period: 3, color: "#74c0fc" },
  lora: { name: "LoRa", ms: 1200, period: 6, color: "#63e6be" },
};
// pods: name, centre x, y, roof height (Blender)
const POD_TOPS = [["A", -25.2, -6, 17.5], ["B", -10, -6.5, 21.7], ["C", 12, -5, 26.6], ["E", -22, 6, 24.8], ["D", -6.5, 1.5, 32], ["F", 12.5, 6, 33.2]];

const reading = (tick, i) => {
  const r = (k) => Math.sin(tick * 1.7 + i * 3.1 + k) * 0.5 + 0.5;
  return { temp: (23.4 + r(0) * 1.2).toFixed(1), rh: Math.round(52 + r(1) * 8), co2: Math.round(480 + r(2) * 260) };
};
function useTick(ms = 1300) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((v) => v + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
  return tick;
}

export function IotDemo({ pins }) {
  const { language } = useLanguage();
  const th = TH(language);
  const net = NETS[demo.use((s) => s.net)];
  const secure = demo.use((s) => s.secure);
  const tick = useTick();
  const mast = pins.iot;
  const sources = useMemo(() => POD_TOPS.map(([, x, y, z]) => W(x, y, z + 0.6)), []);
  const to = useMemo(() => mast && [mast.x, mast.y - 1.2, mast.z], [mast]);
  if (!mast) return null;
  const color = secure ? net.color : "#ff4d4d";
  const read = (i) => {
    const v = reading(tick, i);
    return `🌡 ${v.temp}°C · 💧 ${v.rh}% · CO₂ ${v.co2}`;
  };
  return (
    <group>
      <Rings at={to} radius={16} color={color} period={net.period * 1.6} />
      <Packets from={sources} to={to} color={color} period={net.period} />
      {POD_TOPS.map(([name, x, y, z], i) => (
        <Tag key={name} position={W(x, y, z + 1.2)}>
          <span className={styles.small}>
            {name} · {read(i)}
          </span>
        </Tag>
      ))}
      <Tag position={[mast.x, mast.y + 3, mast.z]}>
        {secure
          ? th
            ? `☁ คลาวด์ IoT · ${net.name} · หน่วง ${net.ms} ms · 🔒 AES-256`
            : `☁ IoT cloud · ${net.name} · ${net.ms} ms latency · 🔒 AES-256`
          : th
            ? "⚠ ส่งข้อมูลแบบไม่เข้ารหัส — ถูกดักอ่านได้"
            : "⚠ Unencrypted — anyone on the network can read it"}
      </Tag>
    </group>
  );
}

// ---------------------------------------------------------------- 4 motion sensors

const SENSORS = [[1, 6.1, 13], [4, 6.1, 13.7], [7, 6.1, 14.4]];
const AREA = new THREE.Vector3(4, 0.2, 13.7);
const MODES = {
  ir: { en: "Infrared (heat)", th: "อินฟราเรด (ความร้อน)" },
  ultra: { en: "Ultrasonic echo", th: "อัลตราโซนิก (คลื่นเสียง)" },
  radar: { en: "Radar sweep", th: "เรดาร์" },
  vision: { en: "3D stereo vision", th: "กล้อง 3D Vision" },
};

function useNear(movers, radius = 10) {
  const walkers = useMemo(() => movers.filter((m) => m.userData.walk), [movers]);
  return () => walkers.filter((w) => Math.hypot(w.position.x - AREA.x, w.position.z - AREA.z) < radius);
}

function HeatGlow({ movers }) {
  const near = useNear(movers);
  const geo = useMemo(() => new THREE.SphereGeometry(1, 16, 12), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#ff6a2a", 1.6), ...ADD, opacity: 0.45 }), []);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  const ref = useRef();
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  useFrame(({ clock }) => {
    const list = near();
    for (let i = 0; i < 10; i++) {
      const w = list[i];
      const s = w ? 1 + Math.sin(clock.elapsedTime * 5 + i) * 0.06 : 0;
      m4.makeScale(0.55 * s, 1.05 * s, 0.55 * s).setPosition(w ? w.position.x : 0, w ? w.position.y + 0.95 : -99, w ? w.position.z : 0);
      ref.current.setMatrixAt(i, m4);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, 10]} frustumCulled={false} raycast={NOOP} />;
}

function RadarSweep({ movers }) {
  const near = useNear(movers, 9);
  const fan = useMemo(() => new THREE.CircleGeometry(8, 32, 0, 0.6).rotateX(-Math.PI / 2), []);
  const disc = useMemo(() => mergeGeometries([2.7, 5.4, 8].map((r) => new THREE.RingGeometry(r - 0.07, r, 72).rotateX(-Math.PI / 2))), []);
  const fanMat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#51cf66", 1.8), ...ADD, opacity: 0.5 }), []);
  const blipGeo = useMemo(() => new THREE.CircleGeometry(0.55, 20).rotateX(-Math.PI / 2), []);
  const blipMat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#8cff9a", 3), ...ADD }), []);
  useEffect(() => () => [fan, disc, fanMat, blipGeo, blipMat].forEach((x) => x.dispose()), [fan, disc, fanMat, blipGeo, blipMat]);
  const sweep = useRef();
  const blips = useRef([]);
  const seen = useRef(new Map());
  useFrame(({ clock }) => {
    const a = (clock.elapsedTime * 1.8) % (Math.PI * 2);
    sweep.current.rotation.y = a;
    const t = clock.elapsedTime;
    near().forEach((w) => {
      const ang = (Math.atan2(-(w.position.z - AREA.z), w.position.x - AREA.x) + Math.PI * 2) % (Math.PI * 2);
      const d = (a - ang + Math.PI * 2) % (Math.PI * 2);
      if (d < 0.6) seen.current.set(w, { t, x: w.position.x, z: w.position.z });
    });
    let i = 0;
    seen.current.forEach((v) => {
      const b = blips.current[i++];
      if (!b) return;
      const age = t - v.t;
      b.visible = age < 2.2;
      b.position.set(v.x, 0.32, v.z);
      b.scale.setScalar(1 + age * 0.4);
    });
    for (; i < 10; i++) if (blips.current[i]) blips.current[i].visible = false;
  });
  return (
    <group>
      <mesh ref={sweep} geometry={fan} material={fanMat} position={[AREA.x, 0.3, AREA.z]} raycast={NOOP} />
      <mesh geometry={disc} material={fanMat} position={[AREA.x, 0.3, AREA.z]} raycast={NOOP} />
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} ref={(o) => (blips.current[i] = o)} geometry={blipGeo} material={blipMat} visible={false} raycast={NOOP} />
      ))}
    </group>
  );
}

function VisionMesh({ movers }) {
  const near = useNear(movers);
  const body = useMemo(() => new THREE.CapsuleGeometry(0.34, 1.1, 4, 10).translate(0, 0.9, 0), []);
  const geo = useMemo(() => new THREE.WireframeGeometry(body), [body]);
  const mat = useMemo(() => new THREE.LineBasicMaterial({ color: glow("#5ee7ff", 3), toneMapped: false }), []);
  const fill = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#5ee7ff", 1.2), ...ADD, opacity: 0.35 }), []);
  const grid = useMemo(() => {
    const g = new THREE.GridHelper(16, 32, "#5ee7ff", "#5ee7ff");
    g.material.transparent = true;
    g.material.opacity = 0.55;
    g.material.toneMapped = false;
    return g;
  }, []);
  useEffect(() => () => [body, geo, mat, fill, grid.geometry, grid.material].forEach((x) => x.dispose()), [body, geo, mat, fill, grid]);
  const refs = useRef([]);
  useFrame(() => {
    const list = near();
    refs.current.forEach((o, i) => {
      if (!o) return;
      const w = list[i];
      o.visible = !!w;
      if (w) o.position.copy(w.position);
    });
  });
  return (
    <group>
      <primitive object={grid} position={[AREA.x, 0.3, AREA.z]} />
      {Array.from({ length: 10 }, (_, i) => (
        <group key={i} ref={(o) => (refs.current[i] = o)} visible={false}>
          <lineSegments geometry={geo} material={mat} raycast={NOOP} />
          <mesh geometry={body} material={fill} raycast={NOOP} />
        </group>
      ))}
    </group>
  );
}

// a visitor strolling to and fro under the sensors, so there is always someone to detect
const STROLL = path([[-5, 0.2, 13.4], [1, 0.2, 13.1], [4, 0.2, 13.6], [7, 0.2, 14.2], [13, 0.2, 14.4]]);

export function MotionDemo({ movers }) {
  const { language } = useLanguage();
  const th = TH(language);
  const mode = demo.use((s) => s.sense);
  const edge = demo.use((s) => s.edge);
  const [hit, setHit] = useState(false);
  const actor = useActor(movers);
  const all = useMemo(() => {
    if (!actor) return movers;
    actor.o.userData.walk = 1;
    actor.o.visible = true;
    return [...movers, actor.o];
  }, [movers, actor]);
  useFrame(({ clock }) => {
    if (!actor) return;
    const t = clock.elapsedTime;
    const lap = (t * 1.2) % (STROLL.total * 2); // there and back, 1.2 m/s
    const back = lap > STROLL.total;
    const yaw = along(STROLL, back ? STROLL.total * 2 - lap : lap, actor.o.position);
    actor.o.rotation.set(0, back ? yaw + Math.PI : yaw, 0);
    actor.o.position.y += stride(actor, t, 1.2, true);
  });
  return (
    <group>
      {actor && <primitive object={actor.o} />}
      <SensorCones sensors={SENSORS} movers={all} onDetect={setHit} />
      {mode === "ir" && <HeatGlow movers={all} />}
      {mode === "ultra" && SENSORS.map((s, i) => <Rings key={i} at={[s[0], 0.25, s[2]]} radius={3.4} color="#8ce99a" period={0.9} />)}
      {mode === "radar" && <RadarSweep movers={all} />}
      {mode === "vision" && <VisionMesh movers={all} />}
      <Tag position={[4, 2.6, 12]}>
        {th ? MODES[mode].th : MODES[mode].en} · {hit ? (th ? "ตรวจพบ → เปิดไฟ" : "detected → lights on") : th ? "เฝ้าตรวจ…" : "watching…"} · {edge ? (th ? "Edge AI 8 ms" : "edge AI 8 ms") : th ? "คลาวด์ 120 ms" : "cloud 120 ms"}
      </Tag>
    </group>
  );
}

// ---------------------------------------------------------------- 7 building automation

const TANK = W(-3.5, 15.5, 34.5);
// one water feed per pod, 2 m above its first floor (clear of the power feeds and the air ducts)
const WATER = [["A", -25.2, -6, 11.3], ["B", -10, -6.5, 11.3], ["C", 12, -5, 16.2], ["E", -22, 6, 18.6], ["D", -6.5, 1.5, 21.65], ["F", 12.5, 6, 26.55]].map(([name, x, y, z0]) => ({
  name,
  points: [W(-3.5, 15.5, z0 + 2.8), W(x, y, z0 + 2.8)],
}));
const RISER = [W(-3.5, 15.5, 34.5), W(-3.5, 15.5, 1)];
// make-up water for the cooling plant on pod F's roof: the leak happens here, in front of the camera
const ROOF_LINE = [W(-3.5, 15.5, 35), W(-1.5, 14, 35), W(1.5, 12, 33.6), W(12, 11, 33.6), W(20.5, 7, 33.6), W(20.5, 3.2, 33.6)];
const LEAK = W(20.5, 5.8, 33.6);

function Spray({ at }) {
  const geo = useMemo(() => new THREE.SphereGeometry(0.08, 8, 6), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#74c0fc", 2.2), toneMapped: false }), []);
  const pool = useMemo(() => new THREE.CircleGeometry(1, 32).rotateX(-Math.PI / 2), []);
  const poolMat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#339af0", 1.2), ...ADD, opacity: 0.55 }), []);
  useEffect(() => () => [geo, mat, pool, poolMat].forEach((x) => x.dispose()), [geo, mat, pool, poolMat]);
  const ref = useRef();
  const puddle = useRef();
  const born = useRef(null);
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    born.current ??= t;
    for (let i = 0; i < 60; i++) {
      const p = (t * 1.6 + i * 0.173) % 1; // flight time 0..1
      const a = i * 2.39996;
      const r = 0.4 + (i % 5) * 0.25;
      m4.makeTranslation(at[0] + Math.cos(a) * r * p, at[1] + 1.4 * p - 1.9 * p * p, at[2] + Math.sin(a) * r * p);
      ref.current.setMatrixAt(i, m4);
    }
    ref.current.instanceMatrix.needsUpdate = true;
    puddle.current.scale.setScalar(Math.min(1.8, 0.3 + (t - born.current) * 1.2));
  });
  return (
    <group>
      <instancedMesh ref={ref} args={[geo, mat, 60]} frustumCulled={false} raycast={NOOP} />
      <mesh ref={puddle} geometry={pool} material={poolMat} position={[at[0], at[1] - 0.4, at[2]]} raycast={NOOP} />
    </group>
  );
}

const LEAKING = new THREE.Color("#ff4d4d");
const WATER_BLUE = new THREE.Color("#3fa9ff");

export function BmsDemo() {
  const { language } = useLanguage();
  const th = TH(language);
  const leak = demo.use((s) => s.leak);
  const repair = demo.use((s) => s.repair);
  const [phase, setPhase] = useState("ok");
  useEffect(() => {
    if (!leak) return undefined;
    setPhase("leak");
    const a = setTimeout(() => setPhase("closed"), 3000);
    const b = setTimeout(() => setPhase("ok"), 11000);
    return () => [a, b].forEach(clearTimeout);
  }, [leak]);
  const tankGeo = useMemo(() => new THREE.CylinderGeometry(1.2, 1.2, 2.4, 20), []);
  const tankMat = useMemo(() => new THREE.MeshLambertMaterial({ color: "#eef2f6" }), []);
  useEffect(() => () => [tankGeo, tankMat].forEach((x) => x.dispose()), [tankGeo, tankMat]);
  return (
    <group>
      <mesh geometry={tankGeo} material={tankMat} position={[TANK[0], TANK[1] + 1.2, TANK[2]]} raycast={NOOP} />
      <Flow points={RISER} color="#3fa9ff" radius={0.34} speed={1.2} />
      <Flow points={ROOF_LINE} color="#3fa9ff" radius={0.22} speed={1.2} on={phase !== "closed"} tint={() => (phase === "leak" ? LEAKING : WATER_BLUE)} />
      {WATER.map((f) => (
        <Flow key={f.name} points={f.points} color="#3fa9ff" radius={0.2} speed={1} />
      ))}
      {phase !== "ok" && (
        <>
          <Rings at={[LEAK[0], LEAK[1] - 0.35, LEAK[2]]} radius={4} color={phase === "leak" ? "#ff4d4d" : "#4dff9a"} period={1.2} />
          {phase === "leak" && <Spray at={LEAK} />}
          <Tag position={W(23, 3.5, 34.2)}>
            {phase === "leak"
              ? th
                ? "💧 ตรวจพบน้ำรั่ว · ท่อน้ำหลังคา"
                : "💧 Leak detected · roof water line"
              : th
                ? "✓ ปิดวาล์วอัตโนมัติใน 3 วิ · แจ้งช่างแล้ว"
                : "✓ Valve closed automatically in 3 s · technician notified"}
          </Tag>
        </>
      )}
      <Tag position={W(16.8, 2.5, 41.5)}>
        <span className={styles.lines}>
          <span>AHU-1 · 98% ✓</span>
          <span>AHU-2 · 93% ✓</span>
          {repair ? (
            <span className={styles.ok}>AHU-3 · 99% {th ? "✓ ซ่อมบำรุงแล้ว" : "✓ serviced"}</span>
          ) : (
            <span className={styles.warn}>AHU-3 · 71% {th ? "⚠ แรงสั่นสูงขึ้น · ควรซ่อมใน 12 วัน" : "⚠ vibration rising · service within 12 days"}</span>
          )}
        </span>
      </Tag>
      <Rising at={W(16.8, 2.5, 35)} spread={4} color="#4fd1ff" height={6} size={0.2} />
    </group>
  );
}

// ---------------------------------------------------------------- dock sections

function Dashboard({ lang, repair }) {
  const th = TH(lang);
  const rows = [
    [th ? "พลังงาน" : "Energy", "2.4 MWh", 0.72, "▼ 8%", "#ffd23f"],
    [th ? "น้ำ" : "Water", "38 m³", 0.55, "▼ 5%", "#4dabf7"],
    [th ? "ความสบาย" : "Comfort", "96%", 0.96, "▲ 2%", "#51cf66"],
    [th ? "อุปกรณ์ปกติ" : "Equipment OK", repair ? "100%" : "97%", repair ? 1 : 0.97, repair ? "✓" : "1 ⚠", "#a3acff"],
  ];
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>{th ? "Dashboard วันนี้ · AI คุมแอร์ 24.0°C" : "Today · AI holding 24.0 °C"}</div>
      {rows.map(([k, v, f, d, c]) => (
        <div key={k} className={styles.bar}>
          <span>{k}</span>
          <i>
            <u style={{ width: `${f * 100}%`, background: c }} />
          </i>
          <b>
            {v} <em>{d}</em>
          </b>
        </div>
      ))}
    </div>
  );
}

const DT = {
  en: {
    weather: "Weather", weathers: { sunny: "☀ Sunny", cloudy: "⛅ Cloudy", windy: "🌬 Windy", rain: "🌧 Rain" }, trade: "Sell surplus (blockchain)", solar: "Solar", wind: "Wind", grid: "Grid",
    net: "Network", security: "Data security", secure: "🔒 Encrypted", insecure: "⚠ Not encrypted", secureHint: "Pick “Not encrypted” to see how easily sensor data can be read by anyone on the network.",
    mode: "Sensor type", edge: "Edge AI", cloud: "Cloud",
    leak: "💧 Simulate a water leak", repair: "🔧 Book AHU-3 service", repaired: "✓ AHU-3 serviced", note: "Chilled water (HVAC), mains water and equipment health are all watched by the BMS.",
  },
  th: {
    weather: "สภาพอากาศ", weathers: { sunny: "☀ แดดจัด", cloudy: "⛅ เมฆมาก", windy: "🌬 ลมแรง", rain: "🌧 ฝนตก" }, trade: "ขายไฟส่วนเกิน (Blockchain)", solar: "โซลาร์", wind: "ลม", grid: "กริด",
    net: "เครือข่าย", security: "ความปลอดภัยข้อมูล", secure: "🔒 เข้ารหัส", insecure: "⚠ ไม่เข้ารหัส", secureHint: "ลองเลือก “ไม่เข้ารหัส” เพื่อดูว่าข้อมูลเซ็นเซอร์ถูกดักอ่านได้ง่ายแค่ไหน",
    mode: "ชนิดเซ็นเซอร์", edge: "Edge AI", cloud: "คลาวด์",
    leak: "💧 จำลองน้ำรั่ว", repair: "🔧 นัดช่างซ่อม AHU-3", repaired: "✓ ซ่อม AHU-3 แล้ว", note: "BMS เฝ้าดูน้ำเย็นแอร์ ระบบน้ำ และสุขภาพเครื่องจักรพร้อมกัน",
  },
};

// danger: the option that shows the risky case (red when picked)
function Seg({ items, value, onPick, danger, styles: st }) {
  return (
    <div className={st.segment}>
      {Object.entries(items).map(([k, name]) => (
        <button key={k} type="button" className={value === k ? (k === danger ? st.segDanger : st.segOn) : undefined} aria-pressed={value === k} onClick={() => onPick(k)}>
          {name}
        </button>
      ))}
    </div>
  );
}

// surplus sold peer-to-peer: a block is sealed on the ledger every few seconds while the building exports
function TradeLog({ lang, on, styles: st }) {
  const th = TH(lang);
  const [blocks, setBlocks] = useState([]);
  useEffect(() => {
    if (!on) return undefined;
    const id = setInterval(() => {
      const kw = -energyNow.grid;
      if (kw < 2) return;
      setBlocks((b) => [{ n: (b[0]?.n ?? 18233) + 1, kw: Math.round(kw), to: b.length % 2 ? "Tower T1" : "Tower T2" }, ...b].slice(0, 3));
    }, 2600);
    return () => clearInterval(id);
  }, [on]);
  if (!on) return null;
  if (!blocks.length) return <p className={st.note}>{th ? "⛓ รอไฟส่วนเกินเพื่อขาย…" : "⛓ Waiting for surplus to sell…"}</p>;
  return (
    <ul className={st.log}>
      {blocks.map((b) => (
        <li key={b.n}>
          <span>⛓ #{b.n.toLocaleString()}</span> {th ? `ขาย ${b.kw} kW → ${b.to} · ฿${(b.kw * 4.2).toFixed(0)}` : `${b.kw} kW → ${b.to} · ฿${(b.kw * 4.2).toFixed(0)}`} <b className={styles.ok}>✓</b>
        </li>
      ))}
    </ul>
  );
}

function SensorTable({ lang, secure }) {
  const tick = useTick();
  const th = TH(lang);
  const c = reading(tick, 2);
  const hex = Array.from({ length: 6 }, (_, k) => Math.floor((Math.abs(Math.sin(tick * 12.9898 + k * 78.233)) * 43758.5453 % 1) * 65536).toString(16).padStart(4, "0")).join(" ");
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>{th ? "เซ็นเซอร์สด · 1,248 จุด" : "Live sensors · 1,248 online"}</div>
      <div className={styles.table}>
        <b>{th ? "อาคาร" : "Pod"}</b>
        <b>°C</b>
        <b>RH</b>
        <b>CO₂</b>
        {POD_TOPS.map(([name], i) => {
          const v = reading(tick, i);
          return [<span key={name}>{name}</span>, <span key={`${name}t`}>{v.temp}</span>, <span key={`${name}h`}>{v.rh}%</span>, <span key={`${name}c`} className={v.co2 > 700 ? styles.warn : undefined}>{v.co2}</span>];
        })}
      </div>
      <code className={secure ? styles.cipher : styles.plain}>{secure ? `🔒 ${hex}…` : `⚠ {"pod":"C","temp":${c.temp},"co2":${c.co2},"door":"open"}`}</code>
    </div>
  );
}

function EnergyReadout({ lang, styles: st }) {
  const t = DT[lang] || DT.en;
  const [e, setE] = useState({ ...energyNow });
  useEffect(() => {
    const id = setInterval(() => setE({ ...energyNow }), 500);
    return () => clearInterval(id);
  }, []);
  return (
    <p className={st.note}>
      {t.solar} {Math.round(e.solar)} kW · {t.wind} {Math.round(e.wind)} kW · {t.grid} {e.grid < 0 ? "−" : "+"}
      {Math.round(Math.abs(e.grid))} kW
    </p>
  );
}

export const DOCK2 = {
  "renewable-energy": ({ lang, s, styles: st }) => {
    const t = DT[lang] || DT.en;
    return (
      <>
        <div className={st.label}>{t.weather}</div>
        <Seg items={t.weathers} value={s.weather} onPick={(k) => demo.set({ weather: k })} styles={st} />
        <button type="button" className={s.trade ? st.on : st.btn} onClick={() => demo.set({ trade: !s.trade })}>
          {t.trade}
        </button>
        <EnergyReadout lang={lang} styles={st} />
        <TradeLog lang={lang} on={s.trade} styles={st} />
        <ForecastCard weather={s.weather} lang={lang} />
      </>
    );
  },
  iot: ({ lang, s, styles: st }) => {
    const t = DT[lang] || DT.en;
    return (
      <>
        <SensorTable lang={lang} secure={s.secure} />
        <div className={st.label}>{t.net}</div>
        <Seg items={Object.fromEntries(Object.entries(NETS).map(([k, n]) => [k, n.name]))} value={s.net} onPick={(k) => demo.set({ net: k })} styles={st} />
        <div className={st.label}>{t.security}</div>
        <Seg items={{ on: t.secure, off: t.insecure }} value={s.secure ? "on" : "off"} danger="off" onPick={(k) => demo.set({ secure: k === "on" })} styles={st} />
        {s.secure && <p className={st.note}>{t.secureHint}</p>}
      </>
    );
  },
  "motion-sensors": ({ lang, s, styles: st }) => {
    const t = DT[lang] || DT.en;
    return (
      <>
        <div className={st.label}>{t.mode}</div>
        <Seg items={Object.fromEntries(Object.entries(MODES).map(([k, m]) => [k, lang === "th" ? m.th.split(" ")[0] : m.en.split(" ")[0]]))} value={s.sense} onPick={(k) => demo.set({ sense: k })} styles={st} />
        <Seg items={{ edge: t.edge, cloud: t.cloud }} value={s.edge ? "edge" : "cloud"} onPick={(k) => demo.set({ edge: k === "edge" })} styles={st} />
      </>
    );
  },
  "building-automation": ({ lang, s, styles: st }) => {
    const t = DT[lang] || DT.en;
    return (
      <>
        <button type="button" className={st.primary} onClick={() => demo.set({ leak: Date.now() })}>
          {t.leak}
        </button>
        <button type="button" className={s.repair ? st.on : st.btn} onClick={() => demo.set({ repair: !s.repair })}>
          {s.repair ? t.repaired : t.repair}
        </button>
        <Dashboard lang={lang} repair={s.repair} />
        <p className={st.note}>{t.note}</p>
      </>
    );
  },
};
export const DEMO2_IDS = Object.keys(DOCK2);
