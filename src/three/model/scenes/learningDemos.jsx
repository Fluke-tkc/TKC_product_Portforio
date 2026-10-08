// "Try it" demos of the 03 Smart Learning, one per infographic (Learn_1 ... Learn_4), drawn over the baked school:
// 1 cloud LMS (learning from class / home / phone, pushing an update to every device, group work, a broken tablet
//   losing nothing), 2 IoT classroom (room modes, voice control, CO2 and fresh air, engagement heat map),
// 3 AI personalised learning (adaptive quiz, AI tutor, one learner's path), 4 assessment & certificate (check-in,
// AI proctoring, grading, a blockchain-verified certificate, VR practicals).
// Also the panel (campus-systems toggles or the dock) and the reactions router used by SmartLearning.jsx.
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Cone, Packets, Rings, Rising, Tag } from "../reactions";
import dock from "./buildingDemos.module.css";
import cards from "./buildingDemos2.module.css";
import panel from "./buildingSystems.module.css";
import { ADD, Box, NOOP, Pops, Seg, TH, glow, now, usePhase, useTint } from "./demoKit";
import { APS, CEIL, HALL_Z, NetNetwork, PowerNetwork, SKY_CLOUD, SkyCloud, W, WH } from "./learningNetworks";
import { ldemo, lsys } from "./learningStore";

const FL = 0.3 + HALL_Z; // the lifted hall floor

// discs on the floor (heat map, seat lights): colors(i) per point
function Discs({ points, colors, radius = 0.55, opacity = 0.45 }) {
  const geo = useMemo(() => new THREE.CircleGeometry(radius, 28).rotateX(-Math.PI / 2), [radius]);
  const mats = useMemo(() => points.map((_, i) => new THREE.MeshBasicMaterial({ color: glow(colors(i), 1.5), ...ADD, opacity })), [points, colors, opacity]);
  useEffect(() => () => [geo, ...mats].forEach((x) => x.dispose()), [geo, mats]);
  return points.map((p, i) => <mesh key={i} geometry={geo} material={mats[i]} position={[p[0], FL + 0.03, p[2]]} raycast={NOOP} />);
}

// ---------------------------------------------------------------- 1 cloud-based LMS

const TABLES = [[-16, 0.6], [-12.2, 0.6], [-8.4, 0.6]];
const SEATS = [[-0.6, -0.95], [0.6, -0.95], [-0.6, 0.95], [0.6, 0.95]];
const DEVICES = TABLES.flatMap(([cx, cy]) => SEATS.map(([sx, sy]) => W(cx + sx, cy + sy * 0.42, FL + 0.8)));
const TABLE_TOPS = TABLES.map(([cx, cy]) => W(cx, cy, FL + 1.0));
const LMS_CLOUD = WH(-12.2, 0.6, 5.0);
const HOMES = [W(-41, -31, 2), W(-24, -31.6, 2), W(-6, -31.6, 2), W(40.5, -31, 2)];
const CART = W(-18.9, -1.4, FL + 1.1);
const KIOSK = W(-17.4, -6.5, FL + 1.6);
const BROKEN = 5;

// every student outside (plaza, sidewalks) keeps learning on the phone: a packet from each to the cloud and back
function PhoneLinks({ movers }) {
  const list = useMemo(() => movers.filter((m) => m.userData.walk && m.position.y < 1 && Math.abs(m.position.z) > 9), [movers]);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(0.25, 1), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#63e6be", 3), ...ADD }), []);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  const ref = useRef();
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  const a = useMemo(() => new THREE.Vector3(), []);
  const b = useMemo(() => new THREE.Vector3(...SKY_CLOUD), []);
  const p = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }) => {
    list.forEach((w, i) => {
      w.getWorldPosition(a);
      a.y += 1.7;
      const u = (clock.elapsedTime / 2.6 + i * 0.37) % 1;
      p.lerpVectors(a, b, u);
      p.y += Math.sin(u * Math.PI) * 6;
      const s = w.visible ? 1 : 0; // bus riders are hidden while on board
      m4.makeScale(s, s, s).setPosition(p);
      ref.current.setMatrixAt(i, m4);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return list.length ? <instancedMesh ref={ref} args={[geo, mat, list.length]} frustumCulled={false} raycast={NOOP} /> : null;
}

function LmsDemo({ movers }) {
  const { language } = useLanguage();
  const th = TH(language);
  const access = ldemo.use((s) => s.access);
  const collab = ldemo.use((s) => s.collab);
  const update = ldemo.use((s) => s.update);
  const lost = ldemo.use((s) => s.lost);
  const [up, ut] = usePhase(update, [0, 1, 7.5], 12);
  const [lp] = usePhase(lost, [0, 2.5, 5.5], 11);
  const [done, setDone] = useState(0);
  useFrame(() => {
    const n = up === 1 ? Math.min(DEVICES.length, Math.floor((ut.current - 1) / 0.5) + 1) : up === 2 ? DEVICES.length : 0;
    if (n !== done) setDone(n);
  });
  const away = access !== "class";
  return (
    <group>
      <Packets from={DEVICES} to={LMS_CLOUD} color="#5ee7ff" period={2.4} lift={1.5} />
      <Rings at={[LMS_CLOUD[0], FL + 0.05, LMS_CLOUD[2]]} radius={6} color="#5ee7ff" period={2.6} />
      <Rings at={[KIOSK[0], FL + 0.05, KIOSK[2]]} radius={1.6} color="#8cff9a" period={1.8} />
      <Tag position={[KIOSK[0], KIOSK[1] + 1.3, KIOSK[2]]}>{th ? "เช็กชื่อด้วยใบหน้า 23/24 · สาย 1 (07:52)" : "Face check-in 23/24 · 1 late (07:52)"}</Tag>
      {away && (
        <>
          <SkyCloud at={SKY_CLOUD} />
          <Packets from={[SKY_CLOUD]} to={LMS_CLOUD} color="#5ee7ff" period={2} lift={4} />
          {access === "home" && <Packets from={HOMES} to={SKY_CLOUD} color="#ffd43b" period={2.2} lift={8} />}
          {access === "phone" && <PhoneLinks movers={movers} />}
          <Tag position={[SKY_CLOUD[0], SKY_CLOUD[1] + 3.6, SKY_CLOUD[2]]}>
            {access === "home" ? (th ? "🏠 นักเรียน 23 คนเรียนต่อจากบ้านคืนนี้" : "🏠 23 students carry on from home tonight") : th ? "📱 เรียนผ่านมือถือระหว่างเดินทาง · ข้อมูลเดียวกันทุกเครื่อง" : "📱 Learning on the phone on the way · same data on every device"}
          </Tag>
        </>
      )}
      {up >= 0 && <Rings at={LMS_CLOUD} radius={9} color="#8cff9a" period={1.2} vertical />}
      {up >= 1 && <Pops points={DEVICES} shown={(i) => (i < done ? 1 : 0)} colors={() => "#51cf66"} dy={0.45} />}
      {up >= 0 && (
        <Tag position={[LMS_CLOUD[0] + 3, LMS_CLOUD[1] - 0.6, LMS_CLOUD[2]]}>
          {up < 2 ? (th ? `⬆ อัปเดต LMS v2.4 · ${done}/${DEVICES.length} เครื่อง` : `⬆ Updating LMS v2.4 · ${done}/${DEVICES.length} devices`) : th ? "✓ อัปเดตครบ 412 เครื่องใน 6 วิ · ไม่ต้องให้ IT เดินไปทีละเครื่อง" : "✓ All 412 devices updated in 6 s · no IT visit needed"}
        </Tag>
      )}
      {collab && (
        <>
          <Packets from={[TABLE_TOPS[0], TABLE_TOPS[2]]} to={TABLE_TOPS[1]} color="#ffd43b" period={1.3} lift={1.4} />
          <Packets from={[TABLE_TOPS[1]]} to={TABLE_TOPS[0]} color="#ffd43b" period={1.7} lift={1.8} />
          {TABLE_TOPS.map((p, i) => (
            <Tag key={i} position={[p[0], p[1] + 1.2, p[2]]}>
              <span className={cards.small}>{(th ? ["📝 กลุ่ม A แก้สไลด์ 3 พร้อมกัน", "💬 กลุ่ม B แชทแบ่งงาน", "🎥 กลุ่ม C วิดีโอคอลกับ ม.5/2"] : ["📝 Group A editing slide 3 together", "💬 Group B splitting tasks in chat", "🎥 Group C on a call with class 5/2"])[i]}</span>
            </Tag>
          ))}
        </>
      )}
      {lp >= 0 && (
        <>
          {lp === 0 && <Rings at={DEVICES[BROKEN]} radius={1.4} color="#ff4d4d" period={0.8} />}
          {lp >= 1 && <Packets from={[LMS_CLOUD]} to={CART} color="#8cff9a" period={1.2} lift={1.5} />}
          <Tag position={[DEVICES[BROKEN][0], DEVICES[BROKEN][1] + 1.6, DEVICES[BROKEN][2]]}>
            {lp === 0 ? (th ? "💥 แท็บเล็ตตก จอแตก!" : "💥 Tablet dropped — screen broken!") : lp === 1 ? (th ? "✓ งานถูกบันทึกบนคลาวด์ตลอด · หยิบเครื่องสำรองจากตู้ชาร์จ" : "✓ Work was saved in the cloud · spare from the charging cart") : th ? "✓ เรียนต่อได้ใน 20 วิ · งานไม่หายสักบรรทัด" : "✓ Back to work in 20 s · not a line lost"}
          </Tag>
        </>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- 2 IoT-enabled smart classroom

const MODE_TINT = { empty: new THREE.Color(0.3, 0.33, 0.46), present: new THREE.Color(0.68, 0.7, 0.8), exam: new THREE.Color(1.06, 1.06, 1.04), lesson: null };
const DIFFUSERS = [-16, -10, -4, 2, 8, 14].map((x) => WH(x, 13.2, 6.4));
const PROJECTOR = new THREE.Vector3(...WH(-8, 9, 6.7));
const SCREEN = new THREE.Vector3(...WH(-7.6, 15.9, 4.1));
const CAMS = [WH(-11, -7.7, 7.3), WH(7, -7.7, 7.3)];
const PURIFIER = W(15.2, 3.5, FL);
const TEACHER = W(-6, 14.5, FL + 2.3);
const AI_STUDENTS = [9.8, 11.9].flatMap((dy) => [-11.4, -8, -4.6, -1.2].flatMap((x) => [-0.33, 0.33].map((sx) => W(x + sx, dy - 0.55, FL))));
const LMS_STUDENTS = TABLES.flatMap(([cx, cy]) => SEATS.map(([sx, sy]) => W(cx + sx, cy + sy, FL)));
const PODS = [-5.4, -2.6, 0.2].flatMap((y) => [4.4, 8.2, 12].map((x) => W(x, y, FL)));
const ENGAGE = [...AI_STUDENTS, ...LMS_STUDENTS];
const engageColor = (i) => ((i * 37) % 11 < 1 ? "#ff6b6b" : (i * 37) % 11 < 3 ? "#ffd43b" : "#51cf66");

// cool air falling from the duct diffusers (or fresh air blowing in from the windows)
function Airflow({ from, color = "#8fd8ff", drop = 3.4, dir = [0, -1, 0] }) {
  const geo = useMemo(() => new THREE.SphereGeometry(0.07, 8, 6), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow(color, 2.2), ...ADD, opacity: 0.8 }), [color]);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  const N = 14;
  const ref = useRef();
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  useFrame(({ clock }) => {
    from.forEach((f, i) => {
      for (let k = 0; k < N; k++) {
        const u = (clock.elapsedTime * 0.45 + k / N + i * 0.13) % 1;
        const spread = u * 1.2;
        const a = k * 2.4;
        const s = Math.sin(u * Math.PI);
        m4.makeScale(s, s, s).setPosition(f[0] + dir[0] * u * drop + Math.cos(a) * spread, f[1] + dir[1] * u * drop, f[2] + dir[2] * u * drop + Math.sin(a) * spread);
        ref.current.setMatrixAt(i * N + k, m4);
      }
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, from.length * N]} frustumCulled={false} raycast={NOOP} />;
}

function Beam({ from, to, color = "#e7f5ff" }) {
  const { geo, quat, pos } = useMemo(() => {
    const d = to.clone().sub(from);
    const len = d.length();
    const g = new THREE.CylinderGeometry(0.04, 1.9, len, 32, 1, true).translate(0, -len / 2, 0);
    return { geo: g, quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), d.normalize()), pos: from };
  }, [from, to]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow(color, 1.4), ...ADD, opacity: 0.14 }), [color]);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  return <mesh geometry={geo} material={mat} position={pos} quaternion={quat} raycast={NOOP} />;
}

const IOT = {
  en: {
    empty: "Nobody here: lights and air-con off · 42% saved", lesson: "Class in session: lights 80% · air-con 25 °C for 34 people", present: "Presentation: front lights dimmed · blinds down · projector on", exam: "Exam mode: bright even light · speakers quiet · proctor cameras on",
    people: (n) => `👥 ${n} people`, voice: ["🎙 “TKC, start the presentation”", "✓ Projector on · lights 40% · blinds down · attendance taken"],
    co2: ["CO₂ 1,250 ppm — students get drowsy", "Fresh-air fans + purifier on automatically", "✓ CO₂ back to 640 ppm in 5 min"], heat: "Engagement 82% · 3 students may need help",
  },
  th: {
    empty: "ไม่มีคน: ปิดไฟและแอร์อัตโนมัติ · ประหยัด 42%", lesson: "กำลังเรียน: ไฟ 80% · แอร์ 25°C สำหรับ 34 คน", present: "นำเสนอ: หรี่ไฟด้านหน้า · ม่านลง · เปิดโปรเจกเตอร์", exam: "โหมดสอบ: แสงสว่างสม่ำเสมอ · ปิดเสียงลำโพง · กล้องคุมสอบทำงาน",
    people: (n) => `👥 ${n} คน`, voice: ["🎙 “TKC เริ่มการนำเสนอ”", "✓ เปิดโปรเจกเตอร์ · ไฟ 40% · ม่านลง · เช็กชื่อแล้ว"],
    co2: ["CO₂ 1,250 ppm — นักเรียนเริ่มง่วง", "เปิดพัดลมเติมอากาศ + เครื่องฟอกอากาศอัตโนมัติ", "✓ CO₂ ลดเหลือ 640 ppm ใน 5 นาที"], heat: "ความตั้งใจเรียน 82% · 3 คนอาจต้องการความช่วยเหลือ",
  },
};

function IotClassDemo({ materials }) {
  const { language } = useLanguage();
  const tx = IOT[language] || IOT.en;
  const mode = ldemo.use((s) => s.mode);
  const voice = ldemo.use((s) => s.voice);
  const co2 = ldemo.use((s) => s.co2);
  const heat = ldemo.use((s) => s.heat);
  const [vp] = usePhase(voice, [0, 2.2], 7);
  const [cp] = usePhase(co2, [0, 3, 8], 12);
  useTint(materials, () => MODE_TINT[mode]);
  const occupied = mode !== "empty";
  return (
    <group>
      {occupied && APS.map((a, i) => <Rings key={i} at={[a[0], a[1] - 0.2, a[2]]} radius={2.2} color="#8cff9a" count={2} period={1.8 + (i % 3) * 0.4} />)}
      {occupied && mode !== "present" && <Airflow from={DIFFUSERS} />}
      {mode === "present" && <Beam from={PROJECTOR} to={SCREEN} />}
      {mode === "exam" && CAMS.map((c, i) => <Cone key={i} at={c} target={W(8.2, -2.6, FL)} length={9} spread={0.45} sweep={0.5} color="#ff6b6b" />)}
      <Tag position={WH(0, 7, 4.4)}>{tx[mode]}</Tag>
      <Tag position={W(-14, 0, CEIL - 0.9)}>{tx.people(occupied ? 34 : 0)}</Tag>
      {vp >= 0 && <Tag position={TEACHER}>{tx.voice[vp]}</Tag>}
      {cp >= 0 && (
        <>
          {cp >= 1 && <Airflow from={[WH(15.8, 3, 3.2), WH(15.8, 9, 3.2), WH(15.8, 13, 3.2)]} color="#b2f2bb" drop={5} dir={[-1, 0, 0]} />}
          <Rings at={[PURIFIER[0], FL + 0.05, PURIFIER[2]]} radius={3} color={cp === 0 ? "#ff6b6b" : "#63e6be"} period={1.1} />
          <Tag position={[PURIFIER[0] - 1, 3.2, PURIFIER[2]]}>
            <span className={cp === 0 ? cards.warn : cp === 2 ? cards.ok : undefined}>{tx.co2[cp]}</span>
          </Tag>
        </>
      )}
      {heat && (
        <>
          <Discs points={ENGAGE} colors={engageColor} />
          <Tag position={WH(-6.3, 10.8, 3.2)}>{tx.heat}</Tag>
        </>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- 3 AI-driven personalised learning

const TABLETS = [9.8, 11.9].flatMap((dy) => [-11.4, -8, -4.6, -1.2].flatMap((x) => [-0.33, 0.33].map((sx) => W(x + sx, dy + 0.02, FL + 0.8))));
const HEADS = AI_STUDENTS.map((p) => [p[0], p[1] + 1.25, p[2]]);
const BRAIN = WH(-7.6, 12.4, 6.2);
const ROBOT = W(-11.2, 14.4, FL + 1.3);
const WALL = WH(-7.6, 15.6, 5.0);
const LEVEL_COLORS = ["#ff6b6b", "#ffa94d", "#ffd43b", "#8ce99a", "#4dabf7"];
const LEVELS = HEADS.map((_, i) => ((i * 7 + 3) % 5) + 1);
const RIGHT = HEADS.map((_, i) => (i * 5 + 1) % 4 !== 0);
// learners the dock can follow (index into the 16 students at the tablet desks)
export const LEARNERS = { ploy: 2, ton: 9, may: 13 };
const ASKER = 5;

function AiDemo() {
  const { language } = useLanguage();
  const th = TH(language);
  const quiz = ldemo.use((s) => s.quiz);
  const tutor = ldemo.use((s) => s.tutor);
  const learner = ldemo.use((s) => s.learner);
  const [qp, qt] = usePhase(quiz, [0, 1.2, 6, 9], 15);
  const [tp] = usePhase(tutor, [0, 1.6], 9);
  const [answered, setAnswered] = useState(0);
  useFrame(() => {
    const n = qp === 1 ? Math.min(HEADS.length, Math.floor((qt.current - 1.2) / 0.28) + 1) : qp >= 2 ? HEADS.length : 0;
    if (n !== answered) setAnswered(n);
  });
  const adapted = qp >= 2;
  const level = (i) => Math.min(5, Math.max(1, LEVELS[i] + (adapted ? (RIGHT[i] ? 1 : -1) : 0)));
  const me = LEARNERS[learner];
  return (
    <group>
      <Rings at={[BRAIN[0], BRAIN[1] - 0.2, BRAIN[2]]} radius={3} color="#b197fc" period={2.4} />
      <Pops points={HEADS} shown={() => 0.8} colors={(i) => LEVEL_COLORS[level(i) - 1]} size={0.1} dy={0.45} />
      {qp === 0 && <Packets from={[BRAIN]} to={TABLETS[me]} color="#b197fc" period={0.9} lift={1} />}
      {qp === 0 && <Rings at={[BRAIN[0], FL + 0.05, BRAIN[2]]} radius={7} color="#b197fc" period={0.9} />}
      {qp >= 1 && qp < 3 && <Pops points={TABLETS} shown={(i) => (i < answered ? 1 : 0)} colors={(i) => (RIGHT[i] ? "#51cf66" : "#ff6b6b")} size={0.12} dy={0.3} />}
      {qp === 2 && (
        <>
          <Tag position={[HEADS[0][0], HEADS[0][1] + 1.2, HEADS[0][2]]}>{th ? "↑ ชุดยากขึ้น" : "↑ Harder set"}</Tag>
          <Tag position={[HEADS[6][0], HEADS[6][1] + 1.2, HEADS[6][2]]}>{th ? "↓ คำใบ้ + วิดีโอ 2 นาที" : "↓ Hint + 2-min video"}</Tag>
          <Tag position={[HEADS[12][0], HEADS[12][1] + 1.2, HEADS[12][2]]}>{th ? "↓ ย่อยเป็นขั้นง่าย" : "↓ Smaller steps"}</Tag>
        </>
      )}
      {qp >= 0 && (
        <Tag position={WALL}>
          {qp === 0 ? (th ? "AI ส่งโจทย์ต่างระดับให้แต่ละคน" : "AI sends each student a question at their level") : qp === 1 ? (th ? `ตอบแล้ว ${answered}/16 · ให้ผลทันที` : `Answered ${answered}/16 · instant feedback`) : qp === 2 ? (th ? "AI ปรับระดับให้แต่ละคน" : "AI adjusts each student's level") : th ? "ความเข้าใจทั้งห้อง 74% → 81%" : "Class mastery 74% → 81%"}
        </Tag>
      )}
      {tp >= 0 && (
        <>
          {tp === 0 && <Packets from={[HEADS[ASKER]]} to={ROBOT} color="#63e6be" period={0.8} lift={1} />}
          {tp === 1 && <Rings at={[ROBOT[0], FL + 0.05, ROBOT[2]]} radius={2.4} color="#63e6be" period={1} />}
          <Tag position={[ROBOT[0], ROBOT[1] + 1.4, ROBOT[2]]}>
            {tp === 0 ? (th ? "❓ “ทำไม 1/2 + 1/3 ไม่เท่ากับ 2/5?”" : "❓ “Why isn't 1/2 + 1/3 = 2/5?”") : th ? "🤖 ลองนึกถึงพิซซ่า 🍕 ตัดให้ชิ้นเท่ากันก่อน เป็น 3/6 + 2/6 = 5/6" : "🤖 Think pizza 🍕 — cut equal slices first: 3/6 + 2/6 = 5/6"}
          </Tag>
        </>
      )}
      <Rings at={[AI_STUDENTS[me][0], FL + 0.05, AI_STUDENTS[me][2]]} radius={1.2} color="#ffd43b" period={1.4} />
      <Tag position={[HEADS[me][0], HEADS[me][1] + 0.9, HEADS[me][2]]}>{`⭐ ${{ ploy: th ? "พลอย" : "Ploy", ton: th ? "ต้น" : "Ton", may: th ? "เมย์" : "May" }[learner]}`}</Tag>
    </group>
  );
}

// ---------------------------------------------------------------- 4 professional assessment & certificate

const CHECKIN = W(1.6, -6.7, FL);
const PROCTOR = WH(15.05, 1.8, 3.4);
const CERT = WH(1.52, -2, 2.3);
const FLAGGED = 4; // the middle seat, clear of the dock and the info panel
const VR_PODS = [0, 5, 7];
const SKY_CERT = WH(11, -2.6, 3); // above the seats, mid-view: below the score tag, left of the info panel

function VrPractical({ at }) {
  const geo = useMemo(() => new THREE.TorusKnotGeometry(0.34, 0.1, 64, 8), []);
  const gear = useMemo(() => new THREE.TorusGeometry(0.42, 0.08, 6, 12), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#b197fc", 2), ...ADD, opacity: 0.6, wireframe: true }), []);
  useEffect(() => () => [geo, gear, mat].forEach((x) => x.dispose()), [geo, gear, mat]);
  const ref = useRef();
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.elapsedTime * 0.8;
    ref.current.position.y = at[1] + 2.1 + 0.1 * Math.sin(clock.elapsedTime * 2);
  });
  return (
    <group ref={ref} position={[at[0], at[1] + 2.1, at[2]]}>
      <mesh geometry={geo} material={mat} raycast={NOOP} />
      <mesh geometry={gear} material={mat} position={[0.55, 0, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={NOOP} />
    </group>
  );
}

function ExamDemo() {
  const { language } = useLanguage();
  const th = TH(language);
  const exam = ldemo.use((s) => s.exam);
  const vr = ldemo.use((s) => s.vr);
  const [ep] = usePhase(exam, [0, 3, 8, 13, 16], 26);
  const flagged = useMemo(() => ({ current: { position: new THREE.Vector3(...PODS[FLAGGED]) } }), []);
  const lines = th
    ? ["✓ ยืนยันบัตร + ใบหน้า · สมชาย ก. → ที่นั่ง 6", "กำลังสอบ · เหลือ 12:40 นาที · AI คุมสอบทุกที่นั่ง", "⚠ AI คุมสอบ: หันออกนอกจอ 3 ครั้ง — ส่งให้เจ้าหน้าที่ตรวจ", "ระบบตรวจข้อสอบอัตโนมัติ…", "คะแนน 86% · ผ่าน ✓"]
    : ["✓ ID + face verified · Somchai K. → seat 6", "Exam in progress · 12:40 left · AI proctoring every seat", "⚠ AI proctor: looked away ×3 — flagged for staff review", "Auto-grading…", "Score 86% · PASS ✓"];
  return (
    <group>
      {ep === 0 && <Rings at={[CHECKIN[0], FL + 0.05, CHECKIN[2]]} radius={1.8} color="#8cff9a" period={0.9} />}
      {ep >= 1 && ep < 4 && <Discs points={PODS} colors={(i) => (ep >= 2 && i === FLAGGED ? "#ff6b6b" : "#5ee7ff")} radius={0.9} opacity={0.35} />}
      {ep >= 1 && ep < 4 && <Cone at={PROCTOR} target={W(8.2, -2.6, FL)} length={11} spread={0.36} sweep={0.6} color="#5ee7ff" />}
      {ep === 2 && <Box at={flagged} size={[1.6, 1.6, 1.6]} />}
      {ep === 3 && <Packets from={PODS} to={CERT} color="#5ee7ff" period={1.2} lift={2} />}
      {ep === 4 && (
        <>
          <Packets from={[CERT]} to={SKY_CERT} color="#ffd43b" period={1.4} lift={4} />
          <Tag position={SKY_CERT}>{th ? "🎓 ใบรับรองดิจิทัล · ตรวจสอบได้บนบล็อกเชน · แชร์ลง LinkedIn" : "🎓 Digital certificate · blockchain-verified · share to LinkedIn"}</Tag>
        </>
      )}
      {ep >= 0 && (
        <Tag position={ep === 0 ? [CHECKIN[0], 2.9, CHECKIN[2]] : ep === 2 ? [PODS[FLAGGED][0], 2.6, PODS[FLAGGED][2]] : [PODS[FLAGGED][0], 3.4, PODS[FLAGGED][2]]}>
          <span className={ep === 2 ? cards.warn : ep === 4 ? cards.ok : undefined}>{lines[ep]}</span>
        </Tag>
      )}
      {vr && (
        <>
          {VR_PODS.map((k) => (
            <VrPractical key={k} at={PODS[k]} />
          ))}
          <Tag position={[PODS[VR_PODS[1]][0], 3.6, PODS[VR_PODS[1]][2]]}>{th ? "ภาคปฏิบัติใน VR · ซ่อมเครื่องยนต์ ขั้นที่ 7/10" : "VR practical · engine repair · step 7/10"}</Tag>
        </>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- dock (HTML, outside the canvas)

const DT = {
  en: {
    try: "Try it", title: "Campus systems", power: "⚡ Power", net: "📶 Network", hint: "Click students, the bus or cars · pick a topic below",
    access: "Learning from…", places: { class: "🏫 Class", home: "🏠 Home", phone: "📱 Phone" }, update: "⬆ Push an LMS update", collabOn: "👥 Start group work", collabOff: "End group work", lost: "💥 Drop a tablet",
    stats: [["Attendance", "96%", 0.96, "#51cf66"], ["Assignments", "88%", 0.88, "#4dabf7"], ["Avg score", "78", 0.78, "#ffd43b"], ["IT cost", "−35%", 0.65, "#b197fc"]],
    mode: "Room mode", modes: { empty: "Empty", lesson: "Lesson", present: "Present", exam: "Exam" }, voice: "🎙 Voice: start presenting", co2: "🌫 CO₂ rising", heatOn: "Show engagement map", heatOff: "Hide engagement map",
    sensors: { empty: ["27.5 °C", "58%", "480 ppm", "0 lux", "0"], lesson: ["25.0 °C", "54%", "720 ppm", "500 lux", "34"], present: ["25.0 °C", "54%", "760 ppm", "180 lux", "34"], exam: ["24.5 °C", "52%", "690 ppm", "650 lux", "27"] },
    sensorNames: ["Temp", "Humidity", "CO₂", "Light", "People"],
    quiz: "▶ Start an adaptive quiz", tutor: "🤖 Ask the AI tutor", learner: "Follow a learner", learners: { ploy: "Ploy", ton: "Ton", may: "May" },
    paths: {
      ploy: [["Fractions basics", 2], ["Adding fractions", 2], ["Word problems", 1], ["Decimals", 0]],
      ton: [["Fractions basics", 2], ["Adding fractions", 1], ["Visual fractions (extra)", 1], ["Word problems", 0]],
      may: [["Fractions basics", 2], ["Adding fractions", 2], ["Word problems", 2], ["Ratio challenge", 1]],
    },
    next: { ploy: "Next: word problems with hints", ton: "AI added a visual lesson before moving on", may: "Ahead of class: challenge set unlocked" },
    exam: "▶ Start the online exam", vrOn: "Show VR practicals", vrOff: "Hide VR practicals",
    skills: [["Technical", 0.86, "#4dabf7"], ["Problem solving", 0.78, "#51cf66"], ["Communication", 0.64, "#ffd43b"], ["Digital", 0.9, "#b197fc"]],
    plan: "Plan: 2 communication workshops · mock interview · re-test in 30 days",
  },
  th: {
    try: "ลองเล่น", title: "ระบบในโรงเรียน", power: "⚡ ไฟฟ้า", net: "📶 เครือข่าย", hint: "คลิกนักเรียน รถบัส หรือรถยนต์ได้ · เลือกหัวข้อด้านล่าง",
    access: "เรียนจาก…", places: { class: "🏫 ห้องเรียน", home: "🏠 บ้าน", phone: "📱 มือถือ" }, update: "⬆ อัปเดตระบบ LMS", collabOn: "👥 เริ่มงานกลุ่ม", collabOff: "จบงานกลุ่ม", lost: "💥 ทำแท็บเล็ตตก",
    stats: [["เข้าเรียน", "96%", 0.96, "#51cf66"], ["ส่งงาน", "88%", 0.88, "#4dabf7"], ["คะแนนเฉลี่ย", "78", 0.78, "#ffd43b"], ["ค่าไอที", "−35%", 0.65, "#b197fc"]],
    mode: "โหมดห้อง", modes: { empty: "ไม่มีคน", lesson: "เรียน", present: "นำเสนอ", exam: "สอบ" }, voice: "🎙 สั่งด้วยเสียง: เริ่มนำเสนอ", co2: "🌫 CO₂ สูงขึ้น", heatOn: "แสดงแผนที่ความตั้งใจ", heatOff: "ซ่อนแผนที่ความตั้งใจ",
    sensors: { empty: ["27.5°C", "58%", "480 ppm", "0 lux", "0"], lesson: ["25.0°C", "54%", "720 ppm", "500 lux", "34"], present: ["25.0°C", "54%", "760 ppm", "180 lux", "34"], exam: ["24.5°C", "52%", "690 ppm", "650 lux", "27"] },
    sensorNames: ["อุณหภูมิ", "ความชื้น", "CO₂", "แสง", "คน"],
    quiz: "▶ เริ่มแบบทดสอบปรับระดับ", tutor: "🤖 ถามครู AI", learner: "ติดตามผู้เรียน", learners: { ploy: "พลอย", ton: "ต้น", may: "เมย์" },
    paths: {
      ploy: [["พื้นฐานเศษส่วน", 2], ["การบวกเศษส่วน", 2], ["โจทย์ปัญหา", 1], ["ทศนิยม", 0]],
      ton: [["พื้นฐานเศษส่วน", 2], ["การบวกเศษส่วน", 1], ["เศษส่วนแบบภาพ (เสริม)", 1], ["โจทย์ปัญหา", 0]],
      may: [["พื้นฐานเศษส่วน", 2], ["การบวกเศษส่วน", 2], ["โจทย์ปัญหา", 2], ["โจทย์ท้าทายอัตราส่วน", 1]],
    },
    next: { ploy: "ต่อไป: โจทย์ปัญหาแบบมีคำใบ้", ton: "AI เพิ่มบทเรียนแบบภาพก่อนไปต่อ", may: "นำหน้าเพื่อน: ปลดล็อกชุดท้าทาย" },
    exam: "▶ เริ่มสอบออนไลน์", vrOn: "แสดงภาคปฏิบัติ VR", vrOff: "ซ่อนภาคปฏิบัติ VR",
    skills: [["เทคนิค", 0.86, "#4dabf7"], ["แก้ปัญหา", 0.78, "#51cf66"], ["สื่อสาร", 0.64, "#ffd43b"], ["ดิจิทัล", 0.9, "#b197fc"]],
    plan: "แผน: เวิร์กช็อปการสื่อสาร 2 ครั้ง · ฝึกสัมภาษณ์ · สอบซ้ำใน 30 วัน",
  },
};

function Bars({ rows }) {
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

const MARK = ["○", "▶", "✓"];

const DOCK = {
  "cloud-lms": ({ lang, s }) => {
    const t = DT[lang] || DT.en;
    return (
      <>
        <div className={dock.label}>{t.access}</div>
        <Seg items={t.places} value={s.access} onPick={(k) => ldemo.set({ access: k })} />
        <button type="button" className={dock.primary} onClick={() => ldemo.set({ update: now() })}>
          {t.update}
        </button>
        <div className={dock.grid}>
          <button type="button" className={s.collab ? dock.on : dock.btn} onClick={() => ldemo.set({ collab: !s.collab })}>
            {s.collab ? t.collabOff : t.collabOn}
          </button>
          <button type="button" className={dock.danger} onClick={() => ldemo.set({ lost: now() })}>
            {t.lost}
          </button>
        </div>
        <Bars rows={t.stats} />
      </>
    );
  },
  "iot-classrooms": ({ lang, s }) => {
    const t = DT[lang] || DT.en;
    const v = t.sensors[s.mode];
    return (
      <>
        <div className={dock.label}>{t.mode}</div>
        <Seg items={t.modes} value={s.mode} onPick={(k) => ldemo.set({ mode: k })} />
        <div className={dock.grid}>
          <button type="button" className={dock.btn} onClick={() => ldemo.set({ voice: now(), mode: "present" })}>
            {t.voice}
          </button>
          <button type="button" className={dock.danger} onClick={() => ldemo.set({ co2: now() })}>
            {t.co2}
          </button>
        </div>
        <button type="button" className={s.heat ? dock.on : dock.btn} onClick={() => ldemo.set({ heat: !s.heat })}>
          {s.heat ? t.heatOff : t.heatOn}
        </button>
        <div className={cards.card}>
          <div className={cards.table} style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
            {t.sensorNames.map((n) => (
              <b key={n}>{n}</b>
            ))}
            {v.map((x, i) => (
              <span key={i}>{x}</span>
            ))}
          </div>
        </div>
      </>
    );
  },
  "ai-learning": ({ lang, s }) => {
    const t = DT[lang] || DT.en;
    return (
      <>
        <div className={dock.grid}>
          <button type="button" className={dock.primary} onClick={() => ldemo.set({ quiz: now() })}>
            {t.quiz}
          </button>
          <button type="button" className={dock.btn} onClick={() => ldemo.set({ tutor: now() })}>
            {t.tutor}
          </button>
        </div>
        <div className={dock.label}>{t.learner}</div>
        <Seg items={t.learners} value={s.learner} onPick={(k) => ldemo.set({ learner: k })} />
        <div className={cards.card}>
          {t.paths[s.learner].map(([name, st]) => (
            <div key={name} className={cards.bar}>
              <span>{MARK[st]}</span>
              <span style={{ gridColumn: "2 / 4" }} className={st === 2 ? cards.ok : st === 1 ? cards.warn : undefined}>
                {name}
              </span>
            </div>
          ))}
          <p className={dock.note}>🤖 {t.next[s.learner]}</p>
        </div>
      </>
    );
  },
  assessment: ({ lang, s }) => {
    const t = DT[lang] || DT.en;
    return (
      <>
        <button type="button" className={dock.primary} onClick={() => ldemo.set({ exam: now() })}>
          {t.exam}
        </button>
        <button type="button" className={s.vr ? dock.on : dock.btn} onClick={() => ldemo.set({ vr: !s.vr })}>
          {s.vr ? t.vrOff : t.vrOn}
        </button>
        <Bars rows={t.skills.map(([k, f, c]) => [k, `${Math.round(f * 100)}%`, f, c])} />
        <p className={dock.note}>🎯 {t.plan}</p>
      </>
    );
  },
};

export function LearningPanel({ hidden, activeId }) {
  const { language } = useLanguage();
  const t = DT[language] || DT.en;
  const s = ldemo.use();
  const sys = lsys.use();
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
        <button type="button" className={sys.power ? panel.onEnergy : panel.btn} aria-pressed={sys.power} onClick={() => lsys.set({ power: !sys.power })}>
          {t.power}
        </button>
        <button type="button" className={sys.net ? panel.onHvac : panel.btn} aria-pressed={sys.net} onClick={() => lsys.set({ net: !sys.net })}>
          {t.net}
        </button>
      </div>
      <p className={panel.hint}>{t.hint}</p>
    </div>
  );
}

// ---------------------------------------------------------------- reactions router (BakedModel's `reactions`)

export function LearningReactions({ active, movers, materials }) {
  const sys = lsys.use();
  return (
    <>
      {sys.power && <PowerNetwork />}
      {sys.net && <NetNetwork />}
      {active === "cloud-lms" && <LmsDemo movers={movers} />}
      {active === "iot-classrooms" && <IotClassDemo materials={materials} />}
      {active === "ai-learning" && <AiDemo />}
      {active === "assessment" && <ExamDemo />}
      {active === "iot-classrooms" && <Rising at={WH(-2, 5.3, 6.3)} spread={2.2} count={16} height={1.2} color="#5ee7ff" speed={0.8} size={0.06} />}
    </>
  );
}
