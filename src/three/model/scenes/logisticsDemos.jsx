// "Try it" demos of the 04 Smart Logistics, one per infographic (lg_1 ... lg_5), drawn over the baked hub:
// 1 smart scan (every parcel read in the tunnel, barcode / QR / RFID, a handheld scan synced over Wi-Fi, a torn
//   label rescued by the side cameras), 2 route optimisation (the route wall: manual vs AI plan, an accident and a
//   reroute, a storm, driver scores), 3 cargo volume (LiDAR measuring a pallet, dock fill sensors, an AI load plan,
//   volume forecast), 4 transfer & delivery (live truck GPS, auto-dispatch, proof of delivery), 5 POS (checkout by
//   card / QR / wallet with stock sync, a member recognised, a locker pickup, the layout per business).
// Also the panel (hub-system toggles or the dock) and the reactions router used by SmartLogistics.jsx.
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Flow } from "../flow";
import { Cone, Packets, Rings, Tag } from "../reactions";
import dock from "./buildingDemos.module.css";
import cards from "./buildingDemos2.module.css";
import panel from "./buildingSystems.module.css";
import { ADD, Follow, NOOP, Pops, Seg, TH, glow, now, usePhase } from "./demoKit";
import { FLOOR, FleetGps, GpsPin, OrderFlow, TRUCK_IDS, W, useFleet } from "./logisticsNetworks";
import { gdemo, gsys } from "./logisticsStore";

const V3 = (p) => new THREE.Vector3(...p);
const CONTROL = W(-1, 17.6, 8.8); // over the mezzanine control room (WMS / TMS)

// a thin glowing line between two points (laser beams)
function Laser({ from, to, color = "#ff4d4d", width = 0.025 }) {
  const { geo, pos, quat } = useMemo(() => {
    const a = V3(from);
    const d = V3(to).sub(a);
    return {
      geo: new THREE.CylinderGeometry(width, width, d.length(), 6, 1, true).translate(0, d.length() / 2, 0),
      pos: a,
      quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()),
    };
  }, [from, to, width]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow(color, 3), ...ADD }), [color]);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  return <mesh geometry={geo} material={mat} position={pos} quaternion={quat} raycast={NOOP} />;
}

// the edges of a box (size in three.js x, y, z) standing on `at`
function Wire({ at, size, color = "#5ee7ff" }) {
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(...size)).translate(0, size[1] / 2, 0), [size]);
  const mat = useMemo(() => new THREE.LineBasicMaterial({ color: glow(color, 2.6), toneMapped: false }), [color]);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  return <lineSegments geometry={geo} material={mat} position={at} raycast={NOOP} />;
}

// a glowing dot running round a polyline (a truck on the route map)
function Runner({ points, period = 8, color = "#ffffff", size = 0.12 }) {
  const path = useMemo(() => {
    const pts = points.map(V3);
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
    return { pts, cum };
  }, [points]);
  const geo = useMemo(() => new THREE.SphereGeometry(size, 12, 10), [size]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow(color, 3), toneMapped: false }), [color]);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  const ref = useRef();
  useFrame(({ clock }) => {
    const { pts, cum } = path;
    const d = ((clock.elapsedTime / period) % 1) * cum[cum.length - 1];
    let i = 1;
    while (i < cum.length - 1 && cum[i] < d) i++;
    ref.current.position.lerpVectors(pts[i - 1], pts[i], (d - cum[i - 1]) / (cum[i] - cum[i - 1] || 1));
  });
  return <mesh ref={ref} geometry={geo} material={mat} raycast={NOOP} />;
}

// ---------------------------------------------------------------- 1 smart scan

const TUNNEL = W(-5, -1, FLOOR + 0.9);
const GUN = W(-4.7, 3.55, FLOOR + 1.07); // the handheld at packing station a1, next to the tunnel
const BELT_SPOT = W(-4.9, 3.9, FLOOR + 1.12); // the parcel on its table
const SCAN_TAG = W(-8, -1, FLOOR + 3.2);
const CODE_COLOR = { barcode: "#ff4d4d", qr: "#5ee7ff", rfid: "#8cff9a" };
const SCAN_TX = {
  en: { barcode: "Barcode", qr: "QR", rfid: "RFID", read: (n, c) => `✓ #TKC-${40210 + n} · ${c} · 0.42×0.35×0.28 m → zone B`, today: (n) => `Read today ${(1204 + n).toLocaleString()} · 99.9% first time` },
  th: { barcode: "บาร์โค้ด", qr: "QR", rfid: "RFID", read: (n, c) => `✓ #TKC-${40210 + n} · ${c} · 0.42×0.35×0.28 ม. → โซน B`, today: (n) => `อ่านวันนี้ ${(1204 + n).toLocaleString()} ชิ้น · อ่านได้ครั้งแรก 99.9%` },
};

// every parcel passing the tunnel is read: the curtain flashes, the parcel carries a green dot for a while
function ScanTunnel({ parcels, code, torn, quiet }) {
  const { language } = useLanguage();
  const tx = SCAN_TX[language] || SCAN_TX.en;
  const [count, setCount] = useState(0);
  const inside = useRef([]);
  const readAt = useRef([]);
  const flash = useRef(-9);
  const curtain = useMemo(() => new THREE.MeshBasicMaterial({ color: glow(CODE_COLOR[code], 2.4), ...ADD, opacity: 0 }), [code]);
  const dotGeo = useMemo(() => new THREE.SphereGeometry(0.1, 10, 8), []);
  const dotMat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#51cf66", 3), toneMapped: false }), []);
  useEffect(() => () => [curtain, dotGeo, dotMat].forEach((x) => x.dispose()), [curtain, dotGeo, dotMat]);
  const dots = useRef();
  const p = useMemo(() => new THREE.Vector3(), []);
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    parcels.forEach((o, k) => {
      o.getWorldPosition(p);
      const now_ = Math.abs(p.x - TUNNEL[0]) < 0.4 && Math.abs(p.z - TUNNEL[2]) < 0.8;
      if (now_ && !inside.current[k]) {
        flash.current = t;
        readAt.current[k] = t;
        setCount((n) => n + 1);
      }
      inside.current[k] = now_;
      const s = t - (readAt.current[k] ?? -99) < 16 ? 1 : 0;
      m4.makeScale(s, s, s).setPosition(p.x, p.y + 0.55, p.z);
      dots.current.setMatrixAt(k, m4);
    });
    dots.current.instanceMatrix.needsUpdate = true;
    const f = Math.max(0, 1 - (t - flash.current) / 0.8);
    curtain.opacity = torn ? 0.35 + 0.3 * Math.abs(Math.sin(t * 8)) : 0.12 + 0.6 * f;
  });
  const name = tx[code];
  return (
    <group>
      <mesh material={curtain} position={[TUNNEL[0], TUNNEL[1] + 0.55, TUNNEL[2]]} rotation={[0, Math.PI / 2, 0]} raycast={NOOP}>
        <planeGeometry args={[1.3, 1.2]} />
      </mesh>
      {code === "rfid" && <Rings at={[TUNNEL[0], FLOOR + 0.05, TUNNEL[2]]} radius={2.2} color="#8cff9a" period={1.2} />}
      <instancedMesh ref={dots} args={[dotGeo, dotMat, parcels.length]} frustumCulled={false} raycast={NOOP} />
      {!quiet && (
        <Tag position={SCAN_TAG}>
          {tx.read(count, name)}
          <br />
          <span className={cards.small}>{tx.today(count)}</span>
        </Tag>
      )}
    </group>
  );
}

function ScanDemo({ movers }) {
  const { language } = useLanguage();
  const th = TH(language);
  const code = gdemo.use((s) => s.code);
  const hand = gdemo.use((s) => s.hand);
  const damaged = gdemo.use((s) => s.damaged);
  const [hp] = usePhase(hand, [0, 1.2, 3], 10);
  const [dp] = usePhase(damaged, [0, 2.6, 5.2], 11);
  const parcels = useMemo(() => movers.filter((m) => /^parcel\d+$/.test(m.name)), [movers]);
  return (
    <group>
      <ScanTunnel parcels={parcels} code={code} torn={dp === 0} quiet={dp >= 0} />
      {dp >= 0 && (
        <>
          <Rings at={[TUNNEL[0], FLOOR + 0.05, TUNNEL[2]]} radius={2.6} color={dp === 0 ? "#ff4d4d" : dp === 1 ? "#ffd43b" : "#51cf66"} period={0.9} />
          <Tag position={SCAN_TAG}>
            <span className={dp === 0 ? cards.warn : dp === 2 ? cards.ok : undefined}>
              {[th ? "✗ บาร์โค้ดขาด อ่านไม่ได้" : "✗ Barcode torn — unreadable", th ? "↻ กล้อง 5 ด้านหา QR ที่ข้างกล่อง" : "↻ 5-side cameras find the QR on the side", th ? "✓ ยืนยันด้วย QR · ไม่ต้องพิมพ์เอง" : "✓ Verified by QR · no manual entry"][dp]}
            </span>
          </Tag>
        </>
      )}
      {hp === 0 && <Laser from={GUN} to={BELT_SPOT} color={CODE_COLOR[code]} />}
      {hp === 1 && <Packets from={[GUN]} to={CONTROL} color="#5ee7ff" period={1.1} lift={2} />}
      {hp >= 0 && (
        <>
          <Rings at={[GUN[0], FLOOR + 0.05, GUN[2]]} radius={1.4} color="#5ee7ff" period={1} />
          <Tag position={[GUN[0] - 2.2, GUN[1] + 1.0, GUN[2]]}>
            {hp === 0 ? (th ? "🔫 สแกนด้วยเครื่องพกพา…" : "🔫 Handheld scan…") : hp === 1 ? (th ? "📶 ส่งผ่าน Wi-Fi เข้า WMS · 0.3 วิ" : "📶 Sent over Wi-Fi to the WMS · 0.3 s") : (
              <>
                {th ? "📦 SKU 88514 · เมล็ดกาแฟ 1 กก." : "📦 SKU 88514 · coffee beans 1 kg"}
                <br />
                <span className={cards.small}>{th ? "ชั้น C-12 · คงเหลือ 42 · ฿380" : "Rack C-12 · 42 in stock · ฿380"}</span>
              </>
            )}
          </Tag>
        </>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- 2 route optimisation (the route wall)

const MAP = (u, v) => W(-6.3 + u * 10.6, 19.6, 7.0 + v * 2.1);
const HUB = [0.06, 0.45];
const STOPS = [[0.22, 0.82], [0.35, 0.22], [0.5, 0.62], [0.64, 0.18], [0.78, 0.78], [0.93, 0.42]];
// along the streets: across first, then up or down
const street = (legs) => legs.flatMap(([a, b], i) => [...(i ? [] : [a]), [b[0], a[1]], b]).map(([u, v]) => MAP(u, v));
const tour = (order) => {
  const pts = [HUB, ...order.map((k) => STOPS[k]), HUB];
  return pts.slice(1).map((b, i) => [pts[i], b]);
};
const MANUAL = street(tour([3, 0, 4, 1, 5, 2]));
const AI = street(tour([0, 2, 4, 5, 3, 1]));
const DETOUR = street([[HUB, STOPS[0]], [STOPS[0], STOPS[2]], [STOPS[2], [0.5, 0.95]], [[0.5, 0.95], [0.78, 0.95]], [[0.78, 0.95], STOPS[4]], [STOPS[4], STOPS[5]], [STOPS[5], STOPS[3]], [STOPS[3], STOPS[1]], [STOPS[1], HUB]]);
const JAM = [MAP(0.54, 0.62), MAP(0.74, 0.62)];
const ROADS = (() => {
  const s = [];
  for (const v of [0.18, 0.42, 0.45, 0.62, 0.78, 0.82, 0.95]) s.push([MAP(0, v), MAP(1, v)]);
  for (const u of [0.06, 0.22, 0.35, 0.5, 0.64, 0.78, 0.93]) s.push([MAP(u, 0.05), MAP(u, 0.98)]);
  return s;
})();
const STOP_PTS = STOPS.map(([u, v]) => MAP(u, v));
const HUB_PTS = [MAP(...HUB)];
const PANEL_AT = MAP(0.5, 0.5);
const MAP_TAG = MAP(0.78, -0.2); // under the map, right of the dock

// streets as thin flat strips on the map plane
function Roads() {
  const geo = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#3d5573", toneMapped: false }), []);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  return ROADS.map(([a, b], i) => {
    const flat = Math.abs(a[1] - b[1]) < 1e-6;
    return <mesh key={i} geometry={geo} material={mat} position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, a[2] - 0.06]} scale={flat ? [Math.abs(b[0] - a[0]), 0.06, 1] : [0.06, Math.abs(b[1] - a[1]), 1]} raycast={NOOP} />;
  });
}

// a dark glass panel behind the map so the lines read on the wall
function MapPanel() {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#07131f", transparent: true, opacity: 0.96, depthWrite: false, toneMapped: false }), []);
  const edge = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#5ee7ff", 1.6), ...ADD, opacity: 0.5 }), []);
  useEffect(() => () => [mat, edge].forEach((x) => x.dispose()), [mat, edge]);
  return (
    <group position={[PANEL_AT[0], PANEL_AT[1], PANEL_AT[2] - 0.12]}>
      <mesh material={mat} raycast={NOOP}>
        <planeGeometry args={[11, 2.45]} />
      </mesh>
      <mesh material={edge} position={[0, -1.23, 0.01]} raycast={NOOP}>
        <planeGeometry args={[11, 0.03]} />
      </mesh>
    </group>
  );
}

function RainZone() {
  const at = MAP(0.86, 0.6);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#4dabf7", 1.4), ...ADD, opacity: 0.3 }), []);
  useEffect(() => () => mat.dispose(), [mat]);
  useFrame(({ clock }) => (mat.opacity = 0.22 + 0.1 * Math.sin(clock.elapsedTime * 3)));
  return (
    <mesh material={mat} position={[at[0], at[1], at[2] + 0.02]} scale={[1.7, 1, 1]} raycast={NOOP}>
      <circleGeometry args={[0.95, 40]} />
    </mesh>
  );
}

function RouteDemo() {
  const { language } = useLanguage();
  const th = TH(language);
  const plan = gdemo.use((s) => s.plan);
  const jam = gdemo.use((s) => s.jam);
  const rain = gdemo.use((s) => s.rain);
  const [jp] = usePhase(jam, [0, 2.6], 14);
  const ai = plan === "ai";
  const route = jp === 1 ? DETOUR : ai ? AI : MANUAL;
  const color = jp === 1 ? "#8cff9a" : ai ? "#51cf66" : "#ffa94d";
  return (
    <group>
      <MapPanel />
      <Roads />
      <Flow points={route} color={color} radius={0.07} speed={2.2} dash={0.6} />
      <Runner points={route} period={ai ? 9 : 12} size={0.15} />
      <Pops points={HUB_PTS} shown={() => 1.5} colors={() => "#ffd43b"} size={0.15} dy={0} />
      <Pops points={STOP_PTS} shown={() => 1} colors={() => "#e7f5ff"} size={0.14} dy={0} />
      {jp >= 0 && (
        <>
          <Flow points={JAM} color="#ff4d4d" radius={0.07} speed={-3} dash={0.3} />
          <Rings at={[(JAM[0][0] + JAM[1][0]) / 2, JAM[0][1], JAM[0][2] + 0.05]} radius={1.2} color="#ff4d4d" period={0.9} vertical />
        </>
      )}
      {rain && <RainZone />}
      <Tag position={MAP_TAG}>
        <span className={jp === 0 ? cards.warn : ai || jp === 1 ? cards.ok : undefined}>
          {jp === 0
            ? th ? "🚧 อุบัติเหตุบนถนนพระราม 9 · รถติด 35 นาที" : "🚧 Accident on Rama 9 · 35 min jam"
            : jp === 1
              ? th ? "↻ AI เปลี่ยนเส้นทางใน 3 วิ · ช้าลงแค่ 4 นาที" : "↻ AI rerouted in 3 s · only +4 min"
              : ai ? (th ? "AI: 6 จุดส่ง · 112 กม. · น้ำมัน −24%" : "AI plan: 6 stops · 112 km · fuel −24%") : th ? "วางแผนเอง: 6 จุดส่ง · 148 กม." : "Manual plan: 6 stops · 148 km"}
        </span>
        {rain && (
          <>
            <br />
            <span className={cards.small}>{th ? "🌧 ฝนหนักโซนตะวันออก · จำกัด 60 กม./ชม. · ถึงช้าขึ้น 6 นาที" : "🌧 Heavy rain east · 60 km/h · ETA +6 min"}</span>
          </>
        )}
      </Tag>
    </group>
  );
}

// ---------------------------------------------------------------- 3 cargo volume

const STACK = W(6.2, 7.5, FLOOR + 0.1);
const STACK_SIZE = [1.24, 1.72, 1.04];
const STACK_TOP = [[STACK[0], STACK[1] + 2, STACK[2]]];
const LENSES = [[0, 0], [-0.8, 0.7], [0.8, -0.7]].map(([dx, dy]) => W(6.2 + dx, 7.5 + dy, FLOOR + 2.86));
const CLOUD_PTS = (() => {
  const [sx, sy, sz] = STACK_SIZE;
  const pts = [];
  for (let i = 0; i < 70; i++) {
    const a = (i * 0.618) % 1;
    const b = (i * 0.381 + 0.17) % 1;
    const face = i % 3; // top, the +x side, the +z side (the faces the gantry cameras see)
    if (face === 0) pts.push([STACK[0] + (a - 0.5) * sx, STACK[1] + sy, STACK[2] + (b - 0.5) * sz]);
    else if (face === 1) pts.push([STACK[0] + sx / 2, STACK[1] + a * sy, STACK[2] + (b - 0.5) * sz]);
    else pts.push([STACK[0] + (a - 0.5) * sx, STACK[1] + b * sy, STACK[2] + sz / 2]);
  }
  return pts;
})();
const DOCK_YS = [0, 5, 10, 15];
const FILL = [0.62, 0, 0.88, 0.35];
const HOLO = W(3.5, 11.5, FLOOR + 3.7); // floats over the staging area, above the dock panel
const HOLO_SIZE = [1.1, 1.26, 2.8]; // the truck's cargo box (6.2 x 2.8 x 2.5 m) at 45 %, long side to the camera
const BLOCKS = (() => {
  const out = [];
  const [bx, by, bz] = HOLO_SIZE;
  for (let c = 5; c >= 0; c--) // from the cab end to the door: the first drop goes in last
    for (let l = 0; l < 2; l++)
      for (let r = 0; r < 2; r++) out.push({ at: [HOLO[0] + (r - 0.5) * (bx / 2), HOLO[1] + (l + 0.5) * (by / 2), HOLO[2] + (c + 0.5 - 3) * (bz / 6)], drop: Math.floor((5 - c) / 2) });
  return out;
})();
const DROP_COLORS = ["#4dabf7", "#ffd43b", "#b197fc"];

function Sweep() {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#5ee7ff", 2), ...ADD, opacity: 0.35 }), []);
  useEffect(() => () => mat.dispose(), [mat]);
  const ref = useRef();
  useFrame(({ clock }) => (ref.current.position.y = STACK[1] + 2.7 - ((clock.elapsedTime / 1.2) % 1) * 2.7));
  return (
    <mesh ref={ref} material={mat} position={STACK} rotation={[-Math.PI / 2, 0, 0]} raycast={NOOP}>
      <planeGeometry args={[2.0, 1.8]} />
    </mesh>
  );
}

function Blocks({ shown }) {
  const geo = useMemo(() => new THREE.BoxGeometry(HOLO_SIZE[0] / 2 - 0.04, HOLO_SIZE[1] / 2 - 0.04, HOLO_SIZE[2] / 6 - 0.04), []);
  // plain (not additive) colours: the hub's white walls behind would wash additive blocks out
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.92, toneMapped: false }), []);
  useEffect(() => () => [geo, mat].forEach((x) => x.dispose()), [geo, mat]);
  const ref = useRef();
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  const c = useMemo(() => new THREE.Color(), []);
  useFrame(() => {
    BLOCKS.forEach((b, i) => {
      const s = i < shown.current ? 1 : 0;
      m4.makeScale(s, s, s).setPosition(...b.at);
      ref.current.setMatrixAt(i, m4);
      ref.current.setColorAt(i, c.set(DROP_COLORS[b.drop]));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, BLOCKS.length]} frustumCulled={false} raycast={NOOP} />;
}

// the truck's cargo space as a dark glass box, so the load plan reads against the light hub
function CargoSpace() {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#0b2239", transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false }), []);
  useEffect(() => () => mat.dispose(), [mat]);
  return (
    <mesh material={mat} position={[HOLO[0], HOLO[1] + HOLO_SIZE[1] / 2, HOLO[2]]} raycast={NOOP}>
      <boxGeometry args={HOLO_SIZE} />
    </mesh>
  );
}

function VolumeDemo() {
  const { language } = useLanguage();
  const th = TH(language);
  const measure = gdemo.use((s) => s.measure);
  const packing = gdemo.use((s) => s.packing);
  const sensors = gdemo.use((s) => s.sensors);
  const [mp, mt] = usePhase(measure, [0, 2.4, 4], 12);
  const [pp, pt] = usePhase(packing, [0, 6.2], 13);
  const [cloud, setCloud] = useState(0);
  const packed = useRef(0);
  useFrame(() => {
    const n = mp === 1 ? Math.floor(((mt.current - 2.4) / 1.6) * CLOUD_PTS.length) : mp === 2 ? CLOUD_PTS.length : 0;
    if (n !== cloud) setCloud(n);
    packed.current = pp >= 0 ? Math.min(BLOCKS.length, Math.floor(pt.current / 0.25)) : 0;
  });
  return (
    <group>
      {mp === 0 && (
        <>
          <Sweep />
          {LENSES.map((l, i) => (
            <Cone key={i} at={l} target={STACK} length={2.8} spread={0.3} sweep={0.15} color="#5ee7ff" />
          ))}
        </>
      )}
      {mp >= 1 && <Pops points={CLOUD_PTS} shown={(i) => (i < cloud ? 0.5 : 0)} colors={() => "#5ee7ff"} size={0.07} dy={0} />}
      {mp === 2 && (
        <>
          <Wire at={STACK} size={STACK_SIZE} color="#8cff9a" />
          <Packets from={STACK_TOP} to={CONTROL} color="#8cff9a" period={1.4} lift={2} />
        </>
      )}
      {mp >= 0 && (
        <Tag position={[STACK[0] - 1.6, STACK[1] + 3.6, STACK[2]]}>
          <span className={mp === 2 ? cards.ok : undefined}>
            {mp === 0 ? (th ? "📡 LiDAR + กล้อง 3 มิติ กำลังสแกน…" : "📡 LiDAR + 3D cameras scanning…") : mp === 1 ? (th ? `จุดข้อมูล ${cloud * 1840} จุด` : `${(cloud * 1840).toLocaleString()} points captured`) : th ? "📐 1.24 × 1.04 × 1.72 ม. · 2.22 ลบ.ม. · 386 กก." : "📐 1.24 × 1.04 × 1.72 m · 2.22 m³ · 386 kg"}
          </span>
          {mp === 2 && (
            <>
              <br />
              <span className={cards.small}>{th ? "✓ แม่นยำ ±5 มม. ใน 3 วิ (ตลับเมตร 2 นาที ±3 ซม.) · ส่งเข้า WMS/TMS แล้ว" : "✓ ±5 mm in 3 s (tape: 2 min, ±3 cm) · sent to WMS/TMS"}</span>
            </>
          )}
        </Tag>
      )}
      {sensors &&
        DOCK_YS.map((d, k) => (
          <group key={d}>
            <Cone at={W(7.75, d, FLOOR + 3.85)} target={W(12, d, 1)} length={4.6} spread={0.42} sweep={0.12} color={FILL[k] ? "#5ee7ff" : "#8f9bff"} />
            <Tag position={W(7.2, d + (d < 7.5 ? 1.4 : -1.4), FLOOR + 4.8)}>
              <span className={cards.small}>{FILL[k] ? (th ? `ท่า ${k + 1} · เต็ม ${Math.round(FILL[k] * 100)}%` : `Dock ${k + 1} · ${Math.round(FILL[k] * 100)}% full`) : th ? `ท่า ${k + 1} · ว่าง · รถคันถัดไป 14:30` : `Dock ${k + 1} · free · next truck 14:30`}</span>
            </Tag>
          </group>
        ))}
      {pp >= 0 && (
        <>
          <CargoSpace />
          <Wire at={HOLO} size={HOLO_SIZE} color="#5ee7ff" />
          <Blocks shown={packed} />
          <Tag position={[HOLO[0], HOLO[1] + 1.6, HOLO[2]]}>
            <span className={pp === 1 ? cards.ok : undefined}>{pp === 0 ? (th ? "🧠 AI จัดเรียงสินค้าขึ้นรถ: ของหนักล่าง · จุดส่งแรกอยู่ท้ายรถ" : "🧠 AI load plan: heavy at the bottom · first drop by the door") : th ? "✓ เต็ม 94% (จัดเอง 71%) · ประหยัดรถ 1 คัน/วัน" : "✓ 94% full (by hand 71%) · one truck saved a day"}</span>
          </Tag>
        </>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- 4 transfer & delivery

const DOCKED = [0, 10, 15].map((d) => W(11.6, d, 4.2));
const VANS = [-4.8, -7.6].map((y) => W(14.6, y, 3)); // the third van sits at the frame edge
const POD_AT = W(14.6, -7.6, 0.02); // the second EV van: its driver hands over the parcel
const DISPATCH_TAG = W(12, -6, 7); // in the sky top left, clear of the truck tags
const POD_FROM = [[POD_AT[0], 3, POD_AT[2]]];
const ROUTES = {
  en: ["Route A · 14 drops · leaves 13:40", "Route B · 9 drops · 13:55", "Route C · 11 drops · 14:10", "EV · 6 drops in town", "EV · 8 drops · cold chain"],
  th: ["สาย A · 14 จุด · ออก 13:40", "สาย B · 9 จุด · 13:55", "สาย C · 11 จุด · 14:10", "รถ EV · 6 จุดในเมือง", "รถ EV · 8 จุด · ห้องเย็น"],
};
const ETAS = ["14:20", "14:45", "15:05", "15:30"];

function DeliveryDemo({ movers }) {
  const { language } = useLanguage();
  const th = TH(language);
  const dispatch = gdemo.use((s) => s.dispatch);
  const pod = gdemo.use((s) => s.pod);
  const [dp] = usePhase(dispatch, [0, 2.6, 5.2], 14);
  const [pp] = usePhase(pod, [0, 2.2, 4.6], 12);
  const fleet = useFleet(movers);
  const targets = useMemo(() => [...DOCKED, ...VANS], []);
  const routes = ROUTES[language] || ROUTES.en;
  return (
    <group>
      {fleet.trucks.map((m, i) => (
        <Follow key={m.uuid} target={m} dy={4.4} within={[43, 32]}>
          <GpsPin />
          <Tag position={[0, 2.4, 0]}>
            <span className={cards.small}>{`🚚 ${TRUCK_IDS[i % 4]} · ${th ? "ถึง" : "ETA"} ${ETAS[i % 4]}`}</span>
          </Tag>
        </Follow>
      ))}
      {dp === 0 && targets.map((t, i) => <Packets key={i} from={[CONTROL]} to={t} color="#ffd43b" period={1.3} lift={3} />)}
      {dp >= 1 &&
        targets.map((t, i) => (
          <group key={i}>
            <Rings at={[t[0], 0.1, t[2]]} radius={i < 3 ? 4 : 2.6} color="#ffd43b" period={1.6} />
            <Tag position={[t[0], t[1] + 1.1, t[2]]}>
              <span className={cards.small}>{routes[i]}</span>
            </Tag>
          </group>
        ))}
      {dp === 2 && (
        <Tag position={DISPATCH_TAG}>
          <span className={cards.ok}>{th ? "✓ จัด 18 เส้นทางใน 4 วิ (เดิม 45 นาที) · ตัดสต็อก −312 กล่อง" : "✓ 18 routes in 4 s (was 45 min) · stock −312 cartons"}</span>
        </Tag>
      )}
      {pp >= 0 && (
        <>
          <Rings at={[POD_AT[0], 0.1, POD_AT[2]]} radius={3} color={pp === 2 ? "#51cf66" : "#5ee7ff"} period={1} />
          {pp === 2 && <Packets from={POD_FROM} to={CONTROL} color="#51cf66" period={1.4} lift={3} />}
          <Tag position={[POD_AT[0], 5.6, POD_AT[2]]}>
            <span className={pp === 2 ? cards.ok : undefined}>{[th ? "📷 ถ่ายรูปพัสดุหน้าบ้านลูกค้า" : "📷 Photo of the parcel at the door", th ? "✍ ลูกค้าเซ็นรับ: คุณมาลี · 14:06 · GPS ✓" : "✍ Signed by K. Malee · 14:06 · GPS ✓", th ? "✓ ยืนยันการส่งแล้ว · แจ้งลูกค้าทาง LINE" : "✓ Delivery confirmed · customer told on LINE"][pp]}</span>
          </Tag>
        </>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- 5 POS

const TILLS = [W(-25.6, -9.9, 1.5), W(-22.4, -9.9, 1.5)];
const BUYER = W(-22.1, -10.7, 0.16);
const POS_BIG = W(-20, -12.55, 2.8); // the showcase screen's tag, left of it so the info panel does not cut it
const LOCKER = W(-29.3, -13.9, 0.92);
const LOCKER_USER = W(-28.7, -12.9, 0.16);
const SHELF = W(-21.5, -8.85, 3.3);
const BANK = W(-24, -12.5, 10);
const RACKS = W(-22, 2, 8);
const PAY = {
  en: { card: "💳 Card · tokenised · 3-D Secure", qr: "📱 PromptPay QR · bank confirms", wallet: "👛 e-Wallet · one tap" },
  th: { card: "💳 บัตร · เข้ารหัสโทเคน · 3-D Secure", qr: "📱 QR พร้อมเพย์ · ธนาคารยืนยัน", wallet: "👛 e-Wallet · แตะครั้งเดียว" },
};
const LAYOUT = {
  en: { cafe: "🎨 Café layout · menu tiles, table numbers", retail: "🎨 Retail layout · barcode first, loyalty points", pharmacy: "🎨 Pharmacy layout · drug lookup, prescriptions" },
  th: { cafe: "🎨 หน้าจอร้านกาแฟ · ปุ่มเมนู เลขโต๊ะ", retail: "🎨 หน้าจอร้านค้าปลีก · สแกนบาร์โค้ด แต้มสะสม", pharmacy: "🎨 หน้าจอร้านยา · ค้นหายา ใบสั่งแพทย์" },
};

function PosDemo() {
  const { language } = useLanguage();
  const th = TH(language);
  const pay = gdemo.use((s) => s.pay);
  const sale = gdemo.use((s) => s.sale);
  const member = gdemo.use((s) => s.member);
  const locker = gdemo.use((s) => s.locker);
  const layout = gdemo.use((s) => s.layout);
  const [sp] = usePhase(sale, [0, 1.6, 3.4], 11);
  const [mp] = usePhase(member, [0], 8);
  const [lp] = usePhase(locker, [0, 1.6], 9);
  return (
    <group>
      <Tag position={POS_BIG}>
        <span className={cards.small}>{(LAYOUT[language] || LAYOUT.en)[layout]}</span>
      </Tag>
      {sp >= 0 && (
        <>
          <Rings at={[TILLS[0][0], 0.2, TILLS[0][2]]} radius={1.6} color={sp === 2 ? "#51cf66" : "#5ee7ff"} period={1} />
          {sp === 1 && <Packets from={[TILLS[0]]} to={BANK} color="#5ee7ff" period={1.1} lift={2} />}
          {sp === 2 && <Packets from={[TILLS[0]]} to={RACKS} color="#ffd43b" period={1.4} lift={3} />}
          <Tag position={[TILLS[0][0], TILLS[0][1] + 1.4, TILLS[0][2]]}>
            <span className={sp === 2 ? cards.ok : undefined}>{sp === 0 ? (th ? "🛒 สแกน 3 รายการ · ฿1,280" : "🛒 3 items scanned · ฿1,280") : sp === 1 ? (PAY[language] || PAY.en)[pay] : th ? "✓ ชำระแล้วใน 2 วิ · ส่งใบเสร็จทางอีเมล" : "✓ Paid in 2 s · e-receipt sent"}</span>
          </Tag>
          {sp === 2 && (
            <Tag position={SHELF}>
              <span className={cards.warn}>{th ? "📦 สต็อก −3 · กาแฟเหลือ 8 → สั่งเติมเอง" : "📦 Stock −3 · beans: 8 left → reorder"}</span>
            </Tag>
          )}
        </>
      )}
      {mp >= 0 && (
        <>
          <Rings at={[BUYER[0], 0.2, BUYER[2]]} radius={1.3} color="#ffd43b" period={1.1} />
          <Tag position={[BUYER[0], 2.6, BUYER[2]]}>
            {th ? "⭐ คุณนก · สมาชิก Gold · มา 12 ครั้ง" : "⭐ Khun Nok · Gold member · 12 visits"}
            <br />
            <span className={cards.small}>{th ? "ชอบเมล็ดกาแฟ → ลด 10% วันนี้" : "Loves coffee beans → 10% off today"}</span>
          </Tag>
        </>
      )}
      {lp >= 0 && (
        <>
          <Rings at={[LOCKER_USER[0], 0.2, LOCKER_USER[2]]} radius={1.2} color="#5ee7ff" period={1} />
          {lp === 1 && <Wire at={LOCKER} size={[0.52, 0.62, 0.82]} color="#51cf66" />}
          <Tag position={[LOCKER_USER[0], 2.7, LOCKER_USER[2]]}>
            <span className={lp === 1 ? cards.ok : undefined}>{lp === 0 ? (th ? "🔑 กรอกรหัสรับของ 4821" : "🔑 Pickup code 4821") : th ? "✓ ตู้ B3 เปิดแล้ว · ออเดอร์ #5531" : "✓ Locker B3 open · order #5531"}</span>
          </Tag>
        </>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- dock (HTML, outside the canvas)

const DT = {
  en: {
    try: "Try it", title: "Hub systems", orders: "📦 Order flow", fleet: "📡 Fleet GPS", hint: "Click workers, trucks or robots · pick a topic below",
    code: "Code type", codes: { barcode: "▥ Barcode", qr: "▣ QR", rfid: "📡 RFID" }, hand: "🔫 Handheld scan", torn: "⚠ Torn label",
    scan: [["Read rate", "99.9%", 0.999, "#51cf66"], ["Parcels / h", "1,800", 0.9, "#4dabf7"], ["Manual entry", "−92%", 0.92, "#ffd43b"], ["Wi-Fi sync", "0.3 s", 0.85, "#b197fc"]],
    plan: "Plan", plans: { manual: "Manual", ai: "AI optimised" }, jam: "🚧 Accident ahead", rainOn: "🌧 Storm on the route", rainOff: "Clear the storm",
    driver: "Driver behaviour", drivers: { somchai: "Somchai", anan: "Anan", nid: "Nid" },
    coach: { somchai: "Safety 92 · 0 harsh brakes · 1 speeding — top driver this month", anan: "Safety 71 · 4 harsh brakes · 3 speeding — coaching: smoother braking saves 8% fuel", nid: "Safety 85 · 1 harsh brake · 2 speeding — watch the speed on Rama 9" },
    measure: "📐 Measure the pallet", pack: "🧠 AI load plan", sensorsOn: "Show dock fill sensors", sensorsOff: "Hide dock fill sensors",
    forecast: "Volume forecast", days: { today: "Today", tomorrow: "Tomorrow", peak: "11.11" },
    fc: { today: [["Volume", "186 m³", 0.46, "#4dabf7"], ["Trucks", "7", 0.47, "#4dabf7"]], tomorrow: [["Volume", "214 m³ (+15%)", 0.53, "#ffd43b"], ["Trucks", "8", 0.53, "#ffd43b"]], peak: [["Volume", "402 m³ (×2.2)", 1, "#ff6b6b"], ["Trucks", "15 · book 7 more", 1, "#ff6b6b"]] },
    dispatch: "📋 Auto-dispatch", pod: "✍ Proof of delivery",
    fleetRows: [["TKC-01", "On route · 42 km/h", "14:20"], ["TKC-02", "Loading · dock 3", "13:40"], ["TKC-03", "Delivered 9/12", "15:05"], ["EV-04", "Charging 82%", "15:30"]], fleetHead: ["Truck", "Status", "ETA"],
    onTime: [["On time", "97%", 0.97, "#51cf66"], ["Proof of delivery", "100%", 1, "#4dabf7"]],
    pay: "Pay by", pays: { card: "💳 Card", qr: "📱 QR", wallet: "👛 Wallet" }, sale: "🛒 Checkout", member: "⭐ Member arrives", locker: "🔐 Locker pickup",
    layout: "Screen layout", layouts: { cafe: "Café", retail: "Retail", pharmacy: "Pharmacy" },
    sales: "Today ฿84,520 · 312 orders · avg ฿271 · 3 SKUs low",
  },
  th: {
    try: "ลองเล่น", title: "ระบบในศูนย์กระจายสินค้า", orders: "📦 เส้นทางคำสั่งซื้อ", fleet: "📡 GPS รถทุกคัน", hint: "คลิกพนักงาน รถบรรทุก หรือหุ่นยนต์ได้ · เลือกหัวข้อด้านล่าง",
    code: "ชนิดรหัส", codes: { barcode: "▥ บาร์โค้ด", qr: "▣ QR", rfid: "📡 RFID" }, hand: "🔫 สแกนด้วยเครื่องพกพา", torn: "⚠ ฉลากขาด",
    scan: [["อ่านสำเร็จ", "99.9%", 0.999, "#51cf66"], ["พัสดุ/ชม.", "1,800", 0.9, "#4dabf7"], ["พิมพ์ข้อมูลเอง", "−92%", 0.92, "#ffd43b"], ["ซิงก์ Wi-Fi", "0.3 วิ", 0.85, "#b197fc"]],
    plan: "แผน", plans: { manual: "วางแผนเอง", ai: "AI จัดให้" }, jam: "🚧 อุบัติเหตุข้างหน้า", rainOn: "🌧 พายุบนเส้นทาง", rainOff: "ฟ้าเปิดแล้ว",
    driver: "พฤติกรรมผู้ขับ", drivers: { somchai: "สมชาย", anan: "อนันต์", nid: "นิด" },
    coach: { somchai: "ความปลอดภัย 92 · เบรกกะทันหัน 0 · ขับเร็ว 1 — ผู้ขับยอดเยี่ยมประจำเดือน", anan: "ความปลอดภัย 71 · เบรกกะทันหัน 4 · ขับเร็ว 3 — แนะนำเบรกนุ่มขึ้น ประหยัดน้ำมัน 8%", nid: "ความปลอดภัย 85 · เบรกกะทันหัน 1 · ขับเร็ว 2 — ระวังความเร็วช่วงพระราม 9" },
    measure: "📐 วัดขนาดพาเลท", pack: "🧠 AI จัดเรียงขึ้นรถ", sensorsOn: "แสดงเซ็นเซอร์วัดความจุท่า", sensorsOff: "ซ่อนเซ็นเซอร์วัดความจุท่า",
    forecast: "พยากรณ์ปริมาณ", days: { today: "วันนี้", tomorrow: "พรุ่งนี้", peak: "11.11" },
    fc: { today: [["ปริมาตร", "186 ลบ.ม.", 0.46, "#4dabf7"], ["รถ", "7 คัน", 0.47, "#4dabf7"]], tomorrow: [["ปริมาตร", "214 ลบ.ม. (+15%)", 0.53, "#ffd43b"], ["รถ", "8 คัน", 0.53, "#ffd43b"]], peak: [["ปริมาตร", "402 ลบ.ม. (×2.2)", 1, "#ff6b6b"], ["รถ", "15 คัน · จองเพิ่ม 7", 1, "#ff6b6b"]] },
    dispatch: "📋 จัดงานส่งอัตโนมัติ", pod: "✍ หลักฐานการส่ง",
    fleetRows: [["TKC-01", "กำลังส่ง · 42 กม./ชม.", "14:20"], ["TKC-02", "ขึ้นของ · ท่า 3", "13:40"], ["TKC-03", "ส่งแล้ว 9/12", "15:05"], ["EV-04", "ชาร์จ 82%", "15:30"]], fleetHead: ["รถ", "สถานะ", "ถึง"],
    onTime: [["ส่งตรงเวลา", "97%", 0.97, "#51cf66"], ["มีหลักฐานการส่ง", "100%", 1, "#4dabf7"]],
    pay: "ชำระด้วย", pays: { card: "💳 บัตร", qr: "📱 QR", wallet: "👛 วอลเล็ต" }, sale: "🛒 คิดเงิน", member: "⭐ สมาชิกเข้าร้าน", locker: "🔐 รับของที่ตู้",
    layout: "หน้าจอตามธุรกิจ", layouts: { cafe: "ร้านกาแฟ", retail: "ค้าปลีก", pharmacy: "ร้านยา" },
    sales: "วันนี้ ฿84,520 · 312 บิล · เฉลี่ย ฿271 · ของใกล้หมด 3 รายการ",
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
  "smart-scan": ({ t, s }) => (
    <>
      <div className={dock.label}>{t.code}</div>
      <Seg items={t.codes} value={s.code} onPick={(k) => gdemo.set({ code: k })} />
      <div className={dock.grid}>
        <button type="button" className={dock.primary} onClick={() => gdemo.set({ hand: now() })}>
          {t.hand}
        </button>
        <button type="button" className={dock.danger} onClick={() => gdemo.set({ damaged: now() })}>
          {t.torn}
        </button>
      </div>
      <Bars rows={t.scan} />
    </>
  ),
  "route-optimization": ({ t, s }) => (
    <>
      <div className={dock.label}>{t.plan}</div>
      <Seg items={t.plans} value={s.plan} onPick={(k) => gdemo.set({ plan: k })} />
      <div className={dock.grid}>
        <button type="button" className={dock.danger} onClick={() => gdemo.set({ jam: now(), plan: "ai" })}>
          {t.jam}
        </button>
        <button type="button" className={s.rain ? dock.on : dock.btn} onClick={() => gdemo.set({ rain: !s.rain })}>
          {s.rain ? t.rainOff : t.rainOn}
        </button>
      </div>
      <div className={dock.label}>{t.driver}</div>
      <Seg items={t.drivers} value={s.driver} onPick={(k) => gdemo.set({ driver: k })} danger="anan" />
      <p className={dock.note}>🧭 {t.coach[s.driver]}</p>
    </>
  ),
  "cargo-volume": ({ t, s }) => (
    <>
      <div className={dock.grid}>
        <button type="button" className={dock.primary} onClick={() => gdemo.set({ measure: now() })}>
          {t.measure}
        </button>
        <button type="button" className={dock.btn} onClick={() => gdemo.set({ packing: now() })}>
          {t.pack}
        </button>
      </div>
      <button type="button" className={s.sensors ? dock.on : dock.btn} onClick={() => gdemo.set({ sensors: !s.sensors })}>
        {s.sensors ? t.sensorsOff : t.sensorsOn}
      </button>
      <div className={dock.label}>{t.forecast}</div>
      <Seg items={t.days} value={s.forecast} onPick={(k) => gdemo.set({ forecast: k })} danger="peak" />
      <Bars rows={t.fc[s.forecast]} />
    </>
  ),
  "transfer-delivery": ({ t }) => (
    <>
      <div className={dock.grid}>
        <button type="button" className={dock.primary} onClick={() => gdemo.set({ dispatch: now() })}>
          {t.dispatch}
        </button>
        <button type="button" className={dock.btn} onClick={() => gdemo.set({ pod: now() })}>
          {t.pod}
        </button>
      </div>
      <div className={cards.card}>
        <div className={cards.table} style={{ gridTemplateColumns: "0.8fr 1.6fr 0.7fr" }}>
          {t.fleetHead.map((h) => (
            <b key={h}>{h}</b>
          ))}
          {t.fleetRows.flat().map((x, i) => (
            <span key={i}>{x}</span>
          ))}
        </div>
      </div>
      <Bars rows={t.onTime} />
    </>
  ),
  pos: ({ t, s }) => (
    <>
      <div className={dock.label}>{t.pay}</div>
      <Seg items={t.pays} value={s.pay} onPick={(k) => gdemo.set({ pay: k })} />
      <button type="button" className={dock.primary} onClick={() => gdemo.set({ sale: now() })}>
        {t.sale}
      </button>
      <div className={dock.grid}>
        <button type="button" className={dock.btn} onClick={() => gdemo.set({ member: now() })}>
          {t.member}
        </button>
        <button type="button" className={dock.btn} onClick={() => gdemo.set({ locker: now() })}>
          {t.locker}
        </button>
      </div>
      <div className={dock.label}>{t.layout}</div>
      <Seg items={t.layouts} value={s.layout} onPick={(k) => gdemo.set({ layout: k })} />
      <p className={dock.note}>📊 {t.sales}</p>
    </>
  ),
};

export function LogisticsPanel({ hidden, activeId }) {
  const { language } = useLanguage();
  const t = DT[language] || DT.en;
  const s = gdemo.use();
  const sys = gsys.use();
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
        <button type="button" className={sys.orders ? panel.onEnergy : panel.btn} aria-pressed={sys.orders} onClick={() => gsys.set({ orders: !sys.orders })}>
          {t.orders}
        </button>
        <button type="button" className={sys.fleet ? panel.onHvac : panel.btn} aria-pressed={sys.fleet} onClick={() => gsys.set({ fleet: !sys.fleet })}>
          {t.fleet}
        </button>
      </div>
      <p className={panel.hint}>{t.hint}</p>
    </div>
  );
}

// ---------------------------------------------------------------- reactions router (BakedModel's `reactions`)

export function LogisticsReactions({ active, movers }) {
  const sys = gsys.use();
  return (
    <>
      {sys.orders && <OrderFlow />}
      {sys.fleet && active !== "transfer-delivery" && <FleetGps movers={movers} />}
      {active === "smart-scan" && <ScanDemo movers={movers} />}
      {active === "route-optimization" && <RouteDemo />}
      {active === "cargo-volume" && <VolumeDemo />}
      {active === "transfer-delivery" && <DeliveryDemo movers={movers} />}
      {active === "pos" && <PosDemo />}
    </>
  );
}
