// Live systems layered on the baked Smart Building (01): cars that really drive in, park and leave, the
// energy network (generation -> storage -> distribution -> grid) and the HVAC chilled-water network,
// plus the small panel that switches the networks on. Coordinates come from smart_building_v2.py
// (Blender x, y, z -> three.js x, z, -y).
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useLanguage } from "../../../contexts/LanguageContext";
import { createStore } from "../../live/store";
import { Flow } from "../flow";
import { Chevrons, Rings, Tag } from "../reactions";
import styles from "./buildingSystems.module.css";
import { AccessDemo, DEMO_IDS, DemoDock, LightingDemo, ParkingDemo, SurveillanceDemo } from "./buildingDemos";
import { BmsDemo, IotDemo, MotionDemo, RenewableDemo, WEATHER } from "./buildingDemos2";
import { demo, energyNow, parked } from "./demoStore";

export const systems = createStore({ energy: false, hvac: false });

const V = (x, y, z = 0.02) => new THREE.Vector3(x, z, -y); // Blender -> three
const W = (x, y, z) => [x, z, -y];

// ---------------------------------------------------------------- parking actors

const LANE_IN = 28.5;
const LANE_OUT = 41.85;
const ROAD_E = -30.2; // eastbound lane
const ROAD_W = -33.8; // westbound lane
const bayY = (i) => -16 + (i + 0.5) * 2.6;
const OFF = -52; // off the base: cars appear / vanish behind the clipping planes

// one visit: in from the street, into a free bay, a stay, back out and away (legs: [points, speed, reverse])
function visit(row, bay) {
  const y = bayY(bay);
  const up = [V(22, ROAD_E), V(27.2, -28.4), V(LANE_IN, -24)];
  const across = [V(LANE_IN, 30), V(30.5, 33.2), V(34, 33.6), V(38.5, 33.6), V(41.5, 32), V(LANE_OUT, 28)];
  const away = [V(LANE_OUT, -26), V(41, -30), V(38, ROAD_W), V(30, ROAD_W)];
  const road = [[V(OFF, ROAD_E), V(22, ROAD_E)], 7];
  const home = [[V(30, ROAD_W), V(OFF, ROAD_W)], 7];
  if (row === 0) {
    const x = bay >= 13 ? 32.4 : 32.9; // EV bays: nose to the charger
    return [
      road,
      [[...up, V(LANE_IN, y - 5)], 4.5],
      [[V(LANE_IN, y - 5), V(29.3, y - 2), V(31.2, y - 0.2), V(x, y)], 2.2],
      ["dwell", 0, { bay: [30.85, y] }],
      [[V(x, y), V(31, y - 0.2), V(29.2, y - 1.8), V(LANE_IN, y - 4)], 1.8, true],
      [[V(LANE_IN, y - 4), V(LANE_IN, y), ...across, ...away], 4.5],
      home,
    ];
  }
  return [
    road,
    [[...up, ...across, V(LANE_OUT, y + 5)], 4.5],
    [[V(LANE_OUT, y + 5), V(41.1, y + 2), V(39.3, y + 0.2), V(37.4, y)], 2.2],
    ["dwell", 0, { bay: [39.75, y] }],
    [[V(37.4, y), V(39.4, y + 0.2), V(41.2, y + 1.8), V(LANE_OUT, y + 4)], 1.8, true],
    [[V(LANE_OUT, y + 4), ...away], 4.5],
    home,
  ];
}

function compile(legs, dwell) {
  let t = 0;
  let prev = null;
  return legs.map(([pts, speed, extra]) => {
    if (pts === "dwell") {
      // parked where the previous leg (pulling in) ended
      const tan = prev.getTangentAt(1);
      const leg = { t0: t, dur: dwell, dwell: true, bay: extra.bay, pos: prev.getPointAt(1), yaw: Math.atan2(-tan.z, tan.x) };
      t += dwell;
      return leg;
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
    const dur = curve.getLength() / speed;
    const leg = { t0: t, dur, curve, reverse: extra === true };
    t += dur;
    prev = curve;
    return leg;
  });
}

const P = new THREE.Vector3();
const T = new THREE.Vector3();
// where a visitor is at `time`; returns true while it stands in its bay
function pose(legs, period, time, out) {
  const tau = ((time % period) + period) % period;
  let leg = legs[legs.length - 1];
  for (const l of legs)
    if (tau < l.t0 + l.dur) {
      leg = l;
      break;
    }
  if (leg.dwell) {
    out.pos.copy(leg.pos);
    out.yaw = leg.yaw;
    return true;
  }
  const u = Math.min(1, (tau - leg.t0) / leg.dur);
  leg.curve.getPointAt(u, P);
  leg.curve.getTangentAt(u, T);
  if (leg.reverse) T.negate();
  out.pos.copy(P);
  out.yaw = Math.atan2(-T.z, T.x); // cars face their local +x
  return false;
}

// Through cars on the road lanes keep their baked paths; the visitors run on a period that is a whole number
// of the through cars' period, and each start offset is searched once so nobody ever drives into anybody.
export function ParkingActors({ movers }) {
  const cars = useMemo(() => ["car_loop0", "car_loop1", "car_loop2"].map((n) => movers.find((m) => m.name === n)).filter(Boolean), [movers]);
  const plan = useMemo(() => {
    if (!cars.length) return null;
    const through = movers.filter((m) => m.userData.drive && !m.name.startsWith("car_loop") && !m.userData.closed && m.userData.path?.length === 4);
    const lanePeriod = through.length ? through[0].userData.run.cum.at(-1) / through[0].userData.drive : 12;
    const trips = [visit(0, 9), visit(1, 6), visit(0, 15)].slice(0, cars.length);
    const moving = trips.map((legs) => compile(legs, 0).at(-1)).map((l) => l.t0 + l.dur);
    const period = Math.ceil((Math.max(...moving) + 9) / lanePeriod) * lanePeriod;
    const compiled = trips.map((legs, i) => compile(legs, period - moving[i]));
    // search start offsets: stay 7 m clear of the through cars and of each other while on the base
    const onBase = (p) => Math.abs(p.x) < 46 && Math.abs(p.z) < 42;
    const sample = (i, off, t, o) => {
      pose(compiled[i], period, t + off, o);
      return o.pos;
    };
    const throughAt = (m, t, out) => {
      const u = m.userData;
      const { pts, cum } = u.run;
      const total = cum.at(-1);
      const d = (((u.path_at + u.drive * t) % total) + total) % total;
      let k = 1;
      while (k < cum.length - 1 && cum[k] < d) k++;
      return out.lerpVectors(pts[k - 1], pts[k], (d - cum[k - 1]) / (cum[k] - cum[k - 1] || 1));
    };
    const offsets = [];
    const tmp = { pos: new THREE.Vector3(), yaw: 0 };
    const other = { pos: new THREE.Vector3(), yaw: 0 };
    const q = new THREE.Vector3();
    for (let i = 0; i < compiled.length; i++) {
      let best = 0;
      let bestGap = -1;
      for (let off = 0; off < period; off += 0.5) {
        let gap = 1e9;
        for (let t = 0; t < period && gap > bestGap; t += 0.2) {
          const a = sample(i, off, t, tmp).clone();
          if (!onBase(a)) continue;
          for (const m of through) {
            throughAt(m, t, q);
            if (onBase(q)) gap = Math.min(gap, a.distanceTo(q));
          }
          for (let j = 0; j < i; j++) {
            const b = sample(j, offsets[j], t, other);
            if (onBase(b)) gap = Math.min(gap, a.distanceTo(b));
          }
        }
        if (gap > bestGap) {
          bestGap = gap;
          best = off;
        }
        if (bestGap > 12) break;
      }
      offsets.push(best);
    }
    return { compiled, period, offsets, state: compiled.map(() => ({ pos: new THREE.Vector3(), yaw: 0 })) };
  }, [cars, movers]);

  // bay lamps over the baked sensors of the bays the visitors use
  const lamps = useMemo(() => plan?.compiled.map((legs) => legs.find((l) => l.dwell).bay) || [], [plan]);
  const lampGeo = useMemo(() => new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16), []);
  const lampMats = useMemo(() => lamps.map(() => new THREE.MeshBasicMaterial({ color: GREEN.clone(), toneMapped: false })), [lamps]);
  useEffect(() => {
    cars.forEach((c) => (c.userData.scripted = true));
    return () => {
      cars.forEach((c) => (c.userData.scripted = false));
      lampGeo.dispose();
      lampMats.forEach((m) => m.dispose());
    };
  }, [cars, lampGeo, lampMats]);

  const time = useRef(0);
  useFrame((_, dt) => {
    if (!plan) return;
    time.current += dt;
    cars.forEach((car, i) => {
      const st = plan.state[i];
      const inside = pose(plan.compiled[i], plan.period, time.current + plan.offsets[i], st);
      parked[i] = inside; // read by the parking demo (free-bay count, EV charging)
      car.position.set(st.pos.x, car.userData.y0 ?? (car.userData.y0 = car.position.y), st.pos.z);
      car.rotation.set(0, st.yaw, 0);
      // the bay turns red from the moment the car pulls in until it has backed out
      const [lx, ly] = lamps[i];
      const inBay = inside || Math.hypot(st.pos.x - (lx + (lx < 35 ? 2 : -2)), st.pos.z + ly) < 3;
      lampMats[i].color.copy(inBay ? RED : GREEN);
    });
  });
  return lamps.map(([x, y], i) => <mesh key={i} geometry={lampGeo} material={lampMats[i]} position={W(x, y, 0.08)} raycast={() => {}} />);
}
const RED = new THREE.Color(3, 0.35, 0.3);
const GREEN = new THREE.Color(0.4, 3, 0.9);

// ---------------------------------------------------------------- energy + HVAC networks

// pods of the building: name, centre x, y, width, depth, rotation, first floor z, storeys, storey height
const PODS = [
  ["A", -26, -6, 14, 11, 0.04, 11.3, 1, 4.6],
  ["B", -11, -7.5, 22, 14, -0.05, 11.3, 2, 4.2],
  ["C", 12, -5, 20, 15, 0.06, 16.2, 2, 4.2],
  ["E", -22, 3.5, 16, 11, -0.08, 18.6, 1, 4.6],
  ["D", -3, 1.5, 14, 13, 0.18, 21.65, 2, 4.2],
  ["F", 12.5, 6, 19, 13, -0.04, 26.55, 1, 5.0],
];
const CORE = [-6, 13];
const ROOF_Z = 34.8;

function ring(cx, cy, w, d, rot, z, inset) {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const hw = w / 2 - inset;
  const hd = d / 2 - inset;
  const pts = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd], [-hw, -hd]].map(([x, y]) => W(cx + c * x - s * y, cy + s * x + c * y, z));
  return pts;
}

// generation (solar on pods D and F, the rooftop turbine) -> inverter on the core -> riser -> main board
const GEN = {
  solarD: [W(-4.5, 0.5, 32.9), W(-4.5, 6.5, 33.4), W(-6, 12, ROOF_Z)],
  solarF: [W(9, 4.5, 34.1), W(2, 9, 34.6), W(-6, 13, ROOF_Z)],
  wind: [W(18.7, 9.2, 40), W(18.7, 9.2, 34.2), W(6, 12, 34.8), W(-5, 13, ROOF_Z)],
};
const RISER = [W(-6, 13, ROOF_Z), W(-6, 13, 11.5), W(-6, 13, 0.4)];
const TO_GRID = [W(-6, 13, 0.3), W(-20, 20.5, 0.25), W(-36, 20.5, 0.25), W(-36, -20, 0.25), W(-38, -27, 0.3)];
const TO_EV = [W(-6, 13, 0.3), W(-6, 26, 0.25), W(24, 26, 0.25), W(34.9, 24, 0.3)];
const branch = (p, z) => [W(CORE[0], CORE[1], z), W(p[1], p[2], z)];
// one feed per storey, just above its floor (pods: 0.8 m frames, 0.35 m bands between storeys)
const FEEDS = PODS.flatMap((p) => Array.from({ length: p[7] }, (_, k) => p[6] + 0.8 + k * (p[8] + 0.35) + 0.3).map((z) => ({ branch: branch(p, z), loop: ring(p[1], p[2], p[3], p[4], p[5], z, 2.2) })));
const PODIUM_LOOP = [W(-27, -13, 7.2), W(-8, -9.5, 7.2), W(12, -14, 7.2), W(19, -7, 7.2), W(18.5, 15, 7.2), W(-27, 15, 7.2), W(-27, -13, 7.2)];
// HVAC: air handlers on pod F -> chilled water down the core -> a supply and a return loop per pod
const AHU = [W(16.8, 2.5, 34.8), W(8, 8, 35.2), W(-4.6, 12.2, ROOF_Z)];
const AHU_RET = [W(-7.4, 13.8, ROOF_Z), W(8, 9.2, 35.6), W(16.8, 3.6, 34.8)];
const CHW = [W(-4.6, 12.2, ROOF_Z), W(-4.6, 12.2, 11.5)];
const CHW_RET = [W(-7.4, 13.8, 11.5), W(-7.4, 13.8, ROOF_Z)];
const HVAC = PODS.map((p) => {
  const z = p[6] + 0.8 + p[8] - 0.5; // under the ceiling of the first storey
  return { supply: ring(p[1], p[2], p[3], p[4], p[5], z, 1.6), ret: ring(p[1], p[2], p[3], p[4], p[5], z - 0.5, 3.2), feed: [W(-4.6, 12.2, z), W(p[1], p[2], z)] };
});

// a gently changing day: clouds on the panels, gusts on the turbine, people coming and going
function energyAt(t, soc, w) {
  const solar = Math.max(0, 118 + 22 * Math.sin(t * 0.21) + 8 * Math.sin(t * 0.93)) * w.solar;
  const wind = Math.max(0, 14 + 7 * Math.sin(t * 0.37 + 1)) * w.wind;
  const load = 168 + 18 * Math.sin(t * 0.17 + 2);
  const ev = 22 + 6 * Math.sin(t * 0.3);
  const surplus = solar + wind - load - ev;
  const battery = surplus > 0 ? Math.min(40, surplus) * (soc < 0.98 ? 1 : 0) : -Math.min(30, -surplus) * (soc > 0.2 ? 1 : 0);
  return { solar, wind, load, ev, battery, grid: load + ev + battery - solar - wind };
}

const TX = {
  en: {
    solar: (v) => `☀ Solar ${v} kW`, wind: (v) => `🌀 Wind ${v} kW`, load: (v) => `🏢 Building ${v} kW`, ev: (v) => `🚗 EV chargers ${v} kW`,
    battery: (soc, v) => `🔋 Battery ${soc}% · ${v >= 0 ? "charging" : "supplying"} ${Math.abs(v)} kW`,
    grid: (v) => (v < 0 ? `⚡ Selling ${-v} kW to the grid` : `⚡ Buying ${v} kW from the grid`),
    chw: (v) => `❄ Chilled water 7 °C · ${v} kW cooling`, zones: "Every floor held at 24 °C",
  },
  th: {
    solar: (v) => `☀ โซลาร์ ${v} kW`, wind: (v) => `🌀 กังหันลม ${v} kW`, load: (v) => `🏢 อาคารใช้ ${v} kW`, ev: (v) => `🚗 ชาร์จรถ EV ${v} kW`,
    battery: (soc, v) => `🔋 แบตเตอรี่ ${soc}% · ${v >= 0 ? "กำลังชาร์จ" : "จ่ายไฟ"} ${Math.abs(v)} kW`,
    grid: (v) => (v < 0 ? `⚡ ขายไฟคืนกริด ${-v} kW` : `⚡ ซื้อไฟจากกริด ${v} kW`),
    chw: (v) => `❄ น้ำเย็น 7°C · ทำความเย็น ${v} kW`, zones: "ทุกชั้นคุมที่ 24°C",
  },
};

const SOLAR = "#ffd23f";
const POWER = "#ffb13d";
const EXPORT = new THREE.Color("#4dff9a");
const IMPORT = new THREE.Color("#ff8a3d");

export function EnergyNetwork({ weather = "normal" }) {
  const { language } = useLanguage();
  const tx = TX[language] || TX.en;
  const e = useRef({ t: 0, soc: 0.82, now: energyAt(0, 0.82, WEATHER.normal) });
  const [shown, setShown] = useState(e.current.now);
  const tick = useRef(0);
  useFrame((_, dt) => {
    const s = e.current;
    s.t += dt;
    s.now = energyAt(s.t, s.soc, WEATHER[weather]);
    s.soc = Math.min(1, Math.max(0.15, s.soc + (s.now.battery * dt) / 3600 / 0.5)); // a 500 kWh bank, sped up
    Object.assign(energyNow, s.now, { soc: s.soc });
    tick.current += dt;
    if (tick.current > 0.5) {
      tick.current = 0;
      setShown({ ...s.now, soc: s.soc });
    }
  });
  const k = (v) => Math.round(v);
  const gen = () => 0.6 + e.current.now.solar / 120;
  return (
    <group>
      <Flow points={GEN.solarD} color={SOLAR} radius={0.46} speed={gen} />
      <Flow points={GEN.solarF} color={SOLAR} radius={0.46} speed={gen} />
      <Flow points={GEN.wind} color="#9fe6ff" radius={0.38} speed={() => 0.5 + e.current.now.wind / 15} />
      <Flow points={RISER} color={POWER} radius={0.71} speed={1.4} />
      {FEEDS.map((f, i) => (
        <group key={i}>
          <Flow points={f.branch} color={POWER} radius={0.29} speed={1.1} />
          <Flow points={f.loop} color={POWER} radius={0.21} speed={0.9} dash={2.4} />
        </group>
      ))}
      <Flow points={PODIUM_LOOP} color={POWER} radius={0.25} speed={0.9} dash={2.4} />
      <Flow points={TO_EV} color="#7cffb0" radius={0.34} speed={1.2} />
      <Flow points={TO_GRID} color="#ff8a3d" radius={0.46} speed={() => Math.sign(e.current.now.grid || 1) * -1.3} tint={() => (e.current.now.grid < 0 ? EXPORT : IMPORT)} />
      <Tag position={W(9, 4.5, 36.5)}>{tx.solar(k(shown.solar))}</Tag>
      <Tag position={W(19.4, 9.2, 43)}>{tx.wind(k(shown.wind))}</Tag>
      <Tag position={W(-6, 13, 37)}>{tx.load(k(shown.load))}</Tag>
      <Tag position={W(-6, 13, 4)}>{tx.battery(Math.round((shown.soc ?? 0.82) * 100), k(shown.battery))}</Tag>
      <Tag position={W(34.9, 24, 3)}>{tx.ev(k(shown.ev))}</Tag>
      <Tag position={W(-38, -27, 3)}>{tx.grid(k(shown.grid))}</Tag>
    </group>
  );
}

export function HvacNetwork() {
  const { language } = useLanguage();
  const tx = TX[language] || TX.en;
  const [cool, setCool] = useState(96);
  useEffect(() => {
    const id = setInterval(() => setCool(Math.round(92 + Math.random() * 10)), 1500);
    return () => clearInterval(id);
  }, []);
  return (
    <group>
      <Flow points={AHU} color="#4fd1ff" radius={0.55} speed={1.2} />
      <Flow points={AHU_RET} color="#ff9f5a" radius={0.46} speed={1.0} />
      <Flow points={CHW} color="#4fd1ff" radius={0.63} speed={1.4} />
      <Flow points={CHW_RET} color="#ff9f5a" radius={0.55} speed={1.2} />
      {HVAC.map((h, i) => (
        <group key={i}>
          <Flow points={h.feed} color="#4fd1ff" radius={0.25} speed={1.2} />
          <Flow points={h.supply} color="#4fd1ff" radius={0.21} speed={0.8} dash={2.2} />
          <Flow points={h.ret} color="#ff9f5a" radius={0.17} speed={-0.6} dash={2.2} />
        </group>
      ))}
      <Tag position={W(16.8, 2.5, 38)}>{tx.chw(cool)}</Tag>
      <Tag position={W(-26, -6, 20)}>{tx.zones}</Tag>
    </group>
  );
}

// ---------------------------------------------------------------- panel

const PT = {
  en: { title: "Building systems", energy: "Energy flow", hvac: "Air-con (HVAC)", hint: "Click people or cars · pick a topic below" },
  th: { title: "ระบบในอาคาร", energy: "การจ่ายพลังงาน", hvac: "ระบบแอร์ (HVAC)", hint: "คลิกคนหรือรถได้ · เลือกหัวข้อด้านล่าง" },
};

export function BuildingPanel({ hidden, activeId }) {
  if (DEMO_IDS.includes(activeId)) return <DemoDock id={activeId} />;
  return <SystemsPanel hidden={hidden} />;
}

function SystemsPanel({ hidden }) {
  const { language } = useLanguage();
  const t = PT[language] || PT.en;
  const energy = systems.use((s) => s.energy);
  const hvac = systems.use((s) => s.hvac);
  return (
    <div className={`${styles.panel} ${hidden ? styles.hidden : ""}`}>
      <div className={styles.title}>{t.title}</div>
      <div className={styles.row}>
        <button type="button" className={energy ? styles.onEnergy : styles.btn} aria-pressed={energy} onClick={() => systems.set({ energy: !energy })}>
          ⚡ {t.energy}
        </button>
        <button type="button" className={hvac ? styles.onHvac : styles.btn} aria-pressed={hvac} onClick={() => systems.set({ hvac: !hvac })}>
          ❄ {t.hvac}
        </button>
      </div>
      <p className={styles.hint}>{t.hint}</p>
    </div>
  );
}

// ---------------------------------------------------------------- reactions for each hotspot

// Always on: the parking visitors. On selection: each system demonstrates itself; the energy and HVAC networks
// also show whenever they are switched on in the panel.
export function BuildingReactions({ active, pins, movers, leds, sliders, anim, materials, t }) {
  // bay A10 (row 0, bay 9) is one of the 9 free bays baked into the model
  const lane = useMemo(() => [[28.5, 0.1, 22], [28.5, 0.1, -8.7], [32.9, 0.1, -8.7]], []);
  const energy = systems.use((s) => s.energy);
  const hvac = systems.use((s) => s.hvac);
  const weather = demo.use((s) => s.weather);
  return (
    <>
      <ParkingActors movers={movers} />
      {(energy || active === "renewable-energy") && <EnergyNetwork weather={active === "renewable-energy" ? weather : "normal"} />}
      {(hvac || active === "building-automation") && <HvacNetwork />}
      {active === "surveillance" && <SurveillanceDemo movers={movers} />}
      {active === "access-control" && <AccessDemo movers={movers} sliders={sliders} />}
      {active === "smart-parking" && <ParkingDemo movers={movers} />}
      {active === "lighting" && <LightingDemo leds={leds} t={t} pins={pins} materials={materials} />}
      {active === "renewable-energy" && <RenewableDemo anim={anim} materials={materials} />}
      {active === "iot" && <IotDemo pins={pins} />}
      {active === "motion-sensors" && <MotionDemo movers={movers} />}
      {active === "building-automation" && <BmsDemo />}
      {active === "smart-parking" && (
        <>
          <Chevrons points={lane} />
          <Rings at={[32.9, 0.08, -8.7]} radius={3} color="#4dff9a" period={1.6} />
        </>
      )}
    </>
  );
}
