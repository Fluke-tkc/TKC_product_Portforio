// "Try it" demos of the 06 Autonomous district, one per infographic (AS_1 ... AS_4), drawn over the baked model:
// 1 security systems (normal / night-vision / thermal view, an intruder at the fence met by AI detection, cameras,
//   the drone's spotlight and the control room, a cyber attack the system heals itself from), 2 autonomous vehicles
//   (V2V / V2I / V2N / V2P links live between the moving vehicles, the shuttle's sensors, the HD map, a pedestrian at
//   the crossing), 3 industrial robots (a worker breaks the light curtain and the arms really stop, AI vision rejects
//   a part, AGV sensors and types), 4 service robots (healthcare / inspection / field / logistic robots, a greeting).
// Also the district-systems overlay (5G, every robot), the panel and the reactions router used by SmartAutonomous.jsx.
// Coordinates from smart_autonomous.py (Blender x, y, z -> three.js x, z, -y).
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Flow } from "../flow";
import { Cone, Packets, Rings, Tag } from "../reactions";
import dock from "./buildingDemos.module.css";
import cards from "./buildingDemos2.module.css";
import panel from "./buildingSystems.module.css";
import { ADD, Figure, Follow, LinkLines, NOOP, Seg, TH, Wire, glow, now, useClearSpot, usePhase } from "./demoKit";
import { GpsPin } from "./logisticsNetworks";
import { ademo, asys } from "./autonomousStore";

const W = (x, y, z) => [x, z, -y];
const FL = 0.3; // factory floor
const V3 = (p) => new THREE.Vector3(...p);
const byName = (movers, re) => movers.filter((m) => re.test(m.name));

// ---------------------------------------------------------------- shared pieces

// a light cone from a moving object down to a fixed point (the drone's spotlight)
function Spotlight({ from, to, color = "#fff3bf" }) {
  const geo = useMemo(() => new THREE.CylinderGeometry(0.05, 1.4, 1, 24, 1, true).translate(0, -0.5, 0), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow(color, 1.6), ...ADD, opacity: 0.28 }), [color]);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  const ref = useRef();
  const a = useMemo(() => new THREE.Vector3(), []);
  const b = useMemo(() => V3(to), [to]);
  const d = useMemo(() => new THREE.Vector3(), []);
  const down = useMemo(() => new THREE.Vector3(0, -1, 0), []);
  useFrame(() => {
    if (!from) return;
    from.getWorldPosition(a);
    d.subVectors(b, a);
    const len = d.length();
    ref.current.position.copy(a);
    ref.current.quaternion.setFromUnitVectors(down, d.normalize());
    ref.current.scale.set(1, len, 1);
  });
  return <mesh ref={ref} geometry={geo} material={mat} raycast={NOOP} />;
}

// warm blobs over people and robots in the thermal view
function HeatBlobs({ objs }) {
  const geo = useMemo(() => new THREE.SphereGeometry(0.55, 14, 10), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#ffa94d", 2.6), ...ADD, opacity: 0.8 }), []);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  const ref = useRef();
  const p = useMemo(() => new THREE.Vector3(), []);
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    objs.forEach((o, i) => {
      o.getWorldPosition(p);
      const s = 1 + 0.12 * Math.sin(clock.elapsedTime * 5 + i);
      m4.makeScale(s, s * 1.5, s).setPosition(p.x, p.y + 1, p.z);
      ref.current.setMatrixAt(i, m4);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return objs.length ? <instancedMesh ref={ref} args={[geo, mat, objs.length]} frustumCulled={false} raycast={NOOP} /> : null;
}

// the whole model in another light (night vision, thermal); null = normal. Restores the colours when it ends.
function useLook(materials, look) {
  useEffect(() => {
    materials.forEach((m) => m.color.copy(m.userData.base));
    if (look) materials.forEach((m) => m.color.multiply(look));
  }, [materials, look]);
  useEffect(() => () => materials.forEach((m) => m.color.copy(m.userData.base)), [materials]);
}

// ---------------------------------------------------------------- 1 security systems

const PILLARS = [[-24.8, -19.4], [-9, -20.6], [-9, -29.6], [-20, -25.4], [-29.5, -30.3]].map(([x, y]) => W(x, y, 4.7));
const INTRUDER = W(-26, -17.4, 0.16); // at the north fence, between pillars 0 and 3
const OPS_WALL = W(-30.6, -26.7, 4.3);
const OPS_TAG = W(-30, -26.7, 8.4);
const HACKER = [W(-8, -46, 22)];
const LOOKS = { normal: null, night: new THREE.Color(0.35, 0.95, 0.42), thermal: new THREE.Color(0.22, 0.26, 0.55) };

function SecurityDemo({ movers, materials }) {
  const { language } = useLanguage();
  const th = TH(language);
  const view = ademo.use((s) => s.view);
  const intruder = ademo.use((s) => s.intruder);
  const cyber = ademo.use((s) => s.cyber);
  const [ip] = usePhase(intruder, [0, 2, 4.5, 8], 14);
  const [cp] = usePhase(cyber, [0, 2.4, 4.8], 11);
  useLook(materials, LOOKS[view]);
  const drone = useMemo(() => movers.find((m) => m.name === "secdrone"), [movers]);
  const warm = useMemo(() => byName(movers, /^(ped\d+|patrol)$/), [movers]);
  const lines = th
    ? ["📳 รั้วสั่น + ตรวจจับการเคลื่อนไหว · โซน B", "🧠 AI: คนกำลังปีนรั้ว · มั่นใจ 97%", "🚁 โดรนส่องไฟ + ไซเรน · หุ่นลาดตระเวนกำลังไป", "✓ แจ้ง รปภ. + ตำรวจแล้ว · คลิปเก็บบนคลาวด์"]
    : ["📳 Fence vibration + motion · zone B", "🧠 AI: person climbing the fence · 97%", "🚁 Drone spotlight + siren · patrol robot on its way", "✓ Guard + police alerted · clip saved to the cloud"];
  return (
    <group>
      {view === "thermal" && <HeatBlobs objs={warm} />}
      <Tag position={OPS_TAG}>
        <span className={cards.small}>{th ? "🖥 ศูนย์ควบคุม 24/7 · ดูผ่านคลาวด์และมือถือ" : "🖥 24/7 control room · cloud + mobile app"}</span>
      </Tag>
      {ip >= 0 && (
        <>
          {ip < 3 && <Figure at={INTRUDER} />}
          {ip === 0 && <Rings at={[INTRUDER[0], 0.2, INTRUDER[2]]} radius={3} color="#ff4d4d" period={0.8} />}
          {ip >= 1 && ip < 3 && (
            <>
              <Wire at={INTRUDER} size={[1, 2, 1]} />
              {[PILLARS[0], PILLARS[3]].map((p, i) => (
                <Cone key={i} at={p} target={INTRUDER} length={8} spread={0.18} sweep={0.05} color="#ff4d4d" />
              ))}
            </>
          )}
          {ip === 2 && <Spotlight from={drone} to={INTRUDER} />}
          {ip === 3 && <Packets from={PILLARS} to={OPS_WALL} color="#5ee7ff" period={1.4} lift={3} />}
          <Tag position={[INTRUDER[0], INTRUDER[1] + 3, INTRUDER[2]]}>
            <span className={ip < 2 ? cards.warn : ip === 3 ? cards.ok : undefined}>{lines[ip]}</span>
          </Tag>
        </>
      )}
      {cp >= 0 && (
        <>
          {cp === 0 && <Packets from={HACKER} to={PILLARS[3]} color="#ff4d4d" period={1} lift={4} />}
          <Rings at={[PILLARS[3][0], 0.2, PILLARS[3][2]]} radius={2.6} color={cp === 2 ? "#51cf66" : cp === 1 ? "#ffd43b" : "#ff4d4d"} period={0.9} />
          <Tag position={[PILLARS[3][0], PILLARS[3][1] + 1.6, PILLARS[3][2]]}>
            <span className={cp === 0 ? cards.warn : cp === 2 ? cards.ok : undefined}>
              {[th ? "🦠 มัลแวร์โจมตีกล้อง C-4" : "🦠 Malware hits camera C-4", th ? "🛡 AI แยกกล้องออก · ย้อนเฟิร์มแวร์" : "🛡 AI isolates C-4 · rolls back firmware", th ? "✓ C-4 กลับมาออนไลน์ใน 8 วิ" : "✓ C-4 back online in 8 s"][cp]}
            </span>
          </Tag>
        </>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- 2 autonomous vehicles

const RSU = [[-5, -5.4], [24, -5.4], [10, -16.1], [-28, -16.1], [5, 17.8]].map(([x, y]) => V3(W(x, y, 5.8)));
const MAST = V3(W(0.5, 8.5, 19.5));
const BOARD_TAG = W(3, 4, 7.6); // over the park, left of the globe, clear of the info panel
const CROSSING = W(4.3, -6.6, 0.16);
const LANES = [
  [W(-10, -8.2, 0.08), W(20, -8.2, 0.08), W(20, 15, 0.08), W(-10, 15, 0.08), W(-10, -8.2, 0.08)],
  [W(-44, -8.2, 0.06), W(-10, -8.2, 0.06)],
  [W(44, -11.8, 0.06), W(-44, -11.8, 0.06)],
];
const ON_BASE = (p) => Math.abs(p.x) < 43 && Math.abs(p.z) < 32;
const NEAR_SIDE = (p) => p.z > -2; // the shuttle's tag shows on the near half of its loop, clear of the page title
const LINK_COLOR = { v2v: "#5ee7ff", v2i: "#ffd43b", v2n: "#b197fc", v2p: "#8cff9a" };

function VehicleDemo({ movers }) {
  const { language } = useLanguage();
  const th = TH(language);
  const link = ademo.use((s) => s.link);
  const sensors = ademo.use((s) => s.sensors);
  const map = ademo.use((s) => s.map);
  const walker = ademo.use((s) => s.walker);
  const [wp] = usePhase(walker, [0, 2.4, 5.4], 10);
  const cars = useMemo(() => byName(movers, /^(shuttle|podtaxi|cart|thru_e|thru_w\d)$/), [movers]);
  const people = useMemo(() => byName(movers, /^ped\d+$/), [movers]);
  const shuttle = useMemo(() => movers.find((m) => m.name === "shuttle"), [movers]);
  const pos = useMemo(() => new Map(), []);
  const at = (o) => {
    let v = pos.get(o);
    if (!v) pos.set(o, (v = new THREE.Vector3()));
    return o.getWorldPosition(v).add({ x: 0, y: 1.4, z: 0 });
  };
  const pairs = () => {
    const on = cars.filter((c) => ON_BASE(at(c)));
    if (link === "v2n") return on.map((c) => [at(c), MAST]);
    if (link === "v2i")
      return on.map((c) => {
        const a = at(c);
        return [a, RSU.reduce((b, r) => (r.distanceTo(a) < b.distanceTo(a) ? r : b))];
      });
    if (link === "v2p")
      return people.flatMap((p) => {
        const a = at(p);
        const near = on.map((c) => at(c)).filter((c) => c.distanceTo(a) < 16);
        return near.map((c) => [a, c]);
      });
    const out = [];
    on.forEach((a, i) => on.slice(i + 1).forEach((b) => at(a).distanceTo(at(b)) < 34 && out.push([at(a), at(b)])));
    return out;
  };
  const tx = (VX[language] || VX.en)[link];
  return (
    <group>
      <LinkLines pairs={pairs} color={LINK_COLOR[link]} />
      <Tag position={BOARD_TAG}>
        {tx[0]}
        <br />
        <span className={cards.small}>{tx[1]}</span>
      </Tag>
      {map && (
        <>
          {LANES.map((l, i) => (
            <Flow key={i} points={l} color="#5ee7ff" radius={0.07} speed={2} dash={1.2} />
          ))}
        </>
      )}
      {sensors && shuttle && (
        <Follow target={shuttle} turn>
          <Rings at={[0, 2.6, 0]} radius={7} color="#5ee7ff" period={1.4} />
          <Cone at={[3.6, 1, 0]} target={[20, 0.6, 0]} length={16} spread={0.12} sweep={0.08} color="#ffd43b" />
          <Cone at={[3.6, 1.8, 0]} target={[12, 0.2, 0]} length={9} spread={0.35} sweep={0.2} color="#b197fc" />
        </Follow>
      )}
      {sensors && shuttle && (
        <Follow target={shuttle} dy={4.4} within={NEAR_SIDE}>
          <Tag position={[0, 0, 0]}>
            <span className={cards.small}>{th ? "🚌 LiDAR 360° · เรดาร์ 200 ม. · กล้อง 8 ตัว · GPS ±2 ซม." : "🚌 LiDAR 360° · radar 200 m · 8 cameras · GPS ±2 cm"}</span>
          </Tag>
        </Follow>
      )}
      {wp >= 0 && (
        <>
          {wp < 2 && <Figure at={CROSSING} color="#8cff9a" />}
          {wp < 2 && <Wire at={CROSSING} size={[1, 2, 1]} color="#8cff9a" />}
          <Rings at={[CROSSING[0], 0.2, CROSSING[2]]} radius={4} color={wp === 1 ? "#ffd43b" : "#8cff9a"} period={1} />
          <Tag position={[CROSSING[0] + 5, 3, CROSSING[2]]}>
            <span className={wp === 2 ? cards.ok : undefined}>
              {[th ? "🚸 คนจะข้ามถนน · มือถือส่ง V2P + กล้องเห็น" : "🚸 Pedestrian at the crossing · phone V2P + camera", th ? "🛑 รถทุกคันชะลอ 10 กม./ชม. · จอดตรงเส้น" : "🛑 Every vehicle slows to 10 km/h · precise stop", th ? "✓ ข้ามปลอดภัย · รถออกตัวต่อ" : "✓ Crossed safely · traffic moves on"][wp]}
            </span>
          </Tag>
        </>
      )}
    </group>
  );
}

const VX = {
  en: {
    v2v: ["V2V · vehicle to vehicle", "Speed, braking and lane shared 10× a second"],
    v2i: ["V2I · vehicle to roadside unit", "Signal timing, road works and hazards ahead"],
    v2n: ["V2N · vehicle to network (5G)", "HD-map updates, fleet control, remote operation"],
    v2p: ["V2P · vehicle to pedestrian", "Phones and wearables warn cars of people nearby"],
  },
  th: {
    v2v: ["V2V · รถคุยกับรถ", "แชร์ความเร็ว การเบรก และเลน 10 ครั้ง/วินาที"],
    v2i: ["V2I · รถคุยกับอุปกรณ์ข้างถนน", "จังหวะไฟ งานถนน และอันตรายข้างหน้า"],
    v2n: ["V2N · รถคุยกับเครือข่าย 5G", "อัปเดตแผนที่ HD ควบคุมฟลีต สั่งการระยะไกล"],
    v2p: ["V2P · รถคุยกับคนเดินเท้า", "มือถือและอุปกรณ์สวมใส่เตือนรถว่ามีคนใกล้"],
  },
};

// ---------------------------------------------------------------- 3 industrial robots

const CURTAIN_AT = W(-36.2, 14, FL + 0.9);
const WORKER = W(-35.7, 13, FL);
const QC = W(-28, 21, FL + 0.9);
const AISLE = [[-38.6, 2.5], [-17.2, 2.5], [-17.2, 25.5], [-38.6, 25.5], [-38.6, 2.5]].map(([x, y]) => W(x, y, FL + 0.06));
const AGV_TX = {
  en: ["🛒 Cart AGV · 300 kg · LiDAR + ultrasonic", "🚜 Towing AGV · 3 carts · 1.5 t", "🏗 Forklift AGV · pallets up to 1.2 t"],
  th: ["🛒 AGV แบบรถเข็น · 300 กก. · LiDAR + อัลตราโซนิก", "🚜 AGV ลากจูง · 3 คัน · 1.5 ตัน", "🏗 AGV รถยก · พาเลทถึง 1.2 ตัน"],
};

function LightCurtain({ color }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }), [color]);
  useEffect(() => () => mat.dispose(), [mat]);
  useFrame(({ clock }) => (mat.opacity = 0.25 + 0.15 * Math.sin(clock.elapsedTime * 8)));
  return (
    <mesh material={mat} position={CURTAIN_AT} rotation={[0, Math.PI / 2, 0]} raycast={NOOP}>
      <planeGeometry args={[16.4, 1.8]} />
    </mesh>
  );
}

function IndustryDemo({ movers, anim, t }) {
  const { language } = useLanguage();
  const th = TH(language);
  const worker = ademo.use((s) => s.worker);
  const qc = ademo.use((s) => s.qc);
  const agv = ademo.use((s) => s.agv);
  const clear = useClearSpot();
  const [wp] = usePhase(worker, [0, 1.5, 6], 9);
  const [qp] = usePhase(qc, [0, 1.6, 4.2], 9);
  const arms = useMemo(() => anim.filter((o) => /^arm\d[tu]$/.test(o.name)), [anim]);
  const agvs = useMemo(() => byName(movers, /^agv\d$/), [movers]);
  const parts = useMemo(() => byName(movers, /^part\d+$/), [movers]);
  const stop = wp === 0 || wp === 1;
  // the arms really stop while the curtain is broken, and carry on from where they were
  useFrame(() => {
    arms.forEach((o) => {
      const u = o.userData;
      if (stop && u.hold === undefined) {
        u.hold = t.current - (u.toff ?? 0);
        u.pausedAt = t.current;
      } else if (!stop && u.hold !== undefined) {
        u.toff = (u.toff ?? 0) + t.current - u.pausedAt;
        delete u.hold;
      }
    });
  });
  useEffect(
    () => () =>
      arms.forEach((u) => {
        if (u.userData.hold !== undefined) {
          u.userData.toff = (u.userData.toff ?? 0) + t.current - u.userData.pausedAt;
          delete u.userData.hold;
        }
      }),
    [arms, t]
  );
  // the part that the QC arch flags: the one nearest to it when the check starts
  const flagged = useMemo(() => {
    if (qp < 0) return null;
    const q = V3(QC);
    const p = new THREE.Vector3();
    return parts.reduce((best, o) => (o.getWorldPosition(p).distanceTo(q) < (best ? best.getWorldPosition(new THREE.Vector3()).distanceTo(q) : 1e9) ? o : best), null);
  }, [qp >= 0, parts]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <group>
      {wp >= 0 && (
        <>
          <LightCurtain color={stop ? "#ff4d4d" : "#51cf66"} />
          {stop && <Figure at={WORKER} color="#ffd43b" />}
          <Tag position={[WORKER[0], 3.4, WORKER[2]]}>
            <span className={stop ? cards.warn : cards.ok}>
              {wp === 0 ? (th ? "⚠ มีคนผ่านม่านแสง · หยุดแขนกลทั้ง 4 ใน 0.2 วิ" : "⚠ Light curtain broken · all 4 arms stopped in 0.2 s") : wp === 1 ? (th ? "🦺 แขนกลรอ จนกว่าคนออกจากเขต" : "🦺 Arms wait until the zone is clear") : th ? "✓ เขตปลอดภัย · ทำงานต่อ" : "✓ Zone clear · cell restarts"}
            </span>
          </Tag>
        </>
      )}
      {qp >= 0 && (
        <>
          <Rings at={QC} radius={1.6} color={qp === 2 ? "#51cf66" : "#ff4d4d"} period={0.8} vertical />
          {flagged && qp >= 1 && (
            <Follow target={flagged}>
              <Wire at={[0, -0.05, 0]} size={[0.8, 0.5, 0.65]} />
            </Follow>
          )}
          <Tag position={[QC[0], QC[1] + 2.6, QC[2]]}>
            <span className={qp === 2 ? cards.ok : cards.warn}>
              {[th ? "🔍 AI vision: รอยขีด 3 มม. บนชิ้น #4471" : "🔍 AI vision: 3 mm scratch on part #4471", th ? "✗ คัดออกไปจุดซ่อม · ของเสีย 0.3%" : "✗ Rejected to rework · 0.3% defects", th ? "✓ สายการผลิตเดินต่อไม่ต้องหยุด" : "✓ The line never stopped"][qp]}
            </span>
          </Tag>
        </>
      )}
      {agv && (
        <>
          <Flow points={AISLE} color="#ffd43b" radius={0.08} speed={1.5} dash={1.4} />
          {agvs.map((o, i) => (
            <group key={o.uuid}>
              <Follow target={o}>
                <Rings at={[0, 0.3, 0]} radius={3.2} color="#5ee7ff" count={2} period={1.3} />
              </Follow>
              <Follow target={o} dy={2.8} within={clear}>
                <Tag position={[0, 0, 0]}>
                  <span className={cards.small}>{(AGV_TX[language] || AGV_TX.en)[i]}</span>
                </Tag>
              </Follow>
            </group>
          ))}
        </>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- 4 service robots

const GREETER = W(6, -24.2, 0.16);
const GUEST = W(4.9, -24.2, 0.16);
const CARER = W(24.6, -28, 0.16);
const LOCKER = W(27.9, -23.95, 1.1);
const LOCKER_TAG = W(24.5, -23.5, 2.8); // left of the lockers, clear of the info panel
// the farm sits at the top edge of this view: its robots are described at the plaza's north edge, pointing there
const FIELD_FROM = [W(17, -17, 3)];
const FARM = W(30, 12, 2);
const ROBOTS = {
  healthcare: { static: CARER },
  inspection: { movers: /^dog$/ },
  field: { movers: /^(tractor|agridrone)$/ },
  logistic: { movers: /^deliv\d$/, static: LOCKER },
};
const RX = {
  en: {
    healthcare: ["🩺 Care robot guides a patient", "Pulse 72 bpm · SpO₂ 98% · to the clinic"],
    inspection: { dog: "🐕 Inspection robot · thermal + gas check · 0 alarms" },
    field: { tractor: "🚜 Driverless tractor · seeding row 7 · RTK ±2 cm", agridrone: "🛸 Crop drone · NDVI 0.82 · soil moisture 31%" },
    logistic: { deliv0: "📦 Delivery robot · parcel for locker B2", deliv1: "📦 Delivery robot · lunch to the office", locker: "🔐 Locker B2 · code sent by SMS" },
  },
  th: {
    healthcare: ["🩺 หุ่นดูแลพาผู้ป่วยไปคลินิก", "ชีพจร 72 · ออกซิเจน 98%"],
    inspection: { dog: "🐕 หุ่นตรวจการณ์ · สแกนความร้อน + ก๊าซ · ปกติ" },
    field: { tractor: "🚜 รถไถไร้คนขับ · หว่านแถว 7 · RTK ±2 ซม.", agridrone: "🛸 โดรนเกษตร · NDVI 0.82 · ความชื้นดิน 31%" },
    logistic: { deliv0: "📦 หุ่นส่งของ · พัสดุไปตู้ B2", deliv1: "📦 หุ่นส่งของ · อาหารกลางวันไปออฟฟิศ", locker: "🔐 ตู้ B2 · ส่งรหัสทาง SMS แล้ว" },
  },
};

function ServiceDemo({ movers }) {
  const { language } = useLanguage();
  const th = TH(language);
  const robot = ademo.use((s) => s.robot);
  const greet = ademo.use((s) => s.greet);
  const [gp] = usePhase(greet, [0, 1.8, 4.2], 9);
  const spec = ROBOTS[robot];
  const tx = (RX[language] || RX.en)[robot];
  const picked = useMemo(() => (spec.movers ? byName(movers, spec.movers) : []), [movers, spec]);
  const clear = useClearSpot();
  return (
    <group>
      {picked.map((o) => (
        <group key={o.uuid}>
          <Follow target={o}>
            <Rings at={[0, 0.2, 0]} radius={2.4} color="#ffd43b" count={2} period={1.2} />
          </Follow>
          {robot !== "field" && (
            <Follow target={o} dy={2.4} within={clear}>
              <Tag position={[o.name === "dog" ? 3.5 : 0, 0, 0]}>
                <span className={cards.small}>{tx[o.name]}</span>
              </Tag>
            </Follow>
          )}
        </group>
      ))}
      {robot === "healthcare" && (
        <>
          <Rings at={[CARER[0], 0.2, CARER[2]]} radius={2.4} color="#ffd43b" count={2} period={1.2} />
          <Tag position={[CARER[0] - 4.5, 2.8, CARER[2]]}>
            {tx[0]}
            <br />
            <span className={cards.small}>{tx[1]}</span>
          </Tag>
        </>
      )}
      {robot === "field" && (
        <>
          <Packets from={FIELD_FROM} to={FARM} color="#8ce99a" period={1.8} lift={4} />
          <Tag position={FIELD_FROM[0]}>
            {tx.tractor}
            <br />
            <span className={cards.small}>{tx.agridrone}</span>
          </Tag>
        </>
      )}
      {robot === "logistic" && (
        <>
          <Wire at={[LOCKER[0], LOCKER[1] - 0.3, LOCKER[2]]} size={[0.62, 0.64, 0.82]} color="#51cf66" />
          <Tag position={LOCKER_TAG}>
            <span className={cards.small}>{tx.locker}</span>
          </Tag>
        </>
      )}
      {gp >= 0 && (
        <>
          {gp === 0 && <Wire at={GUEST} size={[0.8, 1.9, 0.8]} color="#5ee7ff" />}
          <Rings at={[GREETER[0], 0.2, GREETER[2]]} radius={2} color="#5ee7ff" period={1} />
          <Tag position={[GREETER[0], 3, GREETER[2]]}>
            <span className={gp === 2 ? cards.ok : undefined}>
              {[th ? "👋 สวัสดีค่ะ คุณนก! (จดจำใบหน้า)" : "👋 Welcome back, Khun Nok! (face ID)", th ? "📅 นัด 10:30 ห้อง 2 · เชิญตามมาค่ะ" : "📅 Your 10:30 is in room 2 · follow me", th ? "🌐 พูดได้ ไทย / อังกฤษ / จีน / ญี่ปุ่น" : "🌐 Speaks Thai / English / Chinese / Japanese"][gp]}
            </span>
          </Tag>
        </>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- district systems (panel toggles)

const MAST_FROM = [W(0.5, 8.5, 19.5)];
const NET_TO = [W(-36, -26.5, 7.6), W(-28, 12, 9.8), W(35.7, -26, 5.4), W(33, 16, 2)];
const TXN = {
  en: { mast: "📶 5G + C-V2X · 8 ms", sec: "Security", fac: "Factory", svc: "Robotics centre", farm: "Farm" },
  th: { mast: "📶 5G + C-V2X · 8 ms", sec: "ความปลอดภัย", fac: "โรงงาน", svc: "ศูนย์หุ่นยนต์", farm: "ฟาร์ม" },
};

function District5G() {
  const { language } = useLanguage();
  const tx = TXN[language] || TXN.en;
  return (
    <group>
      {NET_TO.map((to, i) => (
        <Packets key={i} from={MAST_FROM} to={to} color="#b197fc" period={1.8} lift={4} />
      ))}
      <Rings at={MAST_FROM[0]} radius={9} color="#b197fc" period={2} vertical />
      <Tag position={[MAST_FROM[0][0], MAST_FROM[0][1] + 1.6, MAST_FROM[0][2]]}>{tx.mast}</Tag>
      {[tx.sec, tx.fac, tx.svc, tx.farm].map((name, i) => (
        <Tag key={i} position={[NET_TO[i][0], NET_TO[i][1] + 1.2, NET_TO[i][2]]}>
          <span className={cards.small}>{name}</span>
        </Tag>
      ))}
    </group>
  );
}

function AllRobots({ movers }) {
  const list = useMemo(() => byName(movers, /^(shuttle|podtaxi|cart|patrol|deliv\d|cleaner|dog|tractor|secdrone|agridrone|agv\d)$/), [movers]);
  return list.map((o) => (
    <Follow key={o.uuid} target={o} dy={/drone/.test(o.name) ? 1.2 : 3} within={[43, 32]}>
      <GpsPin color={/drone/.test(o.name) ? "#ffd43b" : "#63e6be"} size={0.7} />
    </Follow>
  ));
}

// ---------------------------------------------------------------- dock (HTML, outside the canvas)

const DT = {
  en: {
    try: "Try it", title: "District systems", net: "📶 5G network", robots: "🤖 Every robot", hint: "Click people, robots or vehicles · pick a topic below",
    view: "Camera view", views: { normal: "Normal", night: "Night vision", thermal: "Thermal" }, intruder: "🚨 Intruder at the fence", cyber: "🦠 Cyber attack",
    sec: [["Cameras online", "12 / 12", 1, "#51cf66"], ["Response time", "9 s", 0.9, "#4dabf7"], ["False alarms", "−80%", 0.8, "#ffd43b"], ["Patrol coverage", "100%", 1, "#b197fc"]],
    link: "Link", links: { v2v: "V2V", v2i: "V2I", v2n: "V2N", v2p: "V2P" }, walker: "🚸 Pedestrian crossing", sensorsOn: "Show shuttle sensors", sensorsOff: "Hide shuttle sensors", mapOn: "Show HD map", mapOff: "Hide HD map",
    veh: [["5G latency", "8 ms", 0.92, "#51cf66"], ["Position", "±2 cm (RTK)", 0.95, "#4dabf7"], ["Collisions", "−90%", 0.9, "#ffd43b"]],
    worker: "🦺 Worker enters the cell", qc: "🔍 AI quality check", agvOn: "Show AGV sensors", agvOff: "Hide AGV sensors",
    ind: [["OEE", "92%", 0.92, "#51cf66"], ["Runs", "24/7", 1, "#4dabf7"], ["Output", "+35%", 0.7, "#ffd43b"], ["Defects", "0.3%", 0.97, "#b197fc"]],
    robot: "Robot", robotsList: { healthcare: "Care", inspection: "Inspect", field: "Field", logistic: "Delivery" }, greet: "👋 Greet a visitor",
    svc: [["Visitors helped", "184 today", 0.74, "#51cf66"], ["Deliveries", "62 today", 0.62, "#4dabf7"], ["Robot uptime", "99%", 0.99, "#ffd43b"], ["Staff time saved", "3.5 h/day", 0.7, "#b197fc"]],
  },
  th: {
    try: "ลองเล่น", title: "ระบบในย่าน", net: "📶 เครือข่าย 5G", robots: "🤖 หุ่นยนต์ทุกตัว", hint: "คลิกคน หุ่นยนต์ หรือรถได้ · เลือกหัวข้อด้านล่าง",
    view: "มุมกล้อง", views: { normal: "ปกติ", night: "กลางคืน", thermal: "ความร้อน" }, intruder: "🚨 มีคนบุกรุกที่รั้ว", cyber: "🦠 โจมตีไซเบอร์",
    sec: [["กล้องออนไลน์", "12 / 12", 1, "#51cf66"], ["เวลาตอบสนอง", "9 วิ", 0.9, "#4dabf7"], ["แจ้งเตือนผิด", "−80%", 0.8, "#ffd43b"], ["พื้นที่ลาดตระเวน", "100%", 1, "#b197fc"]],
    link: "การเชื่อมต่อ", links: { v2v: "V2V", v2i: "V2I", v2n: "V2N", v2p: "V2P" }, walker: "🚸 คนข้ามถนน", sensorsOn: "แสดงเซ็นเซอร์รถ shuttle", sensorsOff: "ซ่อนเซ็นเซอร์รถ shuttle", mapOn: "แสดงแผนที่ HD", mapOff: "ซ่อนแผนที่ HD",
    veh: [["ความหน่วง 5G", "8 ms", 0.92, "#51cf66"], ["ตำแหน่ง", "±2 ซม. (RTK)", 0.95, "#4dabf7"], ["อุบัติเหตุ", "−90%", 0.9, "#ffd43b"]],
    worker: "🦺 พนักงานเข้าเขตแขนกล", qc: "🔍 AI ตรวจคุณภาพ", agvOn: "แสดงเซ็นเซอร์ AGV", agvOff: "ซ่อนเซ็นเซอร์ AGV",
    ind: [["OEE", "92%", 0.92, "#51cf66"], ["ทำงาน", "24/7", 1, "#4dabf7"], ["กำลังผลิต", "+35%", 0.7, "#ffd43b"], ["ของเสีย", "0.3%", 0.97, "#b197fc"]],
    robot: "หุ่นยนต์", robotsList: { healthcare: "ดูแล", inspection: "ตรวจการณ์", field: "เกษตร", logistic: "ส่งของ" }, greet: "👋 ต้อนรับผู้มาเยือน",
    svc: [["ช่วยผู้มาเยือน", "184 คนวันนี้", 0.74, "#51cf66"], ["ส่งของ", "62 ครั้งวันนี้", 0.62, "#4dabf7"], ["หุ่นพร้อมใช้", "99%", 0.99, "#ffd43b"], ["ประหยัดเวลาพนักงาน", "3.5 ชม./วัน", 0.7, "#b197fc"]],
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
  "security-systems": ({ t, s }) => (
    <>
      <div className={dock.label}>{t.view}</div>
      <Seg items={t.views} value={s.view} onPick={(k) => ademo.set({ view: k })} />
      <div className={dock.grid}>
        <button type="button" className={dock.danger} onClick={() => ademo.set({ intruder: now() })}>
          {t.intruder}
        </button>
        <button type="button" className={dock.danger} onClick={() => ademo.set({ cyber: now() })}>
          {t.cyber}
        </button>
      </div>
      <Bars rows={t.sec} />
    </>
  ),
  vehicles: ({ t, s }) => (
    <>
      <div className={dock.label}>{t.link}</div>
      <Seg items={t.links} value={s.link} onPick={(k) => ademo.set({ link: k })} />
      <button type="button" className={dock.primary} onClick={() => ademo.set({ walker: now(), link: "v2p" })}>
        {t.walker}
      </button>
      <div className={dock.grid}>
        <button type="button" className={s.sensors ? dock.on : dock.btn} onClick={() => ademo.set({ sensors: !s.sensors })}>
          {s.sensors ? t.sensorsOff : t.sensorsOn}
        </button>
        <button type="button" className={s.map ? dock.on : dock.btn} onClick={() => ademo.set({ map: !s.map })}>
          {s.map ? t.mapOff : t.mapOn}
        </button>
      </div>
      <Bars rows={t.veh} />
    </>
  ),
  "industrial-robot": ({ t, s }) => (
    <>
      <div className={dock.grid}>
        <button type="button" className={dock.danger} onClick={() => ademo.set({ worker: now() })}>
          {t.worker}
        </button>
        <button type="button" className={dock.primary} onClick={() => ademo.set({ qc: now() })}>
          {t.qc}
        </button>
      </div>
      <button type="button" className={s.agv ? dock.on : dock.btn} onClick={() => ademo.set({ agv: !s.agv })}>
        {s.agv ? t.agvOff : t.agvOn}
      </button>
      <Bars rows={t.ind} />
    </>
  ),
  "service-robot": ({ t, s }) => (
    <>
      <div className={dock.label}>{t.robot}</div>
      <Seg items={t.robotsList} value={s.robot} onPick={(k) => ademo.set({ robot: k })} />
      <button type="button" className={dock.primary} onClick={() => ademo.set({ greet: now() })}>
        {t.greet}
      </button>
      <Bars rows={t.svc} />
    </>
  ),
};

export function AutonomousPanel({ hidden, activeId }) {
  const { language } = useLanguage();
  const t = DT[language] || DT.en;
  const s = ademo.use();
  const sys = asys.use();
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
        <button type="button" className={sys.net ? panel.onHvac : panel.btn} aria-pressed={sys.net} onClick={() => asys.set({ net: !sys.net })}>
          {t.net}
        </button>
        <button type="button" className={sys.robots ? panel.onEnergy : panel.btn} aria-pressed={sys.robots} onClick={() => asys.set({ robots: !sys.robots })}>
          {t.robots}
        </button>
      </div>
      <p className={panel.hint}>{t.hint}</p>
    </div>
  );
}

// ---------------------------------------------------------------- reactions router (BakedModel's `reactions`)

export function AutonomousReactions({ active, movers, materials, anim, t }) {
  const sys = asys.use();
  return (
    <>
      {sys.net && <District5G />}
      {sys.robots && <AllRobots movers={movers} />}
      {active === "security-systems" && <SecurityDemo movers={movers} materials={materials} />}
      {active === "vehicles" && <VehicleDemo movers={movers} />}
      {active === "industrial-robot" && <IndustryDemo movers={movers} anim={anim} t={t} />}
      {active === "service-robot" && <ServiceDemo movers={movers} />}
    </>
  );
}
