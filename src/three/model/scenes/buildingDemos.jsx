// Hands-on demos of 01 Smart Building, played from the "Try it" dock that opens with a hotspot:
// surveillance (live camera picture-in-picture, simulated intruder), access control (face / card / mobile /
// unknown person at the turnstiles, with an access log), smart parking (plate recognition, app payment,
// EV charging, find my car) and signage & lighting (one campaign on every screen, lighting scenes).
// Coordinates from smart_building_v2.py (Blender x, y, z -> three.js x, z, -y).
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useLanguage } from "../../../contexts/LanguageContext";
import { demo, parked } from "./demoStore";
import { setCampaign } from "../screens";
import { Chevrons, DetectBoxes, Rings, Tag } from "../reactions";
import { DOCK2, DEMO2_IDS } from "./buildingDemos2";
import styles from "./buildingDemos.module.css";

const NOOP = () => {};
const ADD = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide };
const glow = (c, k = 2) => new THREE.Color(c).multiplyScalar(k);
const DOWN = new THREE.Vector3(0, -1, 0);
const now = () => new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

export function path(points) {
  const pts = points.map((p) => new THREE.Vector3(...p));
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
  return { pts, cum, total: cum[cum.length - 1] };
}
// place `out` at distance d along the path (clamped); returns the yaw that faces along it (actors face +x)
export function along(p, d, out) {
  d = Math.min(Math.max(d, 0), p.total);
  let i = 1;
  while (i < p.cum.length - 1 && p.cum[i] < d) i++;
  const a = p.pts[i - 1];
  const b = p.pts[i];
  out.lerpVectors(a, b, (d - p.cum[i - 1]) / (p.cum[i] - p.cum[i - 1] || 1));
  return Math.atan2(a.z - b.z, b.x - a.x);
}

// a copy of one of the model's walkers, with its own (fadeable) materials and swinging limbs
export function useActor(movers) {
  const actor = useMemo(() => {
    const src = movers.find((m) => m.userData.walk);
    if (!src) return null;
    const o = src.clone(true);
    o.children = o.children.filter((c) => !c.userData.noHighlight); // drop the shared contact shadow
    o.children.forEach((c) => (c.parent = o));
    const mats = [];
    o.traverse((m) => {
      if (m.isMesh) {
        m.material = m.material.clone();
        m.material.transparent = true;
        m.raycast = NOOP;
        mats.push(m.material);
      }
    });
    o.userData = {};
    o.visible = false;
    return { o, mats, limbs: o.children.filter((c) => c.userData.limb) };
  }, [movers]);
  useEffect(() => () => actor?.mats.forEach((m) => m.dispose()), [actor]);
  return actor;
}
export function stride(actor, t, speed, moving) {
  const ph = t * speed * 4.4;
  actor.limbs.forEach((l) => (l.rotation.z = moving ? l.userData.limb * Math.sin(ph) * 0.45 : 0));
  return moving ? Math.abs(Math.sin(ph)) * 0.04 : 0;
}

// ---------------------------------------------------------------- 5 surveillance

export const PIP = { left: 24, top: 150, w: 352, h: 198 }; // CSS px, shared with the HTML frame
const LENS = new THREE.Vector3(22.55, 5.0, 20.7);
const ZONE = [30.5, 16.4, 40.1, 21.6]; // x0, z0, x1, z1: the pay-station island (staff only)
const INTRUDER = path([[19, 0.16, 24.6], [25.5, 0.16, 24.6], [28.5, 0.16, 23.2], [31.8, 0.17, 20.2], [34.2, 0.17, 18.6]]);

export function SurveillanceDemo({ movers }) {
  const { gl, scene, size } = useThree();
  const { language } = useLanguage();
  const th = language === "th";
  const cam = useMemo(() => new THREE.PerspectiveCamera(46, PIP.w / PIP.h, 0.5, 600), []);
  const coneGeo = useMemo(() => new THREE.ConeGeometry(4.4, 16, 32, 1, true).translate(0, -8, 0), []);
  const coneMat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#ff5a4d", 1.5), ...ADD, opacity: 0.08 }), []);
  const zoneMat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#ff3b30", 1.6), ...ADD, opacity: 0.1 }), []);
  const boxGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.95, 2, 0.95)).translate(0, 1, 0), []);
  const boxMat = useMemo(() => new THREE.LineBasicMaterial({ color: glow("#ff2d2d", 3), toneMapped: false }), []);
  useEffect(
    () => () => {
      [coneGeo, coneMat, zoneMat, boxGeo, boxMat].forEach((x) => x.dispose());
      gl.setScissorTest(false);
    },
    [coneGeo, coneMat, zoneMat, boxGeo, boxMat, gl]
  );
  const actor = useActor(movers);
  const cone = useRef();
  const box = useRef();
  const zone = useRef();
  const run = useRef({ start: -1, seen: 0, aim: new THREE.Vector3(10, 0, 20) });
  const [count, setCount] = useState(0);
  const [alert, setAlert] = useState(false);
  const intrude = demo.use((s) => s.intrude);
  useEffect(() => {
    if (intrude) run.current.start = -2; // start on the next frame
  }, [intrude]);
  useEffect(() => () => demo.set({ alert: false }), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const r = run.current;
    if (r.start === -2) r.start = t;
    // intruder: walks onto the island, loiters, runs off when security is alerted
    let inZone = false;
    if (actor && r.start >= 0) {
      const s = t - r.start;
      const W = INTRUDER.total / 1.35; // walk in, loiter 3.5 s, run back out
      const back = s > W + 3.5;
      const d = s < W ? s * 1.35 : !back ? INTRUDER.total : INTRUDER.total - (s - W - 3.5) * 2.8;
      const yaw = along(INTRUDER, d, actor.o.position);
      actor.o.rotation.set(0, back ? yaw + Math.PI : yaw, 0);
      actor.o.position.y += stride(actor, t, back ? 2.8 : 1.35, s < W || back);
      const fade = Math.min(1, s / 0.8) * (back ? Math.min(1, d / 1.5) : 1);
      actor.mats.forEach((m) => (m.opacity = fade));
      actor.o.visible = fade > 0.01;
      const p = actor.o.position;
      inZone = actor.o.visible && p.x > ZONE[0] && p.x < ZONE[2] && p.z > ZONE[1] && p.z < ZONE[3];
      if (back && d <= 0) {
        r.start = -1;
        actor.o.visible = false;
      }
      box.current.visible = actor.o.visible;
      box.current.position.copy(p);
      if (actor.o.visible) r.aim.lerp(p, 0.08);
    } else if (box.current) box.current.visible = false;
    if (inZone !== alert) {
      setAlert(inZone);
      demo.set({ alert: inZone });
    }
    // the camera sweeps its patch, or tracks the intruder
    if (!(actor && r.start >= 0)) r.aim.set(10 + Math.sin(t * 0.45) * 14, 0, 19 + Math.cos(t * 0.3) * 4);
    dir.copy(r.aim).setY(r.aim.y + 0.9).sub(LENS).normalize();
    cone.current.quaternion.setFromUnitVectors(DOWN, dir);
    zoneMat.opacity = inZone ? 0.22 + 0.2 * Math.max(0, Math.sin(t * 9)) : 0.08;
    // picture-in-picture: the same scene through the CCTV lens, drawn into a corner after the main pass
    if (size.width < 900) return;
    cam.position.copy(LENS);
    cam.lookAt(v.copy(LENS).add(dir));
    const y = size.height - PIP.top - PIP.h;
    gl.autoClear = false;
    gl.setScissorTest(true);
    gl.setViewport(PIP.left, y, PIP.w, PIP.h);
    gl.setScissor(PIP.left, y, PIP.w, PIP.h);
    gl.setClearColor("#0a0f16", 1);
    gl.clear(true, true, false);
    cone.current.visible = false;
    zone.current.visible = false;
    gl.render(scene, cam);
    cone.current.visible = true;
    zone.current.visible = true;
    gl.setScissorTest(false);
    gl.setViewport(0, 0, size.width, size.height);
    gl.autoClear = true;
  }, 2);

  const tx = th
    ? { n: (n) => `AI ตรวจจับ · ติดตาม ${n} คน`, alert: "⚠ ผู้บุกรุกเข้าพื้นที่หวงห้าม · แจ้ง รปภ. แล้ว · บันทึกคลิปเป็นหลักฐาน" }
    : { n: (n) => `AI detection · tracking ${n} ${n === 1 ? "person" : "people"}`, alert: "⚠ Intruder in a restricted zone · security notified · clip saved as evidence" };
  return (
    <group>
      <mesh ref={cone} geometry={coneGeo} material={coneMat} position={LENS} raycast={NOOP} />
      <mesh ref={zone} material={zoneMat} position={[(ZONE[0] + ZONE[2]) / 2, 0.3, (ZONE[1] + ZONE[3]) / 2]} rotation={[-Math.PI / 2, 0, 0]} raycast={NOOP}>
        <planeGeometry args={[ZONE[2] - ZONE[0], ZONE[3] - ZONE[1]]} />
      </mesh>
      {actor && <primitive object={actor.o} />}
      <lineSegments ref={box} geometry={boxGeo} material={boxMat} visible={false} raycast={NOOP} />
      <DetectBoxes movers={movers} center={[10, 0, 20]} radius={20} onCount={(n) => (setCount(n), demo.set({ cam: n }))} />
      <Tag position={[23, 3.4, 20.7]}>{alert ? tx.alert : tx.n(count)}</Tag>
    </group>
  );
}

// ---------------------------------------------------------------- 6 access control

const READER = new THREE.Vector3(-7.2, 1.25, 8.9);
const LANE_X = -7.9;
const METHODS = {
  face: { color: "#4dff9a", en: "Face ID", th: "สแกนใบหน้า" },
  card: { color: "#5ee7ff", en: "Key card", th: "แตะบัตร" },
  mobile: { color: "#a3acff", en: "Mobile QR / NFC", th: "มือถือ QR / NFC" },
  unknown: { color: "#ff4d4d", en: "Unknown face", th: "ใบหน้าไม่รู้จัก" },
};
const PEOPLE = ["Somchai P.", "Anna K.", "Krit S.", "Mali T.", "David L."];

export function AccessDemo({ movers, sliders }) {
  const { language } = useLanguage();
  const th = language === "th";
  const lobby = useMemo(() => movers.filter((m) => m.userData.walk && m.userData.run.pts.every((p) => p.x > -10 && p.x < -7.3)), [movers]);
  const flaps = useMemo(() => sliders.filter((s) => s.name.startsWith("flap2")), [sliders]);
  const req = demo.use((s) => s.access);
  const st = useRef({ phase: "idle", t0: 0, who: null, frozen: [] });
  const [view, setView] = useState({ phase: "idle", method: null });
  const fx = useRef();
  const ring = useRef();
  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#4dff9a", 2.5), ...ADD, opacity: 0 }), []);
  const scanMat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow("#4dff9a", 3), ...ADD, opacity: 0.9 }), []);
  useEffect(() => () => [ringMat, scanMat].forEach((m) => m.dispose()), [ringMat, scanMat]);

  const freeze = (t) => {
    st.current.frozen = lobby.map((m) => {
      m.userData.scripted = true;
      m.userData.run.limbs.forEach((l) => (l.rotation.z = 0));
      return { m, t, y: m.position.y };
    });
  };
  const release = (t) => {
    st.current.frozen.forEach(({ m, t: t0 }) => {
      m.userData.path_at -= m.userData.walk * (t - t0); // carry on from where they stood
      m.userData.scripted = false;
    });
    st.current.frozen = [];
  };
  const hold = (v) => flaps.forEach((f) => (f.userData.override = v));
  useEffect(
    () => () => {
      st.current.frozen.forEach(({ m }) => (m.userData.scripted = false));
      flaps.forEach((f) => delete f.userData.override);
      demo.set({ status: "", access: null });
    },
    [flaps]
  );
  useEffect(() => {
    if (!req) return;
    const s = st.current;
    if (s.phase !== "idle") return;
    s.phase = "wait";
    s.method = req.method;
    setView({ phase: "wait", method: req.method });
    demo.set({ status: "wait" });
  }, [req]); // eslint-disable-line react-hooks/exhaustive-deps

  const log = (result) =>
    demo.set((d) => ({
      log: [{ time: now(), who: st.current.method === "unknown" ? (th ? "ไม่ทราบชื่อ" : "Unknown") : PEOPLE[d.log.length % PEOPLE.length], method: st.current.method, result }, ...d.log].slice(0, 5),
    }));

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const s = st.current;
    const go = (phase) => {
      s.phase = phase;
      s.t0 = t;
      setView({ phase, method: s.method });
      demo.set({ status: phase });
    };
    if (s.phase === "wait") {
      // the next person walking in reaches the reader; everyone in the lobby lane pauses with them
      const who = lobby.filter((m) => m.position.x > -8.3 && m.position.z > 9.7).sort((a, b) => a.position.z - b.position.z)[0];
      if (who && who.position.z < 10.05) {
        s.who = who;
        freeze(t);
        hold(0);
        go("scan");
      }
    } else if (s.phase === "scan" && t - s.t0 > 1.8) {
      if (s.method === "unknown") {
        log("denied");
        go("denied");
      } else {
        log("granted");
        hold(1);
        release(t);
        go("granted");
      }
    } else if (s.phase === "denied" && t - s.t0 > 3) go("mfa");
    else if (s.phase === "mfa" && t - s.t0 > 2.2) {
      log("verified");
      hold(1);
      release(t);
      go("granted");
    } else if (s.phase === "granted" && t - s.t0 > 3) {
      flaps.forEach((f) => delete f.userData.override);
      s.phase = "idle";
      setView({ phase: "idle", method: null });
      demo.set({ status: "", access: null });
    }
    s.frozen.forEach(({ m, y }) => (m.position.y = y)); // no hop drift while paused
    // effects: scan line over the head, glowing credential at the reader, result ring on the floor
    const color = s.phase === "denied" ? "#ff4d4d" : s.phase === "mfa" ? "#ffd43b" : METHODS[s.method]?.color || "#4dff9a";
    ringMat.color.copy(glow(color, 2.5));
    scanMat.color.copy(glow(color, 3));
    ringMat.opacity = s.phase === "idle" || s.phase === "wait" ? 0 : 0.35 + 0.35 * Math.sin(t * 8);
    if (fx.current) {
      fx.current.visible = s.phase === "scan" || s.phase === "denied" || s.phase === "mfa";
      if (s.who) fx.current.position.set(LANE_X, 0.16, s.who.position.z);
      fx.current.children[0].position.y = 1.2 + 0.55 * (0.5 + 0.5 * Math.sin(t * 5));
    }
    if (ring.current) ring.current.scale.setScalar(1 + ((t * 1.5) % 1) * 1.5);
  });

  const m = METHODS[view.method];
  const label = !m ? null : view.phase === "scan" ? `${th ? m.th : m.en} · ${th ? "กำลังตรวจสอบ…" : "checking…"}` : view.phase === "denied" ? (th ? "✕ ไม่อนุญาต · แจ้ง รปภ. · กล้องหันมาที่ประตู" : "✕ Access denied · security alerted · camera on the gate") : view.phase === "mfa" ? (th ? "🔐 รปภ. ยืนยัน 2 ชั้น (MFA) ผ่านมือถือ…" : "🔐 Security verifies with MFA on mobile…") : view.phase === "granted" ? (th ? "✓ อนุญาต · ประตูเปิด" : "✓ Access granted · gate open") : view.phase === "wait" ? (th ? "รอคนเดินมาถึงประตู…" : "Waiting for someone at the gate…") : null;
  return (
    <group>
      <group ref={fx} visible={false}>
        <mesh material={scanMat} raycast={NOOP}>
          <boxGeometry args={[0.7, 0.02, 0.02]} />
        </mesh>
        <mesh material={scanMat} position={[0, 1.65, 0]} rotation={[0, 0, 0]} scale={[1, 1.25, 0.6]} raycast={NOOP}>
          <torusGeometry args={[0.2, 0.012, 6, 32]} />
        </mesh>
        {view.method === "card" && (
          <mesh material={scanMat} position={[0.55, 1.3, -0.5]} raycast={NOOP}>
            <boxGeometry args={[0.1, 0.004, 0.065]} />
          </mesh>
        )}
        {view.method === "mobile" && <Rings at={[0.6, 1.3, -0.5]} radius={0.8} color="#a3acff" period={0.9} vertical />}
      </group>
      <mesh ref={ring} material={ringMat} position={[LANE_X, 0.2, 8.6]} rotation={[-Math.PI / 2, 0, 0]} raycast={NOOP}>
        <ringGeometry args={[0.5, 0.62, 40]} />
      </mesh>
      {label && <Tag position={[READER.x - 0.7, 2.6, READER.z]}>{label}</Tag>}
    </group>
  );
}

// ---------------------------------------------------------------- 8 smart parking

const CAM_IN = new THREE.Vector3(29.7, 2.75, 17.8);
const CAM_OUT = new THREE.Vector3(40.65, 2.75, 17.8);
const PLATES = ["กข 1234", "1กท 5678", "ฮพ 9012"];
const FIND = [[-8, 0.24, 11.5], [-8, 0.24, 20.8], [25.2, 0.24, 20.8], [25.2, 0.24, -8.7], [31.2, 0.14, -8.7]];

export function ParkingDemo({ movers }) {
  const { language } = useLanguage();
  const th = language === "th";
  const cars = useMemo(() => ["car_loop0", "car_loop1", "car_loop2"].map((n) => movers.find((m) => m.name === n)).filter(Boolean), [movers]);
  const findCar = demo.use((s) => s.findCar);
  const [texts, setTexts] = useState([]);
  const memo = useRef(cars.map(() => ({ inAt: -99, outAt: -99, prev: new THREE.Vector3(), charge: 42 })));
  const follow = useRef([]);
  const beam = useRef();
  const beamGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), []);
  const beamMat = useMemo(() => new THREE.LineBasicMaterial({ color: glow("#4dff9a", 3), toneMapped: false }), []);
  useEffect(() => () => [beamGeo, beamMat].forEach((x) => x.dispose()), [beamGeo, beamMat]);
  const last = useRef("");

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    let beamOn = false;
    const out = cars.map((c, i) => {
      const m = memo.current[i];
      const p = c.position;
      const dz = p.z - m.prev.z;
      if (p.distanceTo(CAM_IN) < 7 && dz < 0) {
        m.inAt = t; // plate read as it rolls up to the entry barrier
        beamOn = true;
        beamGeo.attributes.position.setXYZ(0, CAM_IN.x, CAM_IN.y, CAM_IN.z);
        beamGeo.attributes.position.setXYZ(1, p.x, p.y + 0.6, p.z);
        beamGeo.attributes.position.needsUpdate = true;
      }
      if (p.distanceTo(CAM_OUT) < 7 && dz > 0) m.outAt = t;
      m.prev.copy(p);
      follow.current[i]?.position.set(p.x, p.y + 2.6, p.z);
      if (i === 2) m.charge = parked[2] ? Math.min(100, m.charge + dt * 0.9) : t - m.outAt < 1 ? 42 : m.charge;
      if (t - m.inAt < 3.5) return th ? `📷 อ่านป้าย ${PLATES[i]} · เข้า ${now()}` : `📷 Plate ${PLATES[i]} · in ${now()}`;
      if (t - m.outAt < 3.5) return th ? `💳 ${PLATES[i]} ชำระ ฿40 ผ่านแอป · 1 ชม. 12 น.` : `💳 ${PLATES[i]} paid ฿40 in the app · 1 h 12 min`;
      if (i === 2 && parked[2]) return th ? `⚡ ช่อง EV ที่จองไว้ · ชาร์จ ${Math.round(m.charge)}%` : `⚡ Reserved EV bay · charging ${Math.round(m.charge)}%`;
      return "";
    });
    beam.current.visible = beamOn;
    const free = 9 - parked.filter(Boolean).length;
    out.push(th ? `ป้ายนำทาง: ว่าง ${free} ช่อง` : `Guidance sign: ${free} bays free`);
    const sig = out.join("|");
    if (sig !== last.current) {
      last.current = sig;
      setTexts(out);
    }
  });
  return (
    <group>
      <lineSegments ref={beam} geometry={beamGeo} material={beamMat} visible={false} raycast={NOOP} />
      {cars.map((_, i) => (
        <group key={i} ref={(o) => (follow.current[i] = o)}>
          {texts[i] && <Tag position={[0, 0, 0]}>{texts[i]}</Tag>}
        </group>
      ))}
      {texts[cars.length] && <Tag position={[35.3, 5.4, 21]}>{texts[cars.length]}</Tag>}
      {findCar && (
        <>
          <Chevrons points={FIND} color="#5ea8ff" spacing={2.6} speed={4} />
          <Rings at={[32.9, 0.2, -8.7]} radius={3.2} color="#5ea8ff" period={1.4} />
          <Tag position={[32.9, 3.2, -8.7]}>{th ? "🚗 รถของคุณ · ช่อง A10 · เดิน 95 ม. (~1 นาที)" : "🚗 Your car · bay A10 · 95 m walk (~1 min)"}</Tag>
        </>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- 3 signage & lighting

// led: tint of every LED (null = chasing light show); room: tint of the whole baked building
const SCENES = {
  show: { led: null, room: new THREE.Color(0.5, 0.52, 0.72) },
  work: { led: new THREE.Color(1.3, 1.3, 1.3), room: new THREE.Color(1.12, 1.12, 1.1) },
  meeting: { led: new THREE.Color(0.6, 1, 1.7), room: new THREE.Color(0.66, 0.86, 1.3) },
  evening: { led: new THREE.Color(2, 1, 0.4), room: new THREE.Color(1.05, 0.58, 0.3) },
  eco: { led: new THREE.Color(0.08, 0.08, 0.08), room: new THREE.Color(0.2, 0.22, 0.28) },
};
const VOICE = {
  en: { welcome: "“TKC, show the welcome content”", promo: "“TKC, launch the mid-year sale”", news: "“TKC, put today's news on every screen”", emergency: "“Fire alarm: switch every screen to evacuation”", show: "“TKC, start the light show”", work: "“TKC, lights to working mode”", meeting: "“TKC, meeting scene please”", evening: "“TKC, evening scene”", eco: "“TKC, nobody's here: eco mode”" },
  th: { welcome: "“TKC เปิดคอนเทนต์ต้อนรับ”", promo: "“TKC เริ่มแคมเปญลดกลางปี”", news: "“TKC ขึ้นข่าววันนี้ทุกจอ”", emergency: "“สัญญาณไฟไหม้: ทุกจอเปลี่ยนเป็นอพยพ”", show: "“TKC เปิดไลต์โชว์”", work: "“TKC ปรับไฟโหมดทำงาน”", meeting: "“TKC ขอฉากประชุม”", evening: "“TKC ฉากยามเย็น”", eco: "“TKC ไม่มีคนแล้ว เปิดโหมดประหยัด”" },
};

export function LightingDemo({ leds, t, pins, materials }) {
  const { language } = useLanguage();
  const campaign = demo.use((s) => s.campaign);
  const scene = demo.use((s) => s.lights);
  const voice = demo.use((s) => s.voice);
  const [said, setSaid] = useState(null);
  const first = useRef(true);
  useEffect(() => {
    setCampaign(campaign);
    if (!first.current) setSaid(campaign);
  }, [campaign]);
  useEffect(() => {
    if (!first.current) setSaid(scene);
    first.current = false;
  }, [scene]);
  useEffect(() => {
    if (!said) return undefined;
    const id = setTimeout(() => setSaid(null), 3200);
    return () => clearTimeout(id);
  }, [said, voice]);
  useEffect(
    () => () => {
      setCampaign("welcome");
      leds.forEach((l) => l.mesh.material.color.copy(l.base));
    },
    [leds]
  );
  // the building itself (lightmapped walls and the vertex-lit furniture, not the site) takes the scene's light
  const room = useMemo(() => materials.filter((m) => m.userData.atlas !== "site"), [materials]);
  useEffect(() => () => room.forEach((m) => m.color.copy(m.userData.base)), [room]);
  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame((_, dt) => {
    const sc = SCENES[scene];
    const k = 1 - Math.exp(-dt * 3);
    leds.forEach((l) => {
      if (!sc.led) tmp.copy(l.base).multiplyScalar(0.3 + 1.6 * Math.max(0, Math.sin(t.current * 2.5 - l.at.x * 0.12 - l.at.z * 0.05)));
      else tmp.copy(l.base).multiply(sc.led);
      l.mesh.material.color.lerp(tmp, sc.led ? k : 1);
    });
    room.forEach((m) => m.color.lerp(tmp.copy(m.userData.base).multiply(sc.room), k));
  });
  const p = pins.lighting;
  return said && p ? <Tag position={[p.x, p.y + 2.4, p.z]}>🎙 {(VOICE[language] || VOICE.en)[said]}</Tag> : null;
}

// ---------------------------------------------------------------- the dock (HTML, outside the canvas)

const DT = {
  en: {
    try: "Try it",
    surveillance: { intrude: "🚨 Simulate an intruder", live: "LIVE", people: (n) => `AI: ${n} people`, alert: "⚠ ALERT · ZONE B" },
    "access-control": { title: "Who is at the gate?", log: "Access log", granted: "granted", denied: "denied", verified: "verified (MFA)", empty: "No entries yet" },
    "smart-parking": { find: "📍 Find my car", hide: "Hide route", note: "Cars read at the barrier, charged on the way out, EV bays reserved in the app." },
    lighting: { campaign: "Campaign on every screen", camps: { welcome: "Welcome", promo: "Promotion", news: "News", emergency: "Emergency" }, scene: "Lighting scene", scenes: { show: "Show", work: "Work", meeting: "Meeting", evening: "Evening", eco: "Eco" } },
  },
  th: {
    try: "ลองเล่น",
    surveillance: { intrude: "🚨 จำลองผู้บุกรุก", live: "สด", people: (n) => `AI: ${n} คน`, alert: "⚠ แจ้งเตือน · โซน B" },
    "access-control": { title: "ใครมาที่ประตู?", log: "บันทึกการเข้าออก", granted: "อนุญาต", denied: "ปฏิเสธ", verified: "ยืนยัน MFA แล้ว", empty: "ยังไม่มีรายการ" },
    "smart-parking": { find: "📍 หารถของฉัน", hide: "ซ่อนเส้นทาง", note: "อ่านป้ายทะเบียนที่ไม้กั้น ชำระเงินตอนออก จองช่อง EV ผ่านแอป" },
    lighting: { campaign: "แคมเปญบนทุกจอ", camps: { welcome: "ต้อนรับ", promo: "โปรโมชัน", news: "ข่าว", emergency: "ฉุกเฉิน" }, scene: "ฉากแสง", scenes: { show: "ไลต์โชว์", work: "ทำงาน", meeting: "ประชุม", evening: "ยามเย็น", eco: "ประหยัด" } },
  },
};
export const DEMO_IDS = ["surveillance", "access-control", "smart-parking", "lighting", ...DEMO2_IDS];

export function DemoDock({ id }) {
  const { language } = useLanguage();
  const t = DT[language] || DT.en;
  const d = t[id];
  const s = demo.use((x) => x);
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    const iv = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);
  const Section = DOCK2[id];
  if (!d && !Section) return null;
  if (Section)
    return (
      <div className={styles.dock}>
        <div className={styles.head}>{t.try}</div>
        <Section lang={language} s={s} styles={styles} />
      </div>
    );
  return (
    <>
      {id === "surveillance" && (
        <div className={`${styles.pip} ${s.alert ? styles.pipAlert : ""}`} style={{ left: PIP.left, top: PIP.top, width: PIP.w, height: PIP.h }}>
          <span className={styles.pipTag}>
            <i className={styles.rec} /> CAM-03 · {d.live}
          </span>
          <span className={styles.pipTime}>{clock.toLocaleTimeString("th-TH")}</span>
          <span className={styles.pipAi}>{s.alert ? d.alert : d.people(s.cam)}</span>
        </div>
      )}
      <div className={styles.dock}>
        <div className={styles.head}>{t.try}</div>
        {id === "surveillance" && (
          <button type="button" className={styles.primary} onClick={() => demo.set({ intrude: Date.now() })}>
            {d.intrude}
          </button>
        )}
        {id === "access-control" && (
          <>
            <div className={styles.label}>{d.title}</div>
            <div className={styles.grid}>
              {Object.entries(METHODS).map(([k, m]) => (
                <button key={k} type="button" className={k === "unknown" ? styles.danger : styles.btn} disabled={!!s.status} onClick={() => demo.set({ access: { method: k, at: Date.now() } })}>
                  {language === "th" ? m.th : m.en}
                </button>
              ))}
            </div>
            <div className={styles.label}>{d.log}</div>
            <ul className={styles.log}>
              {s.log.length === 0 && <li className={styles.muted}>{d.empty}</li>}
              {s.log.map((e, i) => (
                <li key={i}>
                  <span>{e.time}</span> {e.who} · {language === "th" ? METHODS[e.method].th : METHODS[e.method].en} · <b className={e.result === "denied" ? styles.bad : styles.good}>{d[e.result]}</b>
                </li>
              ))}
            </ul>
          </>
        )}
        {id === "smart-parking" && (
          <>
            <button type="button" className={s.findCar ? styles.on : styles.primary} onClick={() => demo.set({ findCar: !s.findCar })}>
              {s.findCar ? d.hide : d.find}
            </button>
            <p className={styles.note}>{d.note}</p>
          </>
        )}
        {id === "lighting" && (
          <>
            <div className={styles.label}>{d.campaign}</div>
            <div className={styles.segment}>
              {Object.entries(d.camps).map(([k, name]) => (
                <button key={k} type="button" className={s.campaign === k ? (k === "emergency" ? styles.segDanger : styles.segOn) : undefined} onClick={() => demo.set({ campaign: k, voice: s.voice + 1 })}>
                  {name}
                </button>
              ))}
            </div>
            <div className={styles.label}>{d.scene}</div>
            <div className={styles.segment}>
              {Object.entries(d.scenes).map(([k, name]) => (
                <button key={k} type="button" className={s.lights === k ? styles.segOn : undefined} onClick={() => demo.set({ lights: k, voice: s.voice + 1 })}>
                  {name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
