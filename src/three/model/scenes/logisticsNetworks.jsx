// Hub systems of the 04 Smart Logistics centre drawn over the baked model: the order flow (an order at the POS
// shop, picked in the racks, scanned on the belt, measured, loaded at a dock, out through the gate) and fleet GPS
// (a pin over every truck, van, forklift and robot that moves). Coordinates from smart_logistics.py
// (Blender x, y, z -> three.js x, z, -y).
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Flow } from "../flow";
import { Tag } from "../reactions";
import cards from "./buildingDemos2.module.css";
import { ADD, Follow, NOOP, glow } from "./demoKit";

export const W = (x, y, z) => [x, z, -y];
export const FLOOR = 1.2;
const ON_BASE = [43, 32]; // pins leave with the vehicle when it drives off the plinth

// ---------------------------------------------------------------- order flow
const STEPS = [W(-21, -12.5, 5.2), W(-23, 4, 8.4), W(-5, -1, FLOOR + 4.4), W(6.2, 7.5, FLOOR + 5.2), W(12, 10, 6.4), W(29, -15.5, 5.2), W(40, -25, 3)];
const ROUTE = [STEPS[0], W(-22, -6, 7.6), STEPS[1], W(-14, 1, 7.4), STEPS[2], W(1, 4, 6.6), STEPS[3], STEPS[4], W(20, -4, 6), STEPS[5], STEPS[6]];
const TXO = {
  en: ["① Order at the POS", "② Picked from rack C-12", "③ Scanned on the belt", "④ Measured · 0.42 m³", "⑤ Loaded at dock 3", "⑥ Out of the gate · GPS on", "⑦ Delivered · ETA 14:20"],
  th: ["① สั่งซื้อที่ POS", "② หยิบจากชั้น C-12", "③ สแกนบนสายพาน", "④ วัดขนาด · 0.42 ลบ.ม.", "⑤ ขึ้นรถที่ท่า 3", "⑥ ออกจากประตู · เปิด GPS", "⑦ ส่งถึงลูกค้า · ถึง 14:20"],
};

export function OrderFlow() {
  const { language } = useLanguage();
  const tx = TXO[language] || TXO.en;
  return (
    <group>
      <Flow points={ROUTE} color="#ffd43b" radius={0.26} speed={1.2} dash={3} />
      {STEPS.map((p, i) => (
        <Tag key={i} position={[p[0], p[1] + 1.2, p[2]]}>
          <span className={cards.small}>{tx[i]}</span>
        </Tag>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------- fleet GPS

// a map pin floating over a vehicle
export function GpsPin({ color = "#4dff9a", size = 1 }) {
  const cone = useMemo(() => new THREE.ConeGeometry(0.28 * size, 0.7 * size, 16).rotateX(Math.PI), [size]);
  const ball = useMemo(() => new THREE.SphereGeometry(0.32 * size, 16, 12), [size]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow(color, 2.4), ...ADD, opacity: 0.9 }), [color]);
  useEffect(() => () => [cone, ball, mat].forEach((x) => x.dispose()), [cone, ball, mat]);
  return (
    <group>
      <mesh geometry={cone} material={mat} position={[0, 0.35 * size, 0]} raycast={NOOP} />
      <mesh geometry={ball} material={mat} position={[0, 0.85 * size, 0]} raycast={NOOP} />
    </group>
  );
}

// movers of the model by kind: trucks on the yard loop, road cars, the forklift and the AMRs
export function useFleet(movers) {
  return useMemo(() => {
    const by = (re) => movers.filter((m) => re.test(m.name));
    return { trucks: by(/^haul\d+$/), cars: by(/^car_/), fork: by(/^fork\d+$/), amrs: by(/^amr\d+$/) };
  }, [movers]);
}

export const TRUCK_IDS = ["TKC-01", "TKC-02", "TKC-03", "TKC-04"];
const SPEEDS = [42, 38, 45, 40];

export function FleetGps({ movers }) {
  const { language } = useLanguage();
  const th = language === "th";
  const fleet = useFleet(movers);
  return (
    <group>
      {fleet.trucks.map((m, i) => (
        <Follow key={m.uuid} target={m} dy={4.4} within={ON_BASE}>
          <GpsPin />
          <Tag position={[0, 2.4, 0]}>
            <span className={cards.small}>{`🚚 ${TRUCK_IDS[i % 4]} · ${SPEEDS[i % 4]} km/h`}</span>
          </Tag>
        </Follow>
      ))}
      {fleet.cars.map((m) => (
        <Follow key={m.uuid} target={m} dy={2.2} within={ON_BASE}>
          <GpsPin color="#8f9bff" size={0.7} />
        </Follow>
      ))}
      {fleet.fork.map((m) => (
        <Follow key={m.uuid} target={m} dy={3.1} within={ON_BASE}>
          <GpsPin color="#ffd43b" size={0.7} />
          <Tag position={[0, 1.6, 0]}>
            <span className={cards.small}>{th ? "🏗 รถยก · แบต 76%" : "🏗 Forklift · battery 76%"}</span>
          </Tag>
        </Follow>
      ))}
      {fleet.amrs.map((m) => (
        <Follow key={m.uuid} target={m} dy={2.3} within={ON_BASE}>
          <GpsPin color="#63e6be" size={0.55} />
        </Follow>
      ))}
    </group>
  );
}
