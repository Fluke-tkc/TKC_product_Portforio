// "Try it" demos of the 02 Smart Hospital, one per infographic (H_1 ... H_5), drawn over the baked campus:
// 1 data analytics (department data into the data room, bed-demand forecast on the inpatient tower, CDSS alert,
//   blocked intrusion), 2 diagnostics (AI CT scan with an exploded view of the scanner, telemedicine),
// 3 safety (wayfinding, fall detection, UV robot, RTLS), 4 patient care (IoT vitals, early warning, oxygen,
// night mode), 5 management (queue rush, automatic re-order by drone, power-outage test).
// Also the panel (systems toggles or the dock) and the reactions router used by SmartHospital.jsx.
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Chevrons, Packets, Rings, Rising, Tag } from "../reactions";
import { along, path } from "./buildingDemos";
import dock from "./buildingDemos.module.css";
import cards from "./buildingDemos2.module.css";
import panel from "./buildingSystems.module.css";
import { BEDS, HvacNetwork, OxygenNetwork, PowerNetwork, W } from "./hospitalNetworks";
import { hdemo, hsys } from "./hospitalStore";
import { ADD, Box, Follow, NOOP, Seg, TH, glow, now, place, usePhase, useTint, useWalker } from "./demoKit";

const UP = 5.9;
const FL = 0.3;

// ---------------------------------------------------------------- 1 data analytics & knowledge management

const RACKS = W(-26.2, 15.6, UP + 2.3);
const DEPARTMENTS = [W(4.75, 19.3, UP + 1.4), W(-8.5, 16.6, UP + 2.4), W(-4.4, -2.5, 1.6), W(18.5, -3.2, 2.6), W(-24.8, 0, 2.0), W(8, 25, 12), W(-15, 24.2, 18)];
const LAB = [W(-23.6, -3.2, UP + 1.4)];
const NURSE_DESK = W(6.5, 12.9, UP + 1.9);
const OUTSIDE = [W(-6, -31, 4)];
const DOCTOR = W(-17.2, 13.3, UP + 1.9); // the presenter at the holo table: CDSS alerts land on his tablet
// bed-demand scenarios: occupancy of the 7 ward storeys (bottom to top; the 8th carries the sign), 7-day admissions forecast, beds available
export const FORECAST = {
  normal: { floors: [0.62, 0.7, 0.66, 0.74, 0.58, 0.8, 0.69], days: [118, 124, 121, 130, 127, 112, 108], cap: 150 },
  flu: { floors: [0.86, 0.92, 0.95, 0.88, 0.9, 0.97, 0.84], days: [131, 142, 156, 168, 171, 165, 158], cap: 150 },
  mass: { floors: [0.99, 1, 0.98, 1, 0.97, 1, 0.99], days: [210, 186, 164, 150, 141, 135, 129], cap: 150 },
};
const OCC = [new THREE.Color("#51cf66"), new THREE.Color("#ffd43b"), new THREE.Color("#ff6b6b")];
const occColor = (f, out) => (f < 0.75 ? out.copy(OCC[0]) : f < 0.9 ? out.copy(OCC[0]).lerp(OCC[1], (f - 0.75) / 0.15) : out.copy(OCC[1]).lerp(OCC[2], Math.min(1, (f - 0.9) / 0.08)));

// a translucent heat band over each inpatient floor of the tower, coloured by its occupancy
function FloorHeat({ floors }) {
  const geo = useMemo(() => new THREE.PlaneGeometry(23.2, 3.1), []);
  const mats = useMemo(() => floors.map(() => new THREE.MeshBasicMaterial({ color: "#51cf66", ...ADD, opacity: 0 })), [floors.length]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => [geo, ...mats].forEach((x) => x.dispose()), [geo, mats]);
  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame(({ clock }, dt) =>
    mats.forEach((m, i) => {
      m.color.lerp(occColor(floors[i], tmp).multiplyScalar(1.4), 1 - Math.exp(-dt * 3));
      m.opacity = THREE.MathUtils.damp(m.opacity, 0.34 + 0.08 * Math.sin(clock.elapsedTime * 2 + i), 4, dt);
    })
  );
  return floors.map((_, i) => <mesh key={i} geometry={geo} material={mats[i]} position={W(-15, 23.75, UP + i * 3.7 + 1.85)} raycast={NOOP} />);
}

function Shield({ at, color = "#5ee7ff" }) {
  const geo = useMemo(() => new THREE.SphereGeometry(4.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow(color, 1.2), ...ADD, opacity: 0.2, wireframe: true }), [color]);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  useFrame(({ clock }) => (mat.opacity = 0.18 + 0.14 * Math.abs(Math.sin(clock.elapsedTime * 4))));
  return <mesh geometry={geo} material={mat} position={[at[0], at[1] - 2.3, at[2]]} raycast={NOOP} />;
}

function AnalyticsDemo() {
  const { language } = useLanguage();
  const th = TH(language);
  const scenario = hdemo.use((s) => s.forecast);
  const cdss = hdemo.use((s) => s.cdss);
  const breach = hdemo.use((s) => s.breach);
  const [cp] = usePhase(cdss, [0, 1.6, 3.2], 11);
  const [bp] = usePhase(breach, [0, 2.2], 9);
  const f = FORECAST[scenario];
  const occ = Math.round((f.floors.reduce((a, b) => a + b, 0) / f.floors.length) * 100);
  return (
    <group>
      <Packets from={DEPARTMENTS} to={RACKS} color="#5ee7ff" period={2.6} lift={5} />
      <Rings at={[RACKS[0], UP + 0.05, RACKS[2]]} radius={5} color="#5ee7ff" period={2.4} />
      <FloorHeat floors={f.floors} />
      <Tag position={W(-15, 23.6, UP + 8 * 3.7 + 1.2)}>{th ? `เตียงผู้ป่วยใน ${occ}% · AI พยากรณ์ 7 วัน` : `Inpatient beds ${occ}% · AI 7-day forecast`}</Tag>
      {cp === 0 && <Packets from={LAB} to={RACKS} color="#ffd43b" period={1.2} lift={3} />}
      {cp === 1 && <Packets from={[RACKS]} to={DOCTOR} color="#ff6b6b" period={1.2} lift={3} />}
      {cp === 2 && (
        <>
          <Rings at={[DOCTOR[0], UP + 0.05, DOCTOR[2]]} radius={2.4} color="#ff6b6b" period={1} />
          <Tag position={[DOCTOR[0], DOCTOR[1] + 1.4, DOCTOR[2]]}>{th ? "⚠ โพแทสเซียม 6.1 (เตียง 2) → แจ้งแพทย์ใน 2.8 วิ · แนะนำตรวจ ECG ซ้ำ" : "⚠ Potassium 6.1 (bed 2) → doctor alerted in 2.8 s · repeat ECG advised"}</Tag>
        </>
      )}
      {bp === 0 && <Packets from={OUTSIDE} to={RACKS} color="#ff4d4d" period={1.1} lift={8} />}
      {bp >= 0 && <Shield at={RACKS} color={bp === 0 ? "#ff6b6b" : "#5ee7ff"} />}
      {bp === 1 && <Tag position={[RACKS[0], RACKS[1] + 3, RACKS[2]]}>{th ? "🛡 บล็อกอุปกรณ์ไม่รู้จัก · ต้องยืนยัน MFA · บันทึกตาม PDPA" : "🛡 Unknown device blocked · MFA required · logged (PDPA)"}</Tag>}
    </group>
  );
}

// ---------------------------------------------------------------- 2 smart diagnostics & treatment

const CT = [-8.5, UP + 1.4, -16.6]; // gantry centre (bore along x)
const CHEST = [-7.35, UP + 1.12, -16.6];
const DESK = W(-1.8, 14.2, UP + 1.3);
const HOME = [W(-39, -31, 3)];
const ctLabels = {
  en: { cover: "Gantry cover", slip: "Slip ring · power & data while spinning", drum: "X-ray tube 120 kV ↔ 64-row detector · 0.3 s per turn", couch: "Couch · 50 mm/s through the bore" },
  th: { cover: "ฝาครอบแกนทรี", slip: "สลิปริง · ส่งไฟและข้อมูลขณะหมุน", drum: "หลอดเอกซเรย์ 120 kV ↔ ตัวรับภาพ 64 แถว · หมุน 0.3 วิ/รอบ", couch: "เตียงเลื่อน · 50 มม./วิ ผ่านช่องสแกน" },
};

// the scanner drawn live: its parts float apart in the exploded view, the drum spins and the fan beam fires while scanning
function CtScanner({ exploded, scanning, lang }) {
  const r = useMemo(() => {
    const m = (c, k, o, extra = {}) => new THREE.MeshBasicMaterial({ color: glow(c, k), ...ADD, opacity: o, ...extra });
    return {
      shell: m("#5ee7ff", 1.2, 0.34), wire: m("#5ee7ff", 2.2, 0.6, { wireframe: true }), tube: m("#ff9f43", 2.6, 0.95), det: m("#8f9bff", 2.4, 0.9), gold: m("#ffd23f", 2.2, 0.85), beam: m("#ff6b6b", 1.8, 0.3), slice: m("#ff6b6b", 2.2, 0.5),
      cover: new THREE.CylinderGeometry(1.36, 1.36, 1.0, 48, 1, true).rotateZ(Math.PI / 2),
      face: new THREE.RingGeometry(0.45, 1.36, 48).rotateY(Math.PI / 2),
      drum: new THREE.TorusGeometry(0.95, 0.08, 10, 64).rotateY(Math.PI / 2),
      tubeG: new THREE.BoxGeometry(0.42, 0.3, 0.36),
      cell: new THREE.BoxGeometry(0.34, 0.1, 0.12),
      slip: new THREE.TorusGeometry(1.2, 0.035, 8, 72).rotateY(Math.PI / 2),
      fan: new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.8, 0), new THREE.Vector3(0, -0.95, 0.5), new THREE.Vector3(0, -0.95, -0.5)]),
      couch: new THREE.BoxGeometry(2.8, 0.1, 0.52),
      plane: new THREE.PlaneGeometry(1.0, 0.8).rotateY(Math.PI / 2),
    };
  }, []);
  useEffect(() => () => Object.values(r).forEach((x) => x.dispose()), [r]);
  const e = useRef(0);
  const cover = useRef();
  const slip = useRef();
  const drum = useRef();
  const spin = useRef();
  const fan = useRef();
  const slice = useRef();
  const all = useRef();
  const [labels, setLabels] = useState(false);
  useFrame(({ clock }, dt) => {
    e.current = THREE.MathUtils.damp(e.current, exploded ? 1 : 0, 3, dt);
    const k = e.current;
    all.current.visible = k > 0.02 || scanning;
    cover.current.position.y = 4.4 * k;
    slip.current.position.y = 2.9 * k;
    drum.current.position.y = 1.5 * k;
    spin.current.rotation.x += dt * (scanning ? 20 : 1.5);
    fan.current.visible = scanning;
    slice.current.visible = scanning;
    slice.current.position.x = 0.35 + ((clock.elapsedTime * 0.6) % 1) * 1.9;
    if (k > 0.6 !== labels) setLabels(k > 0.6);
  });
  const L = ctLabels[lang] || ctLabels.en;
  return (
    <group position={CT}>
      <group ref={all}>
        <group ref={cover}>
          <mesh geometry={r.cover} material={r.shell} raycast={NOOP} />
          <mesh geometry={r.cover} material={r.wire} raycast={NOOP} />
          <mesh geometry={r.face} material={r.shell} position={[-0.5, 0, 0]} raycast={NOOP} />
          {labels && <Tag position={[0, 1.75, 0]}>{L.cover}</Tag>}
        </group>
        <group ref={slip}>
          <mesh geometry={r.slip} material={r.gold} raycast={NOOP} />
          {labels && <Tag position={[0, 0, 1.5]}>{L.slip}</Tag>}
        </group>
        <group ref={drum}>
          <group ref={spin}>
            <mesh geometry={r.drum} material={r.wire} raycast={NOOP} />
            <mesh geometry={r.tubeG} material={r.tube} position={[0, 0.95, 0]} raycast={NOOP} />
            {Array.from({ length: 9 }, (_, i) => {
              const a = (i - 4) * 0.13;
              return <mesh key={i} geometry={r.cell} material={r.det} position={[0, -Math.cos(a) * 0.98, Math.sin(a) * 0.98]} rotation={[a, 0, 0]} raycast={NOOP} />;
            })}
            <mesh ref={fan} geometry={r.fan} material={r.beam} raycast={NOOP} />
          </group>
          {labels && <Tag position={[0, 0, -1.3]}>{L.drum}</Tag>}
        </group>
        <mesh ref={slice} geometry={r.plane} material={r.slice} position={[0.8, -0.28, 0]} raycast={NOOP} />
        {labels && (
          <>
            <mesh geometry={r.couch} material={r.shell} position={[0.9, -0.55, 0]} raycast={NOOP} />
            <Tag position={[1.9, -0.25, 0.6]}>{L.couch}</Tag>
          </>
        )}
      </group>
    </group>
  );
}

function Finding() {
  const geo = useMemo(() => new THREE.SphereGeometry(0.1, 16, 12), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#ff4d4d", 3), ...ADD }), []);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  const ref = useRef();
  useFrame(({ clock }) => ref.current.scale.setScalar(1 + 0.5 * Math.abs(Math.sin(clock.elapsedTime * 5))));
  return <mesh ref={ref} geometry={geo} material={mat} position={CHEST} raycast={NOOP} />;
}

function DiagnosticsDemo() {
  const { language } = useLanguage();
  const th = TH(language);
  const scan = hdemo.use((s) => s.scan);
  const exploded = hdemo.use((s) => s.explode);
  const tele = hdemo.use((s) => s.tele);
  const [ph, t] = usePhase(scan, [0, 4, 6.5], 20);
  const [secs, setSecs] = useState(0);
  useFrame(() => {
    const v = Math.floor(Math.max(0, t.current) * 10) / 10;
    if (ph === 0 && v !== secs) setSecs(v);
  });
  return (
    <group>
      <CtScanner exploded={exploded} scanning={ph === 0} lang={language} />
      {ph === 0 && <Tag position={[CT[0], CT[1] + 2.2, CT[2]]}>{th ? `กำลังสแกน CT 64 สไลซ์ · ${secs.toFixed(1)} วิ` : `Scanning · 64-slice CT · ${secs.toFixed(1)} s`}</Tag>}
      {ph === 1 && (
        <>
          <Rising at={[CHEST[0], CHEST[1], CHEST[2]]} spread={0.8} count={30} height={3} color="#5ee7ff" speed={2} size={0.08} />
          <Tag position={[CT[0], CT[1] + 2.2, CT[2]]}>{th ? "AI กำลังวิเคราะห์ 312 ภาพ…" : "AI analysing 312 images…"}</Tag>
        </>
      )}
      {ph === 2 && (
        <>
          <Finding />
          <Rings at={[CHEST[0], CHEST[1] + 0.02, CHEST[2]]} radius={1.4} color="#ff6b6b" period={1.1} />
          <Tag position={[CT[0] + 1, CT[1] + 2.4, CT[2]]}>{th ? "AI: พบก้อน 8 มม. ปอดขวาบน · มั่นใจ 94% → ส่งรังสีแพทย์ด่วนใน 12 วิ" : "AI: 8 mm nodule, right upper lobe · 94% → radiologist in 12 s"}</Tag>
        </>
      )}
      {tele && (
        <>
          <Packets from={HOME} to={DESK} color="#63e6be" period={1.6} lift={10} />
          <Rings at={[DESK[0], UP + 0.05, DESK[2]]} radius={2.4} color="#63e6be" period={1.8} />
          <Tag position={[DESK[0], DESK[1] + 1.4, DESK[2]]}>{th ? "📹 ปรึกษาแพทย์ทางไกล · สัญญาณชีพจากนาฬิกาผู้ป่วยที่บ้าน" : "📹 Video consult · vitals from the patient's watch at home"}</Tag>
        </>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- 3 smart safety & convenience

const V = (x, y, z = FL + 0.04) => W(x, y, z);
export const ROUTES = {
  cafe: { pts: [V(-26, 0.2), V(-19, 0.2), V(-16.4, -1.2)], goal: V(-15.6, -1.4), up: null },
  radiology: { pts: [V(-26, 0.9), V(-10.6, 0.9), V(-10.6, 10.4), V(7.2, 10.4), V(7.2, 18.6)], goal: W(-8.5, 14.6, UP + 0.05), up: W(7.2, 18.8, FL) },
  ward: { pts: [V(-26, 1.25), V(-10.2, 1.25), V(-10.2, -5.6), V(14.2, -5.6), V(14.2, 0.4)], goal: W(10, 15.6, UP + 0.05), up: W(14.2, 6, 3.2) },
  er: { pts: [V(-26, 1.6), V(-9.8, 1.6), V(-9.8, -7), V(16.4, -7), V(16.4, -3.2)], goal: V(16.4, -3.2), up: null },
};
const DEST = {
  en: { cafe: "☕ Café · 20 m · 30 s", radiology: "🩻 Radiology (CT) · floor 2 · lift B · 2 min", ward: "🛏 Ward 2A · escalator · 3 min", er: "🚑 Emergency · 50 m · 1 min" },
  th: { cafe: "☕ คาเฟ่ · 20 ม. · 30 วิ", radiology: "🩻 รังสีวิทยา (CT) · ชั้น 2 · ลิฟต์ B · 2 นาที", ward: "🛏 หอผู้ป่วย 2A · บันไดเลื่อน · 3 นาที", er: "🚑 ห้องฉุกเฉิน · 50 ม. · 1 นาที" },
};
const FALL_AT = [V(-23.6, 1.9, FL), V(-20.8, 1.9, FL)];
const NURSE_RUN = [V(-24, 8.5, FL), V(-24, 4.2, FL), V(-21.4, 2.7, FL)];

function Guide({ movers, route }) {
  const actor = useWalker(movers, "walker5");
  const r = useMemo(() => path(route.pts), [route]);
  useEffect(() => {
    if (actor) actor.o.visible = true;
  }, [actor]);
  useFrame(({ clock }) => actor && place(actor, r, (clock.elapsedTime * 1.3) % (r.total + 2), clock.elapsedTime, 1.3));
  return actor ? <primitive object={actor.o} /> : null;
}

function FallScene({ movers, ph, t }) {
  const patient = useWalker(movers, "walker6");
  const nurse = useWalker(movers, "walker1");
  const walkIn = useMemo(() => path(FALL_AT), []);
  const run = useMemo(() => path(NURSE_RUN), []);
  const at = useRef(null);
  useEffect(() => {
    if (patient) at.current = patient.o;
  }, [patient]);
  useFrame(({ clock }) => {
    if (!patient || !nurse) return;
    const s = t.current;
    patient.o.visible = s >= 0;
    nurse.o.visible = s >= 3.5;
    if (s < 0) return;
    // patient walks in, falls at 2.4 s, lies until the nurse has helped (11 s), then stands again
    if (s < 2.4) place(patient, walkIn, s * 1.0, clock.elapsedTime, 1.0);
    else {
      along(walkIn, walkIn.total, patient.o.position);
      const k = s < 11 ? Math.min(1, (s - 2.4) / 0.35) : Math.max(0, 1 - (s - 11) / 0.8);
      patient.o.rotation.set(0, 0, -k * Math.PI * 0.5);
      patient.o.position.y += k * 0.2;
    }
    if (s >= 3.5) place(nurse, run, Math.min(run.total, (s - 3.5) * 3.2), clock.elapsedTime, 3.2, (s - 3.5) * 3.2 < run.total);
  });
  return (
    <>
      {patient && <primitive object={patient.o} />}
      {nurse && <primitive object={nurse.o} />}
      {ph >= 1 && ph < 3 && <Box at={at} size={[2.0, 0.8, 1.0]} offset={[0.85, 0, 0]} />}
    </>
  );
}

function UvGlow() {
  const cone = useMemo(() => new THREE.ConeGeometry(2.2, 2.2, 32, 1, true).translate(0, 1.1, 0), []);
  const disc = useMemo(() => new THREE.CircleGeometry(2.4, 40).rotateX(-Math.PI / 2), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#9d6bff", 1.8), ...ADD, opacity: 0.25 }), []);
  const floor = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#b388ff", 1.6), ...ADD, opacity: 0.35 }), []);
  useEffect(() => () => [cone, disc, mat, floor].forEach((x) => x.dispose()), [cone, disc, mat, floor]);
  useFrame(({ clock }) => (mat.opacity = 0.18 + 0.1 * Math.sin(clock.elapsedTime * 6)));
  return (
    <>
      <mesh geometry={cone} material={mat} rotation={[Math.PI, 0, 0]} position={[0, 2.2, 0]} raycast={NOOP} />
      <mesh geometry={disc} material={floor} position={[0, 0.06, 0]} raycast={NOOP} />
    </>
  );
}

// RTLS: a small marker over every person and robot the model moves
function RtlsTags({ movers }) {
  const list = useMemo(() => movers.filter((m) => m.userData.walk || /bot/.test(m.name)), [movers]);
  const geo = useMemo(() => new THREE.OctahedronGeometry(0.22), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#5ee7ff", 2.6), toneMapped: false }), []);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  const ref = useRef();
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  const p = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }) => {
    list.forEach((o, i) => {
      o.getWorldPosition(p);
      m4.makeRotationY(clock.elapsedTime * 2 + i).setPosition(p.x, p.y + 2.35 + 0.08 * Math.sin(clock.elapsedTime * 3 + i), p.z);
      ref.current.setMatrixAt(i, m4);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return list.length ? <instancedMesh ref={ref} args={[geo, mat, list.length]} frustumCulled={false} raycast={NOOP} /> : null;
}

function SafetyDemo({ movers }) {
  const { language } = useLanguage();
  const th = TH(language);
  const nav = hdemo.use((s) => s.nav);
  const fall = hdemo.use((s) => s.fall);
  const uv = hdemo.use((s) => s.uv);
  const rtls = hdemo.use((s) => s.rtls);
  const [ph, t] = usePhase(fall, [0, 2.4, 3.5, 11], 13);
  const route = nav && ROUTES[nav];
  const robot = useMemo(() => movers.find((m) => /patrolbot/.test(m.name)), [movers]);
  return (
    <group>
      <Tag position={W(-24.5, 2.4, 4.6)}>{th ? "🌡 23.5°C · 💧 52% · PM2.5 8 · เสี่ยงติดเชื้อต่ำ ✓" : "🌡 23.5 °C · 💧 52% · PM2.5 8 · infection risk low ✓"}</Tag>
      {route && (
        <>
          <Chevrons points={route.pts} color="#4dff9a" spacing={1.8} speed={2.6} />
          <Rings at={route.goal} radius={2.2} color="#4dff9a" period={1.4} />
          {route.up && <Rising at={route.up} spread={0.6} count={20} height={6} color="#4dff9a" speed={3} size={0.12} />}
          <Tag position={[route.goal[0], route.goal[1] + 2.2, route.goal[2]]}>{(DEST[language] || DEST.en)[nav]}</Tag>
          <Guide key={nav} movers={movers} route={route} />
        </>
      )}
      {ph >= 0 && <FallScene movers={movers} ph={ph} t={t} />}
      {ph >= 1 && ph < 3 && <Rings at={W(-20.0, 1.9, FL + 0.05)} radius={2.6} color="#ff4d4d" period={0.9} />}
      {ph >= 1 && (
        <Tag position={W(-20.0, 1.9, 3.2)}>
          {ph < 3 ? (th ? "🚨 ตรวจพบคนล้ม · กล้อง AI 2 · 0.8 วิ → แจ้งพยาบาลแล้ว" : "🚨 Fall detected · AI camera 2 · 0.8 s → nurse notified") : th ? "✓ พยาบาลถึงตัวใน 38 วิ (เดิมเฉลี่ย 3 นาที)" : "✓ Nurse arrived in 38 s (was 3 min on average)"}
        </Tag>
      )}
      {uv && robot && (
        <Follow target={robot}>
          <UvGlow />
          <Tag position={[0, 3.2, 0]}>{th ? "หุ่นยนต์ UV-C · ฆ่าเชื้อ 99.9% · ห้อง 3/12" : "UV-C robot · 99.9% disinfected · room 3/12"}</Tag>
        </Follow>
      )}
      {rtls && (
        <>
          <RtlsTags movers={movers} />
          <Rings at={W(-27, -6.6, FL + 0.05)} radius={1.6} color="#63e6be" period={1.6} />
          <Tag position={W(-27, -6.6, 2.4)}>{th ? "♿ รถเข็นว่าง 3 คัน · ใกล้สุด 12 ม." : "♿ 3 wheelchairs free · nearest 12 m"}</Tag>
        </>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- 4 integrated patient care

const VITALS = [
  { hr: 72, spo2: 98 },
  { hr: 78, spo2: 97 },
  { hr: 66, spo2: 99 },
  { hr: 84, spo2: 96 },
  { hr: 70, spo2: 98 },
];
const NURSE_WALK = [W(6.5, 13.4, UP), W(6.2, 16.2, UP), W(7.9, 17.6, UP)];
const NIGHT = new THREE.Color(0.42, 0.47, 0.68);

function CareDemo({ movers, materials }) {
  const { language } = useLanguage();
  const th = TH(language);
  const det = hdemo.use((s) => s.deteriorate);
  const night = hdemo.use((s) => s.night);
  const [ph, t] = usePhase(det, [0, 3, 8, 12], 18);
  const nurse = useWalker(movers, "walker7");
  const walk = useMemo(() => path(NURSE_WALK), []);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((v) => v + 1), 900);
    return () => clearInterval(id);
  }, []);
  useTint(materials, () => (night ? NIGHT : null));
  useFrame(({ clock }) => {
    if (!nurse) return;
    const s = t.current;
    nurse.o.visible = s >= 3 && s < 16;
    if (nurse.o.visible) {
      const d = Math.min(walk.total, (s - 3) * 1.5);
      place(nurse, walk, d, clock.elapsedTime, 1.5, d < walk.total);
    }
  });
  // bed 2's numbers during the scenario: falling until the oxygen is turned up at 8 s, then recovering
  const s = Math.max(0, t.current);
  const drop = ph < 0 ? 0 : s < 8 ? Math.min(1, s / 5) : Math.max(0, 1 - (s - 8) / 6);
  const vitals = VITALS.map((v, i) => {
    const wob = Math.round(Math.sin(tick * 1.3 + i * 2) * 2);
    return i === 1 ? { hr: Math.round(78 + 40 * drop) + wob, spo2: Math.round(97 - 9 * drop) } : { hr: v.hr + wob, spo2: v.spo2 };
  });
  return (
    <group>
      {nurse && <primitive object={nurse.o} />}
      <OxygenNetwork boost={ph >= 2 && ph < 4 ? 1 : -1} />
      {BEDS.map((b, i) => (
        <Tag key={i} position={[b[0], b[1] + 1.6, b[2] + (i < 3 ? 1.1 : 0)]}>
          <span className={i === 1 && drop > 0.4 ? cards.warn : cards.small}>
            ❤ {vitals[i].hr} · SpO₂ {vitals[i].spo2}%
          </span>
        </Tag>
      ))}
      {ph >= 1 && ph < 4 && <Rings at={[BEDS[1][0], UP + 0.05, BEDS[1][2] + 1]} radius={2.4} color={ph === 1 ? "#ff4d4d" : "#ffd43b"} period={0.9} />}
      {ph === 1 && <Packets from={[BEDS[1]]} to={NURSE_DESK} color="#ff6b6b" period={1} lift={2.5} />}
      {ph >= 1 && ph < 4 && (
        <Tag position={W(6.5, 14.2, UP + 3.4)}>
          {ph === 1
            ? th ? "⚠ เตือนล่วงหน้า NEWS 7 · SpO₂ ต่ำ → แจ้งพยาบาลมะลิ" : "⚠ Early warning NEWS 7 · low SpO₂ → Nurse Mali alerted"
            : ph === 2
              ? th ? "พยาบาลกำลังไปที่เตียง 2 · ประวัติจาก EHR ขึ้นบนแท็บเล็ต" : "Nurse on the way to bed 2 · EHR history on her tablet"
              : th ? "O₂ 2 → 4 ลิตร/นาที · SpO₂ ฟื้นตัว · แพทย์รับทราบผ่านแอป" : "O₂ 2 → 4 L/min · SpO₂ recovering · doctor notified in the app"}
        </Tag>
      )}
      {night && <Tag position={W(10, 12.6, UP + 4.2)}>{th ? "🌙 โหมดกลางคืน · ไฟ 30% · ม่านปิด · แอร์ประหยัด −22% พลังงาน" : "🌙 Night mode · lights 30% · blinds closed · HVAC eco −22% energy"}</Tag>}
    </group>
  );
}

// ---------------------------------------------------------------- 5 smart hospital management

const KIOSKS = [W(-5.8, -2.5, 1.6), W(-4.4, -2.5, 1.6), W(-1.6, -2.5, 1.6)];
const HUB = W(-3, 1, 4.2);
const QUEUE_BOARD = W(0.6, -3.7, 4.4);
const PHARMACY = W(-27.4, 7, UP + 2.6);
const DARK = new THREE.Color(0.22, 0.24, 0.3);
const EMERGENCY = new THREE.Color(0.62, 0.6, 0.58);

function MgmtDemo({ movers, materials }) {
  const { language } = useLanguage();
  const th = TH(language);
  const rush = hdemo.use((s) => s.rush);
  const restock = hdemo.use((s) => s.restock);
  const outage = hdemo.use((s) => s.outage);
  const power = hsys.use((s) => s.power);
  const [rp] = usePhase(rush, [0, 3, 6], 16);
  const [sp] = usePhase(restock, [0, 2, 9], 16);
  const [op, ot] = usePhase(outage, [0, 0.9, 10, 24], 27);
  const drone = useMemo(() => movers.find((m) => /drone/.test(m.name) && !/rotor/.test(m.name)), [movers]);
  const [secs, setSecs] = useState(0);
  useFrame(() => {
    const v = Math.round(Math.max(0, ot.current) * 10) / 10;
    if (op >= 0 && op < 3 && v !== secs) setSecs(v);
  });
  // lights: black-out for a moment, emergency lighting on UPS, full again once the generators are on
  useTint(materials, () => (op === 0 ? DARK : op === 1 ? EMERGENCY : null));
  const wait = rp < 0 ? 12 : rp === 0 ? 42 : rp === 1 ? 31 : 18;
  return (
    <group>
      <Packets from={KIOSKS} to={HUB} color="#8f9bff" period={2} lift={2} />
      <Rings at={[HUB[0], FL + 0.2, HUB[2]]} radius={6} color={rp === 0 ? "#ff922b" : "#5ee7ff"} period={2.2} />
      <Tag position={QUEUE_BOARD}>
        <span className={rp === 0 ? cards.warn : undefined}>
          {th ? `คิวถัดไป A-128 · รอ ${wait} นาที` : `Now serving A-128 · wait ${wait} min`}
          {rp === 0 && (th ? " · ช่วงเช้าคนแน่น 86 คิว" : " · morning rush, 86 in queue")}
          {rp === 1 && (th ? " · AI เปิดช่อง 4–5 + ส่ง 30 คนไปเช็กอินเอง" : " · AI opened desks 4–5, 30 sent to self check-in")}
        </span>
      </Tag>
      {sp >= 0 && (
        <>
          <Packets from={[PHARMACY]} to={HUB} color="#ffd43b" period={1.2} lift={4} />
          <Tag position={[PHARMACY[0], PHARMACY[1] + 2, PHARMACY[2]]}>
            <span className={sp < 2 ? cards.warn : cards.ok}>{sp < 2 ? (th ? "อินซูลินเหลือ 8% → สั่งซื้ออัตโนมัติแล้ว" : "Insulin 8% → re-ordered automatically") : th ? "✓ เติมสต็อกแล้ว 100%" : "✓ Restocked to 100%"}</span>
          </Tag>
          {drone && sp < 2 && (
            <Follow target={drone} dy={-1}>
              <Tag position={[0, 2.4, 0]}>{th ? "📦 อินซูลิน ×40 · โดรนส่งด่วน ETA 4 นาที" : "📦 Insulin ×40 · drone ETA 4 min"}</Tag>
            </Follow>
          )}
        </>
      )}
      {op >= 0 && op < 3 ? <PowerNetwork phase={op >= 2 ? "gen" : "cut"} t={secs} /> : power && <PowerNetwork />}
      {op === 3 && <Tag position={W(30, 24, 8)}>{th ? "✓ ไฟกริดกลับมา · สลับกลับอัตโนมัติ · ไม่มีเครื่องมือแพทย์ดับเลย" : "✓ Grid back · switched over automatically · no medical device lost power"}</Tag>}
      {op >= 0 && op < 3 && (
        <Tag position={W(-3, 1, 9.5)}>
          {op === 0 ? (th ? "⚠ ไฟดับ!" : "⚠ Power cut!") : op === 1 ? (th ? "UPS + แบตเตอรี่รับโหลดวิกฤตทันที · ไฟฉุกเฉินติด" : "UPS + battery carry critical loads instantly · emergency lights on") : th ? `เครื่องปั่นไฟจ่ายไฟภายใน ${Math.min(10, secs).toFixed(1)} วิ · ไฟทั้งโรงพยาบาลกลับมา` : `Generators online in ${Math.min(10, secs).toFixed(1)} s · whole hospital powered`}
        </Tag>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- dock (HTML, outside the canvas)

const DT = {
  en: {
    try: "Try it",
    forecast: "Bed-demand scenario", scen: { normal: "Normal", flu: "Flu season", mass: "Mass casualty" }, cdss: "⚠ Abnormal lab result (CDSS)", breach: "🛡 Simulate an intrusion",
    advice: { normal: "Staffing OK · 32 beds free · elective surgery as planned", flu: "Open 8 surge beds on floor 6 · add 4 night nurses · isolate flu cases", mass: "Activate the mass-casualty plan: 30 ER beds, postpone elective surgery, call in 12 staff" },
    scan: "▶ Start an AI CT scan", scanning: "Scanning…", view: "Scanner view", normal: "Normal", exploded: "Exploded", teleOn: "📹 Start a video consult", teleOff: "End the call",
    call: "Dr. Anan ↔ Khun Mali (at home)", vitals: (hr, s) => `Watch: ❤ ${hr} · SpO₂ ${s}% · BP 128/82`, triage: "AI triage: stable · follow-up in 7 days",
    nav: "Find my way to…", dest: { off: "Off", cafe: "Café", radiology: "Radiology", ward: "Ward", er: "ER" }, fall: "🚨 Simulate a patient fall", uvOn: "Start the UV robot", uvOff: "Stop the UV robot", rtlsOn: "Show RTLS tags", rtlsOff: "Hide RTLS tags",
    det: "⚠ Simulate a patient deteriorating", mode: "Ward mode", day: "☀ Day", night: "🌙 Night", careNote: "Monitors send vitals every second; the early-warning score calls the nurse before a crisis.",
    rush: "👥 Morning rush", restock: "📦 Low stock → auto re-order", outage: "⚡ Power-outage test", beds: "Beds", wait: "Queue wait", energy: "Energy", sat: "Satisfaction",
    power: "⚡ Power", hvac: "❄ Air-con", o2: "O₂ Medical gas", title: "Hospital systems", hint: "Click people, cars or the drone · pick a topic below",
  },
  th: {
    try: "ลองเล่น",
    forecast: "สถานการณ์ความต้องการเตียง", scen: { normal: "ปกติ", flu: "ฤดูไข้หวัด", mass: "อุบัติเหตุหมู่" }, cdss: "⚠ ผลแล็บผิดปกติ (CDSS)", breach: "🛡 จำลองการบุกรุกระบบ",
    advice: { normal: "กำลังคนพอ · เตียงว่าง 32 เตียง · ผ่าตัดตามนัดได้", flu: "เปิดเตียงเสริม 8 เตียงชั้น 6 · เพิ่มพยาบาลเวรดึก 4 คน · แยกผู้ป่วยไข้หวัด", mass: "เปิดแผนรับอุบัติเหตุหมู่: เตียง ER 30 เตียง · เลื่อนผ่าตัดที่รอได้ · เรียกเจ้าหน้าที่เพิ่ม 12 คน" },
    scan: "▶ เริ่มสแกน CT ด้วย AI", scanning: "กำลังสแกน…", view: "มุมมองเครื่อง CT", normal: "ปกติ", exploded: "แยกชิ้นส่วน", teleOn: "📹 เริ่มปรึกษาแพทย์ทางไกล", teleOff: "วางสาย",
    call: "นพ.อนันต์ ↔ คุณมะลิ (อยู่บ้าน)", vitals: (hr, s) => `นาฬิกา: ❤ ${hr} · SpO₂ ${s}% · ความดัน 128/82`, triage: "AI คัดกรอง: อาการคงที่ · นัดติดตาม 7 วัน",
    nav: "นำทางไปที่…", dest: { off: "ปิด", cafe: "คาเฟ่", radiology: "รังสี", ward: "หอผู้ป่วย", er: "ฉุกเฉิน" }, fall: "🚨 จำลองผู้ป่วยหกล้ม", uvOn: "เริ่มหุ่นยนต์ UV", uvOff: "หยุดหุ่นยนต์ UV", rtlsOn: "แสดงแท็ก RTLS", rtlsOff: "ซ่อนแท็ก RTLS",
    det: "⚠ จำลองผู้ป่วยอาการทรุด", mode: "โหมดหอผู้ป่วย", day: "☀ กลางวัน", night: "🌙 กลางคืน", careNote: "เครื่องวัดส่งสัญญาณชีพทุกวินาที คะแนนเตือนล่วงหน้าเรียกพยาบาลก่อนเกิดวิกฤต",
    rush: "👥 ช่วงเช้าคนแน่น", restock: "📦 ของใกล้หมด → สั่งซื้ออัตโนมัติ", outage: "⚡ ทดสอบไฟดับ", beds: "เตียง", wait: "เวลารอคิว", energy: "พลังงาน", sat: "ความพึงพอใจ",
    power: "⚡ ไฟฟ้า", hvac: "❄ แอร์", o2: "O₂ ก๊าซทางการแพทย์", title: "ระบบในโรงพยาบาล", hint: "คลิกคน รถ หรือโดรนได้ · เลือกหัวข้อด้านล่าง",
  },
};

function ForecastChart({ scenario, lang }) {
  const f = FORECAST[scenario];
  const X = (i) => 10 + i * 33;
  const Y = (v) => 84 - (v / 220) * 76;
  const days = TH(lang) ? ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"] : ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className={cards.card}>
      <div className={cards.cardHead}>{TH(lang) ? "AI พยากรณ์ผู้ป่วยรับใหม่ 7 วัน (เส้นประ = เตียงที่มี)" : "AI admissions forecast, 7 days (dashed = beds available)"}</div>
      <svg width="220" height="96" viewBox="0 0 220 96">
        <line x1="4" x2="216" y1={Y(f.cap)} y2={Y(f.cap)} stroke="rgba(255,255,255,0.45)" strokeDasharray="4 3" />
        {f.days.map((v, i) => (
          <g key={i}>
            <rect x={X(i) - 9} y={Y(v)} width="18" height={84 - Y(v)} rx="3" fill={v > f.cap ? "#ff6b6b" : v > f.cap * 0.85 ? "#ffd43b" : "#51cf66"} />
            <text x={X(i)} y="95" fill="rgba(255,255,255,0.6)" fontSize="9" textAnchor="middle">
              {days[i]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function CallCard({ lang }) {
  const t = DT[lang] || DT.en;
  const [k, setK] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setK((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(k / 60)).padStart(2, "0");
  const ss = String(k % 60).padStart(2, "0");
  return (
    <div className={cards.card}>
      <div className={cards.cardHead}>
        🔴 {t.call} · {mm}:{ss}
      </div>
      <p className={dock.note}>{t.vitals(86 + Math.round(Math.sin(k) * 3), 96)}</p>
      <p className={dock.note}>{t.triage}</p>
    </div>
  );
}

function Stats({ lang }) {
  const t = DT[lang] || DT.en;
  const rows = [
    [t.beds, "78%", 0.78, "#ffd43b"],
    [t.wait, "12 min", 0.3, "#51cf66"],
    [t.energy, "1.08 MW", 0.64, "#ffb13d"],
    [t.sat, "⭐ 4.7", 0.94, "#a3acff"],
  ];
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

const DOCK = {
  "data-analytics": ({ lang, s }) => {
    const t = DT[lang] || DT.en;
    return (
      <>
        <div className={dock.label}>{t.forecast}</div>
        <Seg items={t.scen} value={s.forecast} danger="mass" onPick={(k) => hdemo.set({ forecast: k })} />
        <ForecastChart scenario={s.forecast} lang={lang} />
        <p className={dock.note}>🤖 {t.advice[s.forecast]}</p>
        <div className={dock.grid}>
          <button type="button" className={dock.btn} onClick={() => hdemo.set({ cdss: now() })}>
            {t.cdss}
          </button>
          <button type="button" className={dock.danger} onClick={() => hdemo.set({ breach: now() })}>
            {t.breach}
          </button>
        </div>
      </>
    );
  },
  "smart-diagnostics": ({ lang, s }) => {
    const t = DT[lang] || DT.en;
    return (
      <>
        <button type="button" className={dock.primary} onClick={() => hdemo.set({ scan: now() })}>
          {t.scan}
        </button>
        <div className={dock.label}>{t.view}</div>
        <Seg items={{ normal: t.normal, exploded: t.exploded }} value={s.explode ? "exploded" : "normal"} onPick={(k) => hdemo.set({ explode: k === "exploded" })} />
        <button type="button" className={s.tele ? dock.on : dock.btn} onClick={() => hdemo.set({ tele: !s.tele })}>
          {s.tele ? t.teleOff : t.teleOn}
        </button>
        {s.tele && <CallCard lang={lang} />}
      </>
    );
  },
  "safety-convenience": ({ lang, s }) => {
    const t = DT[lang] || DT.en;
    return (
      <>
        <div className={dock.label}>{t.nav}</div>
        <Seg items={t.dest} value={s.nav ?? "off"} onPick={(k) => hdemo.set({ nav: k === "off" ? null : k })} />
        <button type="button" className={dock.danger} onClick={() => hdemo.set({ fall: now() })}>
          {t.fall}
        </button>
        <div className={dock.grid}>
          <button type="button" className={s.uv ? dock.on : dock.btn} onClick={() => hdemo.set({ uv: !s.uv })}>
            {s.uv ? t.uvOff : t.uvOn}
          </button>
          <button type="button" className={s.rtls ? dock.on : dock.btn} onClick={() => hdemo.set({ rtls: !s.rtls })}>
            {s.rtls ? t.rtlsOff : t.rtlsOn}
          </button>
        </div>
      </>
    );
  },
  "patient-care": ({ lang, s }) => {
    const t = DT[lang] || DT.en;
    return (
      <>
        <button type="button" className={dock.danger} onClick={() => hdemo.set({ deteriorate: now() })}>
          {t.det}
        </button>
        <div className={dock.label}>{t.mode}</div>
        <Seg items={{ day: t.day, night: t.night }} value={s.night ? "night" : "day"} onPick={(k) => hdemo.set({ night: k === "night" })} />
        <p className={dock.note}>{t.careNote}</p>
      </>
    );
  },
  "hospital-management": ({ lang }) => {
    const t = DT[lang] || DT.en;
    return (
      <>
        <div className={dock.grid}>
          <button type="button" className={dock.btn} onClick={() => hdemo.set({ rush: now() })}>
            {t.rush}
          </button>
          <button type="button" className={dock.btn} onClick={() => hdemo.set({ restock: now() })}>
            {t.restock}
          </button>
        </div>
        <button type="button" className={dock.danger} onClick={() => hdemo.set({ outage: now() })}>
          {t.outage}
        </button>
        <Stats lang={lang} />
      </>
    );
  },
};

export function HospitalPanel({ hidden, activeId }) {
  const { language } = useLanguage();
  const t = DT[language] || DT.en;
  const s = hdemo.use();
  const sys = hsys.use();
  const Section = DOCK[activeId];
  if (Section)
    return (
      <div className={dock.dock}>
        <div className={dock.head}>{t.try}</div>
        <Section lang={language} s={s} />
      </div>
    );
  return (
    <div className={`${panel.panel} ${hidden ? panel.hidden : ""}`}>
      <div className={panel.title}>{t.title}</div>
      <div className={panel.row}>
        <button type="button" className={sys.power ? panel.onEnergy : panel.btn} aria-pressed={sys.power} onClick={() => hsys.set({ power: !sys.power })}>
          {t.power}
        </button>
        <button type="button" className={sys.hvac ? panel.onHvac : panel.btn} aria-pressed={sys.hvac} onClick={() => hsys.set({ hvac: !sys.hvac })}>
          {t.hvac}
        </button>
        <button type="button" className={sys.o2 ? panel.onGas : panel.btn} aria-pressed={sys.o2} onClick={() => hsys.set({ o2: !sys.o2 })}>
          {t.o2}
        </button>
      </div>
      <p className={panel.hint}>{t.hint}</p>
    </div>
  );
}

// ---------------------------------------------------------------- reactions router (BakedModel's `reactions`)

export function HospitalReactions({ active, movers, materials }) {
  const sys = hsys.use();
  return (
    <>
      {sys.power && active !== "hospital-management" && <PowerNetwork />}
      {sys.hvac && <HvacNetwork />}
      {sys.o2 && active !== "patient-care" && <OxygenNetwork />}
      {active === "data-analytics" && <AnalyticsDemo />}
      {active === "smart-diagnostics" && <DiagnosticsDemo />}
      {active === "safety-convenience" && <SafetyDemo movers={movers} />}
      {active === "patient-care" && <CareDemo movers={movers} materials={materials} />}
      {active === "hospital-management" && <MgmtDemo movers={movers} materials={materials} />}
    </>
  );
}
