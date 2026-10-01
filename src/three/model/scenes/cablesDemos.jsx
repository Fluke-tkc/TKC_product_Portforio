// "Try it" demos of the 05 Smart Cables, one per infographic (OC_2, OC_1), drawn over the baked boulevard:
// 1 underground cables (pick a cable type: a cut-away cross-section of it floats over the trench and its real
//   ends light up in the cut; a storm the buried network rides out; electromagnetic interference kept out),
// 2 organised cables (the inspection robot reading tags, scanning a cable's ID tag, a fibre break found by OTDR,
//   rerouted and spliced, IoT sensors reporting to the street cabinet).
// Also the street-systems overlay (fibre network, power feeders), the panel and the reactions router used by
// SmartCables.jsx. Coordinates from smart_cables.py (Blender x, y, z -> three.js x, z, -y).
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Flow } from "../flow";
import { Cone, Packets, Rings, Tag } from "../reactions";
import dock from "./buildingDemos.module.css";
import cards from "./buildingDemos2.module.css";
import panel from "./buildingSystems.module.css";
import { ADD, Follow, NOOP, Pops, Seg, TH, glow, now, usePhase } from "./demoKit";
import { cdemo, csys } from "./cablesStore";

const W = (x, y, z) => [x, z, -y];
const FLOOR = -3.3;
const FRONT = 34.06; // three.js z just in front of the plinth's cut face

// ---------------------------------------------------------------- 1 underground cables

// cable ends in the front cut, [Blender x, z, radius]
const ENDS = {
  armored: [[-4.62, -2.74, 0.26], [-3.44, -2.74, 0.26], [-4.5, -2.03, 0.22], [-3.25, -2.03, 0.22]],
  fiber: [[-2.38, -2.86, 0.14], [-4.55, -1.44, 0.13], [-3.75, -1.44, 0.13], [-2.95, -1.44, 0.13]],
  duct: [[-4.02, -2.8, 0.2], [-2.86, -2.8, 0.2], [-3.85, -2.08, 0.17], [-2.6, -2.07, 0.18]],
  direct: [],
};
const HOLO_AT = W(-2.8, -36.5, 1.6);
const FIBRE_FIRST = [[-2.38, -2.86, 0.14]]; // the orange sub-duct next to the power pipe

// Layers of each cable from the inside out: solid (a rod), ring (n strands round a circle) or shell (open tube).
// Each layer is shorter than the one inside it, so the cut-away shows them all.
const SECTIONS = {
  armored: [
    { kind: "ring", n: 3, r: 0.1, at: 0.12, colors: ["#c0392b", "#f1c40f", "#2e86de"] },
    { kind: "solid", r: 0.3, color: "#d9d4c7" },
    { kind: "ring", n: 22, r: 0.035, at: 0.34, colors: ["#9aa3ad"], metal: true },
    { kind: "solid", r: 0.42, color: "#23272b" },
  ],
  fiber: [
    { kind: "solid", r: 0.05, color: "#eeeeee" },
    { kind: "ring", n: 6, r: 0.07, at: 0.15, colors: ["#2e86de", "#ff8c2a", "#2ecc71", "#8e5b3a", "#9aa3ad", "#ffffff"] },
    { kind: "solid", r: 0.26, color: "#f2d16b" },
    { kind: "solid", r: 0.3, color: "#b8bec6", metal: true },
    { kind: "solid", r: 0.36, color: "#111418" },
  ],
  direct: [
    { kind: "solid", r: 0.14, color: "#c87533", metal: true },
    { kind: "solid", r: 0.28, color: "#f4f1ea" },
    { kind: "solid", r: 0.31, color: "#9aa3ad", metal: true },
    { kind: "solid", r: 0.45, color: "#23272b" },
  ],
  duct: [
    { kind: "solid", r: 0.05, color: "#111418" },
    { kind: "ring", n: 6, r: 0.1, at: 0.22, colors: ["#2e86de", "#2ecc71", "#ff8c2a", "#e74c3c", "#9b59b6", "#f1c40f"] },
    { kind: "shell", r: 0.45, color: "#ff8c2a" },
  ],
};
const LEN = 3.2; // the innermost layer; each layer out is STEP shorter, so the stepped cut-away shows them all
const STEP = 0.55;
const HOLO_SCALE = 1.4;

function CableSection({ type }) {
  const { language } = useLanguage();
  const t = (CX[language] || CX.en)[type];
  const layers = SECTIONS[type];
  const parts = useMemo(() => {
    const out = [];
    layers.forEach((l, i) => {
      const len = LEN - i * STEP;
      const x = LEN / 2 - len / 2;
      const mat = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: l.metal ? 0.35 : 0.6, metalness: l.metal ? 0.8 : 0, transparent: l.kind === "shell", opacity: l.kind === "shell" ? 0.55 : 1, side: THREE.DoubleSide });
      if (l.kind === "ring")
        for (let k = 0; k < l.n; k++) {
          const a = (k / l.n) * Math.PI * 2;
          out.push({ geo: new THREE.CylinderGeometry(l.r, l.r, len, 14), mat: mat(l.colors[k % l.colors.length]), pos: [x, Math.cos(a) * l.at, Math.sin(a) * l.at] });
        }
      else out.push({ geo: new THREE.CylinderGeometry(l.r, l.r, len, 40, 1, l.kind === "shell"), mat: mat(l.color), pos: [x, 0, 0] });
    });
    return out;
  }, [layers]);
  useEffect(() => () => parts.forEach((p) => [p.geo, p.mat].forEach((x) => x.dispose())), [parts]);
  const ref = useRef();
  useFrame(({ clock }) => (ref.current.rotation.x = clock.elapsedTime * 0.35));
  return (
    <group position={HOLO_AT} scale={HOLO_SCALE}>
      <group ref={ref}>
        {parts.map((p, i) => (
          <mesh key={i} geometry={p.geo} material={p.mat} position={p.pos} rotation={[0, 0, Math.PI / 2]} raycast={NOOP} />
        ))}
      </group>
      {t.layers.map((name, i) => (
        <Tag key={i} position={[LEN / 2 - (LEN - i * STEP) + 0.12, i % 2 ? -0.75 : 0.75, 0]}>
          <span className={cards.small}>{name}</span>
        </Tag>
      ))}
      <Tag position={[0, 1.5, 0]}>
        {t.title}
        <br />
        <span className={cards.small}>{t.use}</span>
        {t.where && (
          <>
            <br />
            <span className={cards.small}>{t.where}</span>
          </>
        )}
      </Tag>
    </group>
  );
}

// pulsing outlines round the real cable ends in the cut
function EndRings({ ends, color }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color, transparent: true, toneMapped: false, side: THREE.DoubleSide }), [color]);
  const geos = useMemo(() => ends.map(([, , r]) => new THREE.RingGeometry(r + 0.02, r + 0.09, 40)), [ends]);
  useEffect(() => () => [mat, ...geos].forEach((x) => x.dispose()), [mat, geos]);
  useFrame(({ clock }) => (mat.opacity = 0.55 + 0.45 * Math.sin(clock.elapsedTime * 5)));
  return ends.map(([x, z], i) => <mesh key={i} geometry={geos[i]} material={mat} position={[x, z, FRONT]} raycast={NOOP} />);
}

// a solid pulsing ring facing the camera (additive rings fade out on the light tunnel)
function Halo({ at, r = 0.5, color = "#ff4d4d" }) {
  const geo = useMemo(() => new THREE.RingGeometry(r, r + 0.1, 40), [r]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color, transparent: true, toneMapped: false, side: THREE.DoubleSide, depthTest: false }), [color]);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  const ref = useRef();
  useFrame(({ clock }) => {
    const k = (clock.elapsedTime * 1.2) % 1;
    ref.current.scale.setScalar(0.6 + k * 0.8);
    mat.opacity = 1 - k * 0.7;
  });
  return <mesh ref={ref} geometry={geo} material={mat} position={at} renderOrder={8} raycast={NOOP} />;
}

// rain over the front of the boulevard (plain colours: additive streaks vanish against the light street)
function Rain({ count = 500 }) {
  const geo = useMemo(() => new THREE.BoxGeometry(0.02, 0.7, 0.02), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#a9c8e8", transparent: true, opacity: 0.55, toneMapped: false }), []);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  const drops = useMemo(() => Array.from({ length: count }, (_, i) => [((i * 0.618) % 1) * 30 - 18, ((i * 0.37) % 1) * 12, ((i * 0.791) % 1) * 22 + 18]), [count]);
  const ref = useRef();
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  useFrame(({ clock }) => {
    drops.forEach(([x, y0, z], i) => {
      m4.makeTranslation(x, 12 - ((y0 + clock.elapsedTime * 16) % 12), z);
      ref.current.setMatrixAt(i, m4);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, count]} frustumCulled={false} raycast={NOOP} />;
}

// a dark storm light over the whole model with lightning flashes; restores the colours when it ends
function useStorm(materials, on) {
  const c = useMemo(() => new THREE.Color(), []);
  useEffect(() => () => materials.forEach((m) => m.color.copy(m.userData.base)), [materials]);
  useFrame(({ clock }) => {
    if (!on) return;
    const t = clock.elapsedTime % 3.4;
    const flash = t < 0.08 || (t > 0.16 && t < 0.22);
    c.setRGB(...(flash ? [1.7, 1.7, 1.8] : [0.52, 0.57, 0.7]));
    materials.forEach((m) => m.color.copy(m.userData.base).multiply(c));
  });
  useEffect(() => {
    if (!on) materials.forEach((m) => m.color.copy(m.userData.base));
  }, [on, materials]);
}

const FIBRE_RUN = [W(-1.33, -34, -0.83), W(-1.33, 13.4, -0.83)];
const STORM_TAG = W(-9.5, -36, 3.9); // top left, over the street, clear of the cross-section title
const EMI_TAG = W(-1.5, -34, 0.2); // under the cross-section, above the cut
const POWER_PIPE = [-4.62, -2.74];

function UndergroundDemo({ materials }) {
  const { language } = useLanguage();
  const th = TH(language);
  const cable = cdemo.use((s) => s.cable);
  const storm = cdemo.use((s) => s.storm);
  const emi = cdemo.use((s) => s.emi);
  const [sp] = usePhase(storm, [0], 12);
  useStorm(materials, sp >= 0);
  const colors = { armored: "#ffd43b", fiber: "#ff922b", duct: "#4dabf7", direct: "#ffffff" };
  return (
    <group>
      <CableSection type={cable} />
      <EndRings ends={ENDS[cable]} color={colors[cable]} />
      {sp >= 0 && (
        <>
          <Rain />
          <Flow points={FIBRE_RUN} color="#5ee7ff" radius={0.07} speed={3} />
          <Tag position={STORM_TAG}>
            <span className={cards.ok}>{th ? "⛈ พายุ ฟ้าผ่า · ใต้ดินไม่ดับ ✓" : "⛈ Storm, lightning · underground ✓ up"}</span>
            <br />
            <span className={cards.small}>{th ? "สายอากาศย่านข้างเคียงดับ 3 จุด" : "Overhead lines nearby: 3 outages"}</span>
          </Tag>
        </>
      )}
      {emi && (
        <>
          <Rings at={[POWER_PIPE[0], POWER_PIPE[1], FRONT]} radius={1.6} color="#ff6b6b" period={0.9} vertical />
          <EndRings ends={FIBRE_FIRST} color="#51cf66" />
          <Tag position={EMI_TAG}>
            <span className={cards.small}>{th ? "⚡ เกราะเหล็กกันสนามแม่เหล็กของสายไฟ" : "⚡ Steel armour holds the power cable's field"}</span>
            <br />
            <span className={cards.small}>{th ? "ใยแก้วไม่รับสัญญาณรบกวน · bit error 0.001%" : "Fibre is immune · bit errors 0.001%"}</span>
          </Tag>
        </>
      )}
    </group>
  );
}

const CX = {
  en: {
    armored: { title: "🛡 Armored cable · 22 kV power", use: "Steel wires shield it from rodents, ground pressure and digging", layers: ["Copper + XLPE", "Bedding", "Steel armour", "PVC jacket"] },
    fiber: { title: "💡 Fiber optic underground cable", use: "288 fibres · internet and 5G backhaul", layers: ["Strength rod", "Loose tubes", "Aramid yarn", "Steel tape", "PE jacket"] },
    direct: { title: "🟫 Direct buried cable (DBC)", use: "No conduit: thick insulation against moisture, heat and soil", where: "In the model: under the right footway, in sand below cover tiles and warning tape", layers: ["Conductor", "XLPE", "Moisture barrier", "Thick HDPE"] },
    duct: { title: "🟠 Duct cable", use: "Pulled through ducts: upgrade or replace without digging", layers: ["Micro cable", "Micro ducts", "HDPE duct"] },
  },
  th: {
    armored: { title: "🛡 สายหุ้มเกราะ · ไฟฟ้า 22 kV", use: "ลวดเหล็กกันหนู แรงกดดิน และการขุด", layers: ["ทองแดง + XLPE", "ชั้นรอง", "เกราะเหล็ก", "เปลือก PVC"] },
    fiber: { title: "💡 สายใยแก้วนำแสงใต้ดิน", use: "288 คอร์ · อินเทอร์เน็ตและ 5G", layers: ["แกนรับแรง", "ท่อหลวม", "เส้นใยอะรามิด", "เทปเหล็ก", "เปลือก PE"] },
    direct: { title: "🟫 สายฝังตรง (DBC)", use: "ไม่ใช้ท่อ ฉนวนหนากันความชื้น ความร้อน และดิน", where: "ในโมเดล: ใต้ทางเท้าขวา ฝังในทรายใต้แผ่นกันกระแทกและเทปเตือน", layers: ["ตัวนำ", "XLPE", "ชั้นกันชื้น", "HDPE หนา"] },
    duct: { title: "🟠 สายในท่อ", use: "ร้อยผ่านท่อ อัปเกรดหรือเปลี่ยนได้โดยไม่ต้องขุด", layers: ["สายไมโคร", "ท่อไมโคร", "ท่อ HDPE"] },
  },
};

// ---------------------------------------------------------------- 2 organised cables

const FAULT = W(-1.33, -15, -0.83);
const OTDR = [W(1.3, -9, -1.9), W(0.9, -9, -0.83), W(-1.33, -9, -0.83), FAULT];
const BACKUP = [W(1.35, -34, -0.68), W(1.35, 13.4, -0.68)];
const BUNDLE = W(2.3, -16, -1.35);
const PHONE = W(3.4, -18.5, 1.3);
const IOT = [-29, -23, -17, -11, -5, 1, 7, 13].map((y) => W(-1.14, y, -2.07));
const IOT_UP = [IOT[2], IOT[4], IOT[6]];
const GATEWAY = W(1.3, -9, -0.6); // diagnostics cabinet C-2 doubles as the IoT gateway
const NEAR_HALF = (p) => p.z > 8; // the robot's tag shows on the near half only, clear of the page title

function OrganiseDemo({ movers }) {
  const { language } = useLanguage();
  const th = TH(language);
  const scan = cdemo.use((s) => s.scan);
  const fault = cdemo.use((s) => s.fault);
  const iot = cdemo.use((s) => s.iot);
  const [sp] = usePhase(scan, [0, 1.2], 9);
  const [fp] = usePhase(fault, [0, 2.2, 4.6, 7.5], 13);
  const robot = useMemo(() => movers.find((m) => m.name === "railbot"), [movers]);
  return (
    <group>
      {robot && (
        <Follow target={robot} dy={0} within={NEAR_HALF}>
          <Cone at={[0, 0, 0]} target={[0.6, -2.6, 0]} length={2.4} spread={0.5} sweep={0.4} color="#5ee7ff" />
          <Tag position={[0, 1.6, 0]}>
            <span className={cards.small}>{th ? "🤖 หุ่นตรวจ · อ่าน RFID 1,284 ป้าย · ร้อนผิดปกติ 0 จุด" : "🤖 Inspection robot · 1,284 RFID tags read · 0 hot spots"}</span>
          </Tag>
        </Follow>
      )}
      {sp >= 0 && (
        <>
          {sp === 0 && <Laser from={PHONE} to={BUNDLE} />}
          <Halo at={BUNDLE} r={0.4} color="#ffd43b" />
          <Tag position={[BUNDLE[0] + 1.2, BUNDLE[1] + 2.4, BUNDLE[2]]}>
            {sp === 0 ? (
              th ? "📱 สแกน QR / RFID บนสาย…" : "📱 Scanning the QR / RFID tag…"
            ) : (
              <>
                {th ? "🏷 FO-24-117 · ใยแก้ว 48 คอร์" : "🏷 FO-24-117 · 48-core fibre"}
                <br />
                <span className={cards.small}>{th ? "อาคาร B → ชุมสาย 3 · ติดตั้ง 03/2025 · ทดสอบล่าสุดผ่าน" : "Tower B → exchange 3 · laid 03/2025 · last test OK"}</span>
              </>
            )}
          </Tag>
        </>
      )}
      {fp >= 0 && (
        <>
          {fp < 3 && <Halo at={FAULT} r={0.45} />}
          {fp >= 1 && fp < 3 && <Flow points={OTDR} color="#ffd43b" radius={0.05} speed={4} dash={0.5} />}
          {fp >= 2 && <Flow points={BACKUP} color="#51cf66" radius={0.06} speed={3} />}
          <Tag position={[FAULT[0], FAULT[1] + 2.2, FAULT[2]]}>
            <span className={fp === 0 ? cards.warn : fp === 3 ? cards.ok : undefined}>
              {[
                th ? "💥 ใยแก้วขาด! ลิงก์ 40 Gbps หลุด" : "💥 Fibre cut! A 40 Gbps link is down",
                th ? "📡 OTDR ในตู้ C-2 เจอจุดขาดที่ 6.0 ม. (ข้อต่อ S-1)" : "📡 OTDR in cabinet C-2: break 6.0 m away (splice S-1)",
                th ? "↻ สลับไปวงสำรองใน 50 ms · ผู้ใช้ไม่รู้สึก" : "↻ Traffic switched to the backup ring in 50 ms",
                th ? "✓ ช่างต่อสายเสร็จใน 35 นาที" : "✓ Crew spliced it in 35 min",
              ][fp]}
            </span>
          </Tag>
        </>
      )}
      {iot && (
        <>
          <Pops points={IOT} shown={() => 1} colors={() => "#51cf66"} size={0.12} dy={0.1} />
          <Packets from={IOT_UP} to={GATEWAY} color="#51cf66" period={2} lift={3} />
          <Tag position={[IOT[2][0], IOT[2][1] + 1.2, IOT[2][2]]}>
            <span className={cards.small}>{th ? "🌡 31°C · 💧 64% · โหลด 42%" : "🌡 31 °C · 💧 64% · load 42%"}</span>
          </Tag>
          <Tag position={[GATEWAY[0], GATEWAY[1] + 1.2, GATEWAY[2]]}>
            <span className={cards.small}>{th ? "📶 ตู้ C-2 · เกตเวย์ IoT → คลาวด์" : "📶 Cabinet C-2 · IoT gateway → cloud"}</span>
          </Tag>
        </>
      )}
    </group>
  );
}

// a thin glowing line between two points
function Laser({ from, to, color = "#ff4d4d" }) {
  const { geo, quat } = useMemo(() => {
    const d = new THREE.Vector3(...to).sub(new THREE.Vector3(...from));
    return {
      geo: new THREE.CylinderGeometry(0.025, 0.025, d.length(), 6, 1, true).translate(0, d.length() / 2, 0),
      quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()),
    };
  }, [from, to]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow(color, 3), ...ADD }), [color]);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  return <mesh geometry={geo} material={mat} position={from} quaternion={quat} raycast={NOOP} />;
}

// ---------------------------------------------------------------- street systems (panel toggles)

const NET = {
  backbone: [W(-1.33, -34, -0.83), W(-1.33, 13.3, -0.83), W(-1.33, 14.2, 0.4), W(-3, 23.6, 1.1)],
  west: [W(-1.33, 0, -0.83), W(-6, 0, -0.6), W(-22, 0, 1.4)],
  east: [W(-1.33, -20, -0.83), W(6, -20, -0.6), W(22, -20, 1.4)],
};
const POWER = {
  feeder: [W(-4.62, -34, -2.74), W(-4.62, 13.3, -2.74)],
  west: [W(-4.62, -10, -2.74), W(-10, -10, -0.6), W(-14.5, -10, 0.3)],
  east: [W(-4.62, -2, -2.74), W(8, -2, -0.6), W(14.5, -2, 0.3)],
};
const TXS = {
  en: { backbone: "Fibre backbone · 10 Gbps", cabinet: "📶 Smart street cabinet · IoT gateway", homes: "🏠 FTTH 1 Gbps · 240 homes", feeder: "⚡ 22 kV armoured feeder", lights: "💡 48 LED street lights · 12 kW" },
  th: { backbone: "โครงข่ายใยแก้วหลัก · 10 Gbps", cabinet: "📶 ตู้อัจฉริยะริมถนน · เกตเวย์ IoT", homes: "🏠 ไฟเบอร์ถึงบ้าน 1 Gbps · 240 หลัง", feeder: "⚡ สายป้อนหุ้มเกราะ 22 kV", lights: "💡 ไฟถนน LED 48 ดวง · 12 kW" },
};

function StreetNetwork() {
  const { language } = useLanguage();
  const tx = TXS[language] || TXS.en;
  return (
    <group>
      <Flow points={NET.backbone} color="#8f9bff" radius={0.16} speed={2.4} />
      <Flow points={NET.west} color="#8f9bff" radius={0.12} speed={2} />
      <Flow points={NET.east} color="#8f9bff" radius={0.12} speed={2} />
      <Tag position={W(0, -28, 2.4)}>{tx.backbone}</Tag>
      <Tag position={W(-3, 24, 4.2)}>{tx.cabinet}</Tag>
      <Tag position={W(-20, 0, 5)}>{tx.homes}</Tag>
    </group>
  );
}

function StreetPower() {
  const { language } = useLanguage();
  const tx = TXS[language] || TXS.en;
  return (
    <group>
      <Flow points={POWER.feeder} color="#ffb13d" radius={0.18} speed={1.2} />
      <Flow points={POWER.west} color="#ffb13d" radius={0.12} speed={1.1} />
      <Flow points={POWER.east} color="#ffb13d" radius={0.12} speed={1.1} />
      <Tag position={W(-4.6, -30, 1.6)}>{tx.feeder}</Tag>
      <Tag position={W(-14.5, -17, 6.2)}>{tx.lights}</Tag>
    </group>
  );
}

// ---------------------------------------------------------------- dock (HTML, outside the canvas)

const DT = {
  en: {
    try: "Try it", title: "Street systems", net: "📶 Network", power: "⚡ Power", hint: "Click people or cars · pick a topic below",
    type: "Cable type", types: { armored: "Armored", fiber: "Fiber", direct: "Buried", duct: "Duct" }, storm: "⛈ Storm", emiOn: "⚡ Show interference", emiOff: "Hide interference",
    under: [["Outages / year", "0.4 (overhead 12)", 0.97, "#51cf66"], ["Service life", "40+ years", 0.8, "#4dabf7"], ["Street accidents", "−90%", 0.9, "#ffd43b"], ["Poles on the street", "0", 1, "#b197fc"]],
    scan: "🏷 Scan a cable tag", fault: "💥 Cut a fibre", iotOn: "Show IoT sensors", iotOff: "Hide IoT sensors",
    org: [["Fault located in", "3 min (was 2 days)", 0.95, "#51cf66"], ["Cables labelled", "100%", 1, "#4dabf7"], ["Uptime", "99.99%", 0.99, "#ffd43b"], ["Recyclable material", "85%", 0.85, "#8ce99a"]],
  },
  th: {
    try: "ลองเล่น", title: "ระบบใต้ถนน", net: "📶 เครือข่าย", power: "⚡ ไฟฟ้า", hint: "คลิกคนหรือรถได้ · เลือกหัวข้อด้านล่าง",
    type: "ชนิดสาย", types: { armored: "หุ้มเกราะ", fiber: "ใยแก้ว", direct: "ฝังตรง", duct: "ในท่อ" }, storm: "⛈ พายุ", emiOn: "⚡ แสดงสัญญาณรบกวน", emiOff: "ซ่อนสัญญาณรบกวน",
    under: [["ไฟดับ / ปี", "0.4 (สายอากาศ 12)", 0.97, "#51cf66"], ["อายุใช้งาน", "40+ ปี", 0.8, "#4dabf7"], ["อุบัติเหตุบนถนน", "−90%", 0.9, "#ffd43b"], ["เสาบนถนน", "0 ต้น", 1, "#b197fc"]],
    scan: "🏷 สแกนป้ายสาย", fault: "💥 ทำสายใยแก้วขาด", iotOn: "แสดงเซ็นเซอร์ IoT", iotOff: "ซ่อนเซ็นเซอร์ IoT",
    org: [["หาจุดเสียเจอใน", "3 นาที (เดิม 2 วัน)", 0.95, "#51cf66"], ["สายมีป้ายระบุ", "100%", 1, "#4dabf7"], ["ใช้งานได้", "99.99%", 0.99, "#ffd43b"], ["วัสดุรีไซเคิลได้", "85%", 0.85, "#8ce99a"]],
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

const DOCK = {
  "underground-cables": ({ t, s }) => (
    <>
      <div className={dock.label}>{t.type}</div>
      <Seg items={t.types} value={s.cable} onPick={(k) => cdemo.set({ cable: k })} />
      <div className={dock.grid}>
        <button type="button" className={dock.danger} onClick={() => cdemo.set({ storm: now() })}>
          {t.storm}
        </button>
        <button type="button" className={s.emi ? dock.on : dock.btn} onClick={() => cdemo.set({ emi: !s.emi })}>
          {s.emi ? t.emiOff : t.emiOn}
        </button>
      </div>
      <Bars rows={t.under} />
    </>
  ),
  "organize-cables": ({ t, s }) => (
    <>
      <div className={dock.grid}>
        <button type="button" className={dock.primary} onClick={() => cdemo.set({ scan: now() })}>
          {t.scan}
        </button>
        <button type="button" className={dock.danger} onClick={() => cdemo.set({ fault: now() })}>
          {t.fault}
        </button>
      </div>
      <button type="button" className={s.iot ? dock.on : dock.btn} onClick={() => cdemo.set({ iot: !s.iot })}>
        {s.iot ? t.iotOff : t.iotOn}
      </button>
      <Bars rows={t.org} />
    </>
  ),
};

export function CablesPanel({ hidden, activeId }) {
  const { language } = useLanguage();
  const t = DT[language] || DT.en;
  const s = cdemo.use();
  const sys = csys.use();
  const Section = DOCK[activeId];
  if (Section)
    return (
      <div className={dock.dock}>
        <div className={dock.head}>{t.try}</div>
        <Section t={t} s={s} />
      </div>
    );
  return (
    <div className={`${panel.panel} ${hidden ? panel.hidden : ""}`}>
      <div className={panel.title}>{t.title}</div>
      <div className={panel.row}>
        <button type="button" className={sys.net ? panel.onHvac : panel.btn} aria-pressed={sys.net} onClick={() => csys.set({ net: !sys.net })}>
          {t.net}
        </button>
        <button type="button" className={sys.power ? panel.onEnergy : panel.btn} aria-pressed={sys.power} onClick={() => csys.set({ power: !sys.power })}>
          {t.power}
        </button>
      </div>
      <p className={panel.hint}>{t.hint}</p>
    </div>
  );
}

// ---------------------------------------------------------------- reactions router (BakedModel's `reactions`)

export function CablesReactions({ active, movers, materials }) {
  const sys = csys.use();
  return (
    <>
      {sys.net && <StreetNetwork />}
      {sys.power && <StreetPower />}
      {active === "underground-cables" && <UndergroundDemo materials={materials} />}
      {active === "organize-cables" && <OrganiseDemo movers={movers} />}
    </>
  );
}
