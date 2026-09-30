// Building systems of the 02 Smart Hospital drawn over the baked campus: power (grid -> transformer -> main
// switchboard -> hall and towers, rooftop solar, battery, standby generators, the UPS-backed critical branch),
// chilled water from the inpatient-tower roof, and the medical-oxygen pipeline from the LOX tank to the beds.
// Coordinates from smart_hospital.py (Blender x, y, z -> three.js x, z, -y).
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Flow } from "../flow";
import { Rising, Tag } from "../reactions";

export const W = (x, y, z) => [x, z, -y];
const UP = 5.9;
const NOOP = () => {};

// ---------------------------------------------------------------- power
const P = {
  grid: [W(39, -21, 0.3), W(39, 21, 0.3), W(23.2, 21, 0.3), W(23.2, 27.3, 0.8)],
  tx: [W(24.5, 28.4, 1.4), W(25.7, 28.4, 1.4)],
  feeder: [W(27.8, 26.9, 0.5), W(27.8, 22.2, 0.3), W(-26, 22.2, 0.3)],
  hall: [W(17.6, 22.2, 0.3), W(17.6, 19.8, 0.4), W(17.6, 19.8, 5.2)],
  hallRing: [W(17.2, 19.4, 5.2), W(17.2, -9.4, 5.2), W(-27.4, -9.4, 5.2), W(-27.4, 19.4, 5.2), W(17.2, 19.4, 5.2)],
  ipd: [W(-2.7, 22.2, 0.3), W(-2.7, 24.3, 0.4), W(-2.7, 24.3, 35.4)],
  solar: [W(8, 27.6, 24.3), W(15.3, 24.7, 23.8), W(15.3, 24.7, 0.3), W(15.3, 22.2, 0.3)],
  gen1: [W(27.2, 24.8, 1.2), W(27.2, 26.8, 1.2)],
  gen2: [W(34.2, 24.8, 1.2), W(34.2, 25.9, 1.2), W(29.4, 25.9, 1.2), W(29.4, 26.8, 1.2)],
  bess: [W(32.1, 28.8, 1.2), W(29.95, 28.8, 1.2)],
  critical: [W(17.2, 19.3, UP + 2.9), W(-26.5, 19.3, UP + 2.9), W(-26.5, 13, UP + 2.9)],
};
export const GEN_STACKS = [W(25.4, 24.0, 5.0), W(32.4, 24.0, 5.0)];
export const ENERGY_YARD = W(29.7, 26.1, 0.4);

const TXP = {
  en: {
    grid: (v) => `⚡ Grid 22 kV · ${v} kW`, gridDown: "⚠ Grid failure", tx: "Transformer 22 kV → 400 V", solar: (v) => `☀ Rooftop solar ${v} kW`,
    bess: (v) => `🔋 Battery ${v}%`, gens: "Generators: standby · self-test weekly", gensRun: (s) => (s < 10 ? `Generators starting… ${s.toFixed(1)} s` : "Generators online · 2 × 1,000 kVA"),
    critical: "❤ Critical branch (ICU · OR · CT · data room) · UPS", load: (v) => `🏥 Hospital load ${v} kW`,
  },
  th: {
    grid: (v) => `⚡ ไฟฟ้าจากกริด 22 kV · ${v} kW`, gridDown: "⚠ ไฟฟ้าดับจากกริด", tx: "หม้อแปลง 22 kV → 400 V", solar: (v) => `☀ โซลาร์บนหลังคา ${v} kW`,
    bess: (v) => `🔋 แบตเตอรี่ ${v}%`, gens: "เครื่องปั่นไฟ: สแตนด์บาย · ทดสอบทุกสัปดาห์", gensRun: (s) => (s < 10 ? `เครื่องปั่นไฟกำลังสตาร์ต… ${s.toFixed(1)} วิ` : "เครื่องปั่นไฟจ่ายไฟแล้ว · 2 × 1,000 kVA"),
    critical: "❤ วงจรวิกฤต (ICU · ห้องผ่าตัด · CT · ห้องข้อมูล) · UPS", load: (v) => `🏥 โรงพยาบาลใช้ไฟ ${v} kW`,
  },
};

const POWER = "#ffb13d";
const CRIT = "#ff6b8b";
const DEAD = new THREE.Color("#5a6270");
const LIVE = new THREE.Color(POWER);

// phase: "normal" | "cut" (grid lost, UPS and battery carry the critical branch) | "gen" (generators on) ; t: seconds since the cut
export function PowerNetwork({ phase = "normal", t = 0 }) {
  const { language } = useLanguage();
  const tx = TXP[language] || TXP.en;
  const [v, setV] = useState({ grid: 820, solar: 64, load: 1080, bess: 78 });
  useEffect(() => {
    const id = setInterval(() => {
      const k = performance.now() / 1000;
      setV({ grid: Math.round(820 + 40 * Math.sin(k * 0.3)), solar: Math.round(64 + 9 * Math.sin(k * 0.21)), load: Math.round(1080 + 35 * Math.sin(k * 0.17)), bess: 78 });
    }, 700);
    return () => clearInterval(id);
  }, []);
  const down = phase !== "normal";
  const gens = phase === "gen";
  return (
    <group>
      <Flow points={P.grid} color={POWER} radius={0.4} speed={1.3} on={!down} />
      <Flow points={P.tx} color={POWER} radius={0.3} speed={1.3} on={!down} />
      <Flow points={P.feeder} color={POWER} radius={0.45} speed={down && !gens ? 0.2 : 1.2} tint={() => (down && !gens ? DEAD : LIVE)} />
      <Flow points={P.hall} color={POWER} radius={0.35} speed={1.1} on={!down || gens} />
      <Flow points={P.hallRing} color={POWER} radius={0.2} speed={0.9} dash={2.4} on={!down || gens} />
      <Flow points={P.ipd} color={POWER} radius={0.3} speed={1.1} on={!down || gens} />
      <Flow points={P.solar} color="#ffd23f" radius={0.3} speed={1.0} />
      <Flow points={P.bess} color="#7cffb0" radius={0.3} speed={down ? 1.6 : 0.4} />
      <Flow points={P.gen1} color="#ffe066" radius={0.32} speed={1.6} on={gens} />
      <Flow points={P.gen2} color="#ffe066" radius={0.32} speed={1.6} on={gens} />
      <Flow points={P.critical} color={CRIT} radius={0.26} speed={1.4} />
      {down && t > 0.8 && GEN_STACKS.map((s, i) => <Rising key={i} at={s} spread={0.4} count={18} height={5} color={gens ? "#cfd6de" : "#9aa3ad"} speed={gens ? 2.2 : 1.2} size={0.3} />)}
      <Tag position={W(39, 4, 3.5)}>{down ? tx.gridDown : tx.grid(v.grid)}</Tag>
      <Tag position={W(23.2, 28.4, 4.6)}>{tx.tx}</Tag>
      <Tag position={W(8, 27.6, 27.5)}>{tx.solar(v.solar)}</Tag>
      <Tag position={W(34.6, 28.8, 4.6)}>{tx.bess(down ? Math.max(60, Math.round(78 - t * 0.6)) : v.bess)}</Tag>
      <Tag position={W(30.7, 23.6, 7.4)}>{down ? tx.gensRun(t) : tx.gens}</Tag>
      <Tag position={W(-6, 19.3, UP + 4.6)}>{tx.critical}</Tag>
      <Tag position={W(-2.7, 24.3, 38)}>{tx.load(v.load)}</Tag>
    </group>
  );
}

// ---------------------------------------------------------------- chilled water
const H = {
  roof: [W(-7.8, 25.9, 36.4), W(-4.2, 24.3, 36.2), W(-4.2, 24.3, 8.6)],
  roofRet: [W(-4.6, 24.1, 8.2), W(-4.6, 24.1, 36.0), W(-9.6, 26.8, 36.4)],
  bridge: [W(-4.2, 24.3, 8.6), W(-7.2, 24.3, 8.6), W(-7.2, 20.6, 8.6)],
  upper: [W(-7.2, 19.2, UP + 2.6), W(17, 19.2, UP + 2.6), W(17, 12.8, UP + 2.6), W(2.3, 12.8, UP + 2.6)],
  data: [W(-7.2, 19.2, UP + 2.6), W(-27.2, 19.2, UP + 2.6), W(-27.2, 12.8, UP + 2.6), W(-12.3, 12.8, UP + 2.6)],
  ground: [W(-7.2, 19.4, 4.9), W(17.2, 19.4, 4.9), W(17.2, -9.2, 4.9), W(-27.2, -9.2, 4.9), W(-27.2, 19.4, 4.9), W(-7.2, 19.4, 4.9)],
};
const TXH = {
  en: { chw: "❄ Chilled water 7 °C · 640 kW cooling", data: "Data room 21 °C ±0.5 · precision cooling", diag: "CT room 20 °C · HEPA", ward: "Isolation room −12 Pa (negative pressure)" },
  th: { chw: "❄ น้ำเย็น 7°C · ทำความเย็น 640 kW", data: "ห้องข้อมูล 21°C ±0.5 · แอร์ความแม่นยำสูง", diag: "ห้อง CT 20°C · กรอง HEPA", ward: "ห้องแยกโรค −12 Pa (ความดันลบ)" },
};

export function HvacNetwork() {
  const { language } = useLanguage();
  const tx = TXH[language] || TXH.en;
  return (
    <group>
      <Flow points={H.roof} color="#4fd1ff" radius={0.34} speed={1.3} />
      <Flow points={H.roofRet} color="#ff9f5a" radius={0.3} speed={1.1} />
      <Flow points={H.bridge} color="#4fd1ff" radius={0.3} speed={1.3} />
      <Flow points={H.upper} color="#4fd1ff" radius={0.22} speed={1.0} dash={2.2} />
      <Flow points={H.data} color="#4fd1ff" radius={0.22} speed={1.0} dash={2.2} />
      <Flow points={H.ground} color="#4fd1ff" radius={0.18} speed={0.8} dash={2.4} />
      <Tag position={W(-7.8, 25.9, 40)}>{tx.chw}</Tag>
      <Tag position={W(-20, 13.5, UP + 3.6)}>{tx.data}</Tag>
      <Tag position={W(-5, 13.5, UP + 3.6)}>{tx.diag}</Tag>
      <Tag position={W(16.6, 17.1, UP + 3.4)}>{tx.ward}</Tag>
    </group>
  );
}

// ---------------------------------------------------------------- medical oxygen
const BED_HEADS = [[3.8, 19.75], [6.9, 19.75], [10.0, 19.75], [17.7, 18.4], [17.7, 15.8]];
const O2 = {
  main: [W(24.3, 24.1, 3.9), W(24.3, 22.0, 0.6), W(18.4, 22.0, 0.6), W(18.4, 19.95, 1.2), W(18.4, 19.95, UP + 1.4)],
  ward: [W(18.4, 19.95, UP + 1.4), W(2.4, 19.95, UP + 1.4)],
  side: [W(18.4, 19.6, UP + 1.4), W(18.1, 18.4, UP + 1.4), W(18.1, 15.8, UP + 1.4)],
};
export const BEDS = BED_HEADS.map(([x, y]) => W(x, y, UP + 1.2));
const TXO = {
  en: { tank: "O₂ liquid-oxygen tank 76% · 11,400 L", line: "Pipeline 4.2 bar · alarm panel OK", beds: (n) => `Bed outlets ${n}/5 · flow monitored` },
  th: { tank: "ถังออกซิเจนเหลว 76% · 11,400 ลิตร", line: "ท่อจ่าย 4.2 บาร์ · แผงเตือนปกติ", beds: (n) => `หัวจ่ายข้างเตียง ${n}/5 · วัดอัตราไหลตลอด` },
};

export function OxygenNetwork({ boost = -1 }) {
  const { language } = useLanguage();
  const tx = TXO[language] || TXO.en;
  const geo = useMemo(() => new THREE.SphereGeometry(0.13, 12, 10), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color("#8cff9a").multiplyScalar(2.4), toneMapped: false }), []);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  const refs = useRef([]);
  useFrame(({ clock }) => refs.current.forEach((m, i) => m && m.scale.setScalar(1 + (i === boost ? 0.6 : 0.2) * Math.sin(clock.elapsedTime * (i === boost ? 9 : 3) + i))));
  return (
    <group>
      <Flow points={O2.main} color="#63e6be" radius={0.2} speed={1.4} />
      <Flow points={O2.ward} color="#63e6be" radius={0.12} speed={1.2} dash={1.4} />
      <Flow points={O2.side} color="#63e6be" radius={0.12} speed={1.2} dash={1.4} />
      {BEDS.map((b, i) => (
        <mesh key={i} ref={(o) => (refs.current[i] = o)} geometry={geo} material={mat} position={b} raycast={NOOP} />
      ))}
      <Tag position={W(22.4, 24.3, 10)}>{tx.tank}</Tag>
      <Tag position={W(18.4, 21.5, 4)}>{tx.line}</Tag>
      <Tag position={W(10, 19.9, UP + 3.3)}>{tx.beds(5)}</Tag>
    </group>
  );
}
