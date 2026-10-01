// Campus systems of the 03 Smart Learning school drawn over the baked model: power (rooftop solar on the
// classroom block, the battery, the grid, feeds to the hall and the sports hall) and the network (fibre in from
// the street, the mast, the data centre, Wi-Fi in the hall and the cloud LMS above it).
// Coordinates from smart_learning.py (Blender x, y, z -> three.js x, z, -y).
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Flow } from "../flow";
import { Packets, Rings, Tag } from "../reactions";
import { ADD, NOOP, glow } from "./demoKit";

export const W = (x, y, z) => [x, z, -y];
export const HALL_Z = 7.2; // the learning hall sits on the Learning Commons: its contents are this much higher
export const WH = (x, y, z) => W(x, y, z + HALL_Z); // a point in the hall, given at its old ground-level height
export const CEIL = 7.4 + HALL_Z;

// ---------------------------------------------------------------- power
const P = {
  solar: [W(-20, 26.9, 11.9), W(-3.2, 24.0, 11.9), W(-3.2, 24.0, 0.4), W(-3.2, 21.3, 0.3), W(21.8, 21.3, 0.3), W(22.3, 24.5, 1.2)],
  grid: [W(41, -21, 0.3), W(41, 21.3, 0.3), W(30.6, 21.3, 0.3), W(30.2, 24.5, 1.2)],
  bess: [W(30.05, 29.3, 1.3), W(30.05, 27.2, 1.3)],
  hall: [W(22.4, 23.4, 0.4), W(19.8, 21.3, 0.3), W(16.3, 17.0, 0.3), W(16.3, 16.7, CEIL - 0.4)],
  ring: [W(15.6, 15.6, CEIL - 0.4), W(-19.6, 15.6, CEIL - 0.4), W(-19.6, -7.6, CEIL - 0.4), W(15.6, -7.6, CEIL - 0.4), W(15.6, 15.6, CEIL - 0.4)],
  gym: [W(19.8, 21.3, 0.3), W(9, 21.3, 0.3), W(9, 22.1, 1.0)],
};
const TXP = {
  en: { solar: (v) => `☀ Rooftop solar ${v} kW`, bess: (v) => `🔋 Battery ${v}% · charging`, grid: (v) => `⚡ Grid ${v} kW`, load: (v, p) => `🏫 School uses ${v} kW · solar covers ${p}%` },
  th: { solar: (v) => `☀ โซลาร์บนหลังคา ${v} kW`, bess: (v) => `🔋 แบตเตอรี่ ${v}% · กำลังชาร์จ`, grid: (v) => `⚡ ไฟจากกริด ${v} kW`, load: (v, p) => `🏫 โรงเรียนใช้ไฟ ${v} kW · โซลาร์ช่วยได้ ${p}%` },
};

export function PowerNetwork() {
  const { language } = useLanguage();
  const tx = TXP[language] || TXP.en;
  const [v, setV] = useState({ solar: 86, load: 124, bess: 74 });
  useEffect(() => {
    const id = setInterval(() => {
      const k = performance.now() / 1000;
      setV({ solar: Math.round(86 + 8 * Math.sin(k * 0.23)), load: Math.round(124 + 9 * Math.sin(k * 0.17)), bess: 74 + Math.round(((k / 30) % 1) * 3) });
    }, 800);
    return () => clearInterval(id);
  }, []);
  const grid = Math.max(0, v.load - v.solar);
  return (
    <group>
      <Flow points={P.solar} color="#ffd23f" radius={0.32} speed={1.3} />
      <Flow points={P.grid} color="#ffb13d" radius={0.32} speed={0.8} />
      <Flow points={P.bess} color="#7cffb0" radius={0.28} speed={-1.0} />
      <Flow points={P.hall} color="#ffb13d" radius={0.3} speed={1.1} />
      <Flow points={P.ring} color="#ffb13d" radius={0.16} speed={0.9} dash={2.4} />
      <Flow points={P.gym} color="#ffb13d" radius={0.24} speed={1.0} />
      <Tag position={W(-20, 26.9, 14.2)}>{tx.solar(v.solar)}</Tag>
      <Tag position={W(32.6, 29.3, 4.6)}>{tx.bess(v.bess)}</Tag>
      <Tag position={W(41, 2, 3.2)}>{tx.grid(grid)}</Tag>
      <Tag position={WH(0, 16.4, 10.2)}>{tx.load(v.load, Math.round((v.solar / v.load) * 100))}</Tag>
    </group>
  );
}

// ---------------------------------------------------------------- network
const N = {
  fibre: [W(41, -21.4, 0.25), W(41, 20.8, 0.25), W(38.6, 20.8, 0.25), W(37.4, 23.3, 0.6)],
  toDc: [W(35.7, 24.2, 1.2), W(30.1, 25.5, 1.6)],
  toHall: [W(22.4, 25.5, 1.8), W(19.6, 20.8, 0.35), W(15.8, 16.8, 0.35), W(15.8, 16.8, CEIL - 0.2)],
};
// the ceiling sensors of the hall double as Wi-Fi access points
export const APS = [[-14, 0], [-8, 0], [4, 0], [10, 0], [-14, 10], [4, 10], [10, 10]].map(([x, y]) => W(x, y, CEIL - 0.1));
export const SKY_CLOUD = W(26, 25, 27);
const MAST_TOP = [W(37.4, 24.2, 16)];
const TXN = {
  en: { fibre: "Fibre 10 Gbps in from the street", dc: "Data centre · 12 servers · 21 °C", wifi: "Wi-Fi 6 · 412 devices online", cloud: "☁ Cloud LMS · 99.99% uptime · daily backups" },
  th: { fibre: "ไฟเบอร์ 10 Gbps เข้าจากถนน", dc: "ห้องดาต้าเซ็นเตอร์ · เซิร์ฟเวอร์ 12 ตัว · 21°C", wifi: "Wi-Fi 6 · อุปกรณ์ออนไลน์ 412 เครื่อง", cloud: "☁ คลาวด์ LMS · ใช้งานได้ 99.99% · สำรองข้อมูลทุกวัน" },
};

// a soft holographic cloud in the sky over the campus (where the LMS lives)
export function SkyCloud({ at = SKY_CLOUD, scale = 1 }) {
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 2), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#8fd8ff", 1.2), ...ADD, opacity: 0.35 }), []);
  const wire = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#5ee7ff", 2), ...ADD, opacity: 0.35, wireframe: true }), []);
  useEffect(() => () => [geo, mat, wire].forEach((x) => x.dispose()), [geo, mat, wire]);
  const puffs = [[0, 0, 0, 2.4], [-2.4, -0.5, 0.3, 1.8], [2.3, -0.6, -0.2, 1.9], [0.9, 1.1, 0.4, 1.6], [-1.1, 0.9, -0.3, 1.5]];
  useFrame(({ clock }) => (mat.opacity = 0.3 + 0.08 * Math.sin(clock.elapsedTime * 1.5)));
  return (
    <group position={at} scale={scale}>
      {puffs.map(([x, y, z, r], i) => (
        <group key={i}>
          <mesh geometry={geo} material={mat} position={[x, y, z]} scale={r} raycast={NOOP} />
          <mesh geometry={geo} material={wire} position={[x, y, z]} scale={r * 1.02} raycast={NOOP} />
        </group>
      ))}
    </group>
  );
}

export function NetNetwork() {
  const { language } = useLanguage();
  const tx = TXN[language] || TXN.en;
  return (
    <group>
      <Flow points={N.fibre} color="#8f9bff" radius={0.22} speed={2.2} />
      <Flow points={N.toDc} color="#8f9bff" radius={0.2} speed={2.2} />
      <Flow points={N.toHall} color="#8f9bff" radius={0.22} speed={2.0} />
      {APS.map((a, i) => (
        <Rings key={i} at={[a[0], a[1] - 0.2, a[2]]} radius={3.2} color="#8f9bff" count={2} period={2.2 + (i % 3) * 0.3} />
      ))}
      <Packets from={MAST_TOP} to={SKY_CLOUD} color="#5ee7ff" period={1.6} lift={3} />
      <SkyCloud />
      <Tag position={W(41, 4, 2.6)}>{tx.fibre}</Tag>
      <Tag position={W(26.2, 25.7, 6)}>{tx.dc}</Tag>
      <Tag position={W(-2, 5.3, CEIL + 1.2)}>{tx.wifi}</Tag>
      <Tag position={[SKY_CLOUD[0], SKY_CLOUD[1] + 3.6, SKY_CLOUD[2]]}>{tx.cloud}</Tag>
    </group>
  );
}
