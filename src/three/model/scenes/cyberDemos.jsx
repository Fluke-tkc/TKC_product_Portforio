// "Try it" demos of the 07 Cyber Defense Center, one per infographic (CBS_1 ... CBS_5), drawn over the baked model:
// 1 network security (a DDoS flood met by IPS + scrubbing, a zero-trust remote login, what each layer guards),
// 2 endpoint security (ransomware on an analyst's PC isolated by EDR and rolled back, a data leak stopped by DLP,
// patching every device), 3 application & cloud security (an app shipped through SAST / DAST / vWAF into the data hall,
// a SQL-injection stopped at the vWAF, the XDR links), 4 threat intelligence (feeds from the dishes and the web fused
// on the globe, a new threat actor's IOCs pushed to the SOC and firewall, a dark-web leak), 5 consulting (services,
// a red-vs-blue cyber drill on the range). Also the centre-wide overlays (attack map, secure links), the panel and
// the reactions router used by SmartCybersecurity.jsx.
// Coordinates from smart_cybersecurity.py (Blender x, y, z -> three.js x, z, -y).
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Flow } from "../flow";
import { Packets, Rings, Tag } from "../reactions";
import dock from "./buildingDemos.module.css";
import cards from "./buildingDemos2.module.css";
import panel from "./buildingSystems.module.css";
import { Figure, Pops, Seg, TH, Wire, now, usePhase, useTint } from "./demoKit";
import { kdemo, ksys } from "./cyberStore";

const W = (x, y, z) => [x, z, -y];
const DECK = 10;
const lift = (p, dy) => [p[0], p[1] + dy, p[2]];

// ---------------------------------------------------------------- shared pieces

// the deck's LEDs (edge line, roof ring, wall lines) pulse red while `on()` holds; restored afterwards
function useLedAlarm(leds, on) {
  const red = useMemo(() => new THREE.Color("#ff3b3b").multiplyScalar(4), []);
  useEffect(() => () => leds.forEach((l) => l.mesh.material.color.copy(l.base)), [leds]);
  useFrame(({ clock }) => {
    const k = on() ? 0.5 + 0.5 * Math.sin(clock.elapsedTime * 8) : -1;
    leds.forEach((l) => (k < 0 ? l.mesh.material.color.copy(l.base) : l.mesh.material.color.copy(l.base).lerp(red, k)));
  });
}

const ALARM = new THREE.Color(1, 0.8, 0.8);

// the analyst desks of smart_cybersecurity.py soc_rows: focus (-4, 17), radii 8.5 / 11.5 / 14.5, -125..-55 deg
const DESKS = (() => {
  const out = [];
  [8.5, 11.5, 14.5].forEach((r, row) => {
    const a0 = (-125 * Math.PI) / 180;
    const a1 = (-55 * Math.PI) / 180;
    const n = Math.max(2, Math.floor((r * (a1 - a0)) / 2.7));
    for (let k = 0; k < n; k++) {
      const a = a0 + ((a1 - a0) * (k + 0.5)) / n;
      out.push(W(-4 + r * Math.cos(a), 17 + r * Math.sin(a), DECK + row * 0.3 + 1.25));
    }
  });
  return out;
})();

// ---------------------------------------------------------------- 1 network security

const HOLO_C = W(-4, -7.5, 14);
const HOLO_FLOOR = W(-4, -7.5, DECK + 0.08);
const FRONT_GLASS = W(-4, -16.3, 12.4);
// the internet side: just outside the deck glass, high in the network view so the flood is seen coming in
const SCRUB = W(-4, -19.5, 17.2);
const BOTS = [W(-17, -21, 20.5), W(-9, -22.5, 22.5), W(2, -22.5, 22.5), W(10, -21, 20.5)];
const HOLO_TAG = W(0, -9, 13.6); // upper right of the hologram, clear of the pin, the title and the panel
const REMOTE = W(16, -32, 0.16);
const CORE_FW = W(5.2, 10.2, DECK + 1.2);
const ALERT_SCR = W(-10.26, 10.7, 13.1);
const LAYER_AT = { ngfw: FRONT_GLASS, ips: HOLO_C, ztna: HOLO_C, siem: ALERT_SCR };
const LAYER_TAG = { ngfw: W(0, -16.3, 11.4), ips: HOLO_TAG, ztna: HOLO_TAG, siem: W(-10.26, 10.2, 11.0) };
const LAYER_TX = {
  en: {
    ngfw: ["🧱 Next-gen firewall + WAF at the edge", "Inspects every packet in and out · app-aware rules"],
    ips: ["🛡 IPS / IDS on the core", "Known attack patterns and anomalies stopped inline"],
    ztna: ["🔐 Zero trust · ZTNA + MFA", "Every user and device verified, access per app only"],
    siem: ["📊 SIEM + SOAR on the video wall", "42k events/s correlated · playbooks answer in seconds"],
  },
  th: {
    ngfw: ["🧱 ไฟร์วอลล์รุ่นใหม่ + WAF ที่ขอบเครือข่าย", "ตรวจทุกแพ็กเก็ตเข้าออก · กฎตามแอปพลิเคชัน"],
    ips: ["🛡 IPS / IDS บนแกนเครือข่าย", "หยุดรูปแบบการโจมตีและความผิดปกติแบบอินไลน์"],
    ztna: ["🔐 Zero trust · ZTNA + MFA", "ยืนยันทุกผู้ใช้และอุปกรณ์ ให้สิทธิ์ทีละแอป"],
    siem: ["📊 SIEM + SOAR บนวิดีโอวอลล์", "รวมเหตุการณ์ 42k/วินาที · playbook ตอบโต้ในไม่กี่วินาที"],
  },
};

function NetworkDemo({ materials, leds }) {
  const { language } = useLanguage();
  const th = TH(language);
  const layer = kdemo.use((s) => s.layer);
  const ddos = kdemo.use((s) => s.ddos);
  const ztna = kdemo.use((s) => s.ztna);
  const [dp] = usePhase(ddos, [0, 2.6, 5.4, 8.4], 12);
  const [zp] = usePhase(ztna, [0, 2.2, 4.6], 9);
  const alarm = dp === 0 || dp === 1;
  useTint(materials, () => (alarm ? ALARM : null));
  useLedAlarm(leds, () => alarm);
  const lx = (LAYER_TX[language] || LAYER_TX.en)[layer];
  const at = LAYER_AT[layer];
  const busy = dp >= 0 || zp >= 0;
  return (
    <group>
      {!busy && (
        <>
          <Rings at={at} radius={layer === "ngfw" ? 4 : 3.4} color="#5ee7ff" period={1.6} vertical={layer !== "ips"} />
          <Tag position={LAYER_TAG[layer]}>
            {lx[0]}
            <br />
            <span className={cards.small}>{lx[1]}</span>
          </Tag>
        </>
      )}
      {dp >= 0 && (
        <>
          <Packets from={BOTS} to={dp < 2 ? HOLO_C : SCRUB} color={dp === 1 ? "#ffd43b" : "#ff4d4d"} period={dp < 2 ? 0.9 : 1.3} lift={4} />
          {dp >= 2 && <Packets from={[SCRUB]} to={HOLO_C} color="#51cf66" period={1.6} lift={2} />}
          {dp >= 2 && <Rings at={SCRUB} radius={3} color={dp === 3 ? "#51cf66" : "#ffd43b"} period={0.9} vertical />}
          <Rings at={HOLO_FLOOR} radius={6} color={["#ff4d4d", "#ffd43b", "#5ee7ff", "#51cf66"][dp]} period={0.8} />
          <Tag position={HOLO_TAG}>
            <span className={dp < 2 ? cards.warn : dp === 3 ? cards.ok : undefined}>
              {
                [
                  th ? "🌊 DDoS 48 Gbps จากบอต 12,000 ตัว" : "🌊 DDoS · 48 Gbps from 12,000 bots",
                  th ? "🧠 IPS/NDR เจอความผิดปกติ · ส่งทราฟฟิกไปกรอง" : "🧠 IPS / NDR spot the flood · traffic to scrubbing",
                  th ? "🛡 ศูนย์กรองทิ้ง 99.7% · ผ่านเฉพาะทราฟฟิกจริง" : "🛡 Scrubbing drops 99.7% · only real users get through",
                  th ? "✓ ระบบออนไลน์ตลอด · ไม่มีลูกค้าได้รับผลกระทบ" : "✓ Services stayed online · no customer noticed",
                ][dp]
              }
            </span>
          </Tag>
        </>
      )}
      {zp >= 0 && (
        <>
          <Figure at={REMOTE} color="#74c0fc" />
          <Rings at={[REMOTE[0], 0.25, REMOTE[2]]} radius={3} color={zp === 0 ? "#ffd43b" : "#51cf66"} period={1} />
          {zp >= 1 && <Packets from={[lift(REMOTE, 1.6)]} to={HOLO_C} color={zp === 2 ? "#51cf66" : "#5ee7ff"} period={1.4} lift={8} />}
          <Tag position={lift(REMOTE, 3.2)}>
            <span className={zp === 2 ? cards.ok : undefined}>
              {
                [
                  th ? "📱 พนักงานล็อกอินจากบ้าน · MFA ส่งไปที่มือถือ" : "📱 Staff login from home · MFA push to the phone",
                  th ? "🔐 ZTNA ตรวจตัวตน + สุขภาพเครื่อง" : "🔐 ZTNA checks identity + device health",
                  th ? "✓ เข้าได้เฉพาะแอปที่ได้รับสิทธิ์" : "✓ In · to the one app allowed, nothing else",
                ][zp]
              }
            </span>
          </Tag>
        </>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- 2 endpoint security

// DESKS run from the row by the video wall (0-2) to the back row nearest the endpoint camera (8-13)
const HIT = DESKS[12]; // back row, right of centre: the PC that catches ransomware
const LEAK_FROM = DESKS[10];
const LEAK_TO = W(1.5, 0.5, DECK + 6.2); // stopped under the roof on its way out
const SPREAD = [DESKS[11], DESKS[13], DESKS[6]];
const PATCH_TAG = W(1.5, -1.5, 13.4);

function EndpointDemo() {
  const { language } = useLanguage();
  const th = TH(language);
  const ransom = kdemo.use((s) => s.ransom);
  const dlp = kdemo.use((s) => s.dlp);
  const patch = kdemo.use((s) => s.patch);
  const [rp] = usePhase(ransom, [0, 2.4, 5.2], 10);
  const [lp] = usePhase(dlp, [0, 2.2], 7);
  const [pp, pt] = usePhase(patch, [0, DESKS.length * 0.28 + 0.6], DESKS.length * 0.28 + 4);
  return (
    <group>
      <Pops
        points={DESKS}
        shown={(i) => (pp >= 0 ? Math.min(1, Math.max(0, (pt.current - i * 0.28) * 4)) * 1.2 : 0.7)}
        colors={(i) => (rp >= 0 && rp < 2 && DESKS[i] === HIT ? "#ff4d4d" : pp >= 0 && pt.current > i * 0.28 ? "#51cf66" : "#5ee7ff")}
        size={0.16}
        dy={0.7}
      />
      {rp >= 0 && (
        <>
          <Rings at={[HIT[0], HIT[1] - 1.2, HIT[2]]} radius={3} color={rp === 2 ? "#51cf66" : "#ff4d4d"} period={0.8} />
          {rp === 0 && SPREAD.map((p, i) => <Packets key={i} from={[HIT]} to={p} color="#ff4d4d" period={0.8 + i * 0.2} lift={1} />)}
          {rp >= 1 && <Wire at={[HIT[0], HIT[1] - 1.25, HIT[2]]} size={[2.2, 2.2, 2.2]} color={rp === 2 ? "#51cf66" : "#ffd43b"} />}
          <Tag position={lift(HIT, 1.9)}>
            <span className={rp < 2 ? cards.warn : cards.ok}>
              {
                [
                  th ? "🦠 แรนซัมแวร์เริ่มเข้ารหัสไฟล์ · PC-07" : "🦠 Ransomware starts encrypting · PC-07",
                  th ? "🧠 EDR จับพฤติกรรม · ตัดเครื่องออกจากเครือข่ายใน 3 วิ" : "🧠 EDR spots the behaviour · PC-07 isolated in 3 s",
                  th ? "↩ ย้อนไฟล์กลับ · ข้อมูลไม่หาย 0 ไฟล์" : "↩ Files rolled back · 0 lost · report filed",
                ][rp]
              }
            </span>
          </Tag>
        </>
      )}
      {lp >= 0 && (
        <>
          <Packets from={[LEAK_FROM]} to={LEAK_TO} color="#ffd43b" period={1.1} lift={1.5} />
          <Rings at={LEAK_TO} radius={2.4} color="#ff4d4d" period={0.7} />
          <Tag position={lift(LEAK_TO, 2)}>
            <span className={lp === 0 ? cards.warn : cards.ok}>
              {lp === 0 ? (th ? "📤 ส่งไฟล์ลูกค้า 2,300 รายการออกอีเมลส่วนตัว" : "📤 2,300 customer records sent to a private mail") : th ? "⛔ DLP บล็อก + แจ้งหัวหน้า · ไฟล์เข้ารหัสอยู่แล้ว" : "⛔ DLP blocked it + told the manager · file was encrypted"}
            </span>
          </Tag>
        </>
      )}
      {pp >= 0 && (
        <Tag position={PATCH_TAG}>
          <span className={pp === 1 ? cards.ok : undefined}>{pp === 0 ? (th ? "🔄 กำลังลงแพตช์ทุกเครื่อง…" : "🔄 Patching every device…") : th ? "✓ อัปเดตครบ 1,240 เครื่อง · ไม่ต้องรีบูตกลางกะ" : "✓ 1,240 devices patched · no reboot mid-shift"}</span>
        </Tag>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- 3 application & cloud security

const RACKS = [4.3, 6.4, 8.5, 10.6, 12.7, 14.8].map((x) => W(x, 0.5, 2.5));
const HALL_IN = W(9.5, 4, 2.4);
const HALL_FRONT = W(9.5, -6.4, 2.6);
const DEV = W(8, -5, DECK + 0.6);
const CLOUD_TAG = W(11, -6.6, 2.4); // under the hotspot pin, clear of the dock and the info panel
const WEB_BOTS = [W(30, -46, 12), W(-4, -46, 14)];
const XDR_HUB = W(-4, 10.6, 15.2); // the video wall: one console for all layers
const XDR_FROM = [DESKS[2], HOLO_C, HALL_IN, W(12.5, -9.5, 12.1)];

function CloudDemo() {
  const { language } = useLanguage();
  const th = TH(language);
  const deploy = kdemo.use((s) => s.deploy);
  const sqli = kdemo.use((s) => s.sqli);
  const xdr = kdemo.use((s) => s.xdr);
  const [dp, dt] = usePhase(deploy, [0, 2.2, 4.4, 6.6], 10);
  const [sp] = usePhase(sqli, [0, 2.4], 8);
  return (
    <group>
      {dp >= 0 && (
        <>
          <Packets from={[DEV]} to={HALL_IN} color="#74c0fc" period={1.2} lift={2} />
          <Pops points={RACKS} shown={(i) => (dp >= 3 ? 1.3 : Math.min(1, Math.max(0, dt.current - 4.4 - i * 0.25) * 3))} colors={() => (dp >= 2 ? "#51cf66" : "#5ee7ff")} size={0.35} dy={0.5} />
          <Tag position={CLOUD_TAG}>
            <span className={dp === 3 ? cards.ok : undefined}>
              {
                [
                  th ? "🔍 SAST สแกนซอร์สโค้ด · แก้ 2 จุดก่อน merge" : "🔍 SAST scans the source · 2 issues fixed before merge",
                  th ? "🧪 DAST ทดสอบแอปที่รันจริง · ผ่าน" : "🧪 DAST attacks the running app · passed",
                  th ? "☁ ขึ้นคลาวด์ + เปิด vWAF / vFW · CASB คุมสิทธิ์" : "☁ Deployed · vWAF + vFW on, CASB guards access",
                  th ? "✓ ออนไลน์ใน 6 นาที · ปลอดภัยตั้งแต่โค้ดบรรทัดแรก" : "✓ Live in 6 min · secure from the first line of code",
                ][dp]
              }
            </span>
          </Tag>
        </>
      )}
      {sp >= 0 && (
        <>
          <Packets from={WEB_BOTS} to={HALL_FRONT} color="#ff4d4d" period={1} lift={5} />
          <Rings at={HALL_FRONT} radius={4} color={sp === 0 ? "#ff4d4d" : "#51cf66"} period={0.8} vertical />
          <Tag position={CLOUD_TAG}>
            <span className={sp === 0 ? cards.warn : cards.ok}>
              {sp === 0 ? (th ? "💉 SQL injection ยิงเข้าหน้าเว็บ · 300 ครั้ง/วิ" : "💉 SQL injection on the web app · 300 tries/s") : th ? "🛡 vWAF บล็อกทั้งหมด · แอปและฐานข้อมูลปลอดภัย" : "🛡 vWAF blocked every one · app and data untouched"}
            </span>
          </Tag>
        </>
      )}
      {xdr && (
        <>
          {XDR_FROM.map((p, i) => (
            <Flow key={i} points={[p, XDR_HUB]} color="#b197fc" radius={0.08} speed={2} dash={1.2} />
          ))}
          <Tag position={lift(HALL_IN, 4.6)}>
            <span className={cards.small}>{th ? "🧩 XDR รวมสัญญาณ endpoint · เครือข่าย · คลาวด์ · ข่าวกรอง" : "🧩 XDR joins endpoint · network · cloud · intel signals"}</span>
          </Tag>
        </>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- 4 threat intelligence

const GLOBE = W(12.5, -9.5, 12.1);
const DISHES = [W(28.5, -1, 3.4), W(35, 8, 4.4), W(30, 15.5, 3)];
const WEB_FEEDS = [W(46, -30, 26), W(36, -48, 20)];
const DARKWEB = W(9, -13.2, DECK + 1.3);
const TI_TAG = W(16.5, 1.0, 12.6); // the middle of the wing in the TI view (the globe sits at its left edge)

function IntelDemo() {
  const { language } = useLanguage();
  const th = TH(language);
  const intel = kdemo.use((s) => s.intel);
  const actor = kdemo.use((s) => s.actor);
  const dark = kdemo.use((s) => s.dark);
  const [ip] = usePhase(intel, [0, 3], 8);
  const [ap] = usePhase(actor, [0, 2.4, 5], 10);
  const [kp] = usePhase(dark, [0, 2.4], 8);
  return (
    <group>
      {ip >= 0 && (
        <>
          <Packets from={DISHES} to={GLOBE} color="#5ee7ff" period={1.4} lift={5} />
          <Packets from={WEB_FEEDS} to={GLOBE} color="#b197fc" period={1.6} lift={4} />
          <Rings at={GLOBE} radius={3} color="#5ee7ff" period={1.2} />
          <Tag position={TI_TAG}>
            <span className={ip === 1 ? cards.ok : undefined}>
              {ip === 0 ? (th ? "📡 SATINT · COMINT · เว็บ · ดาร์กเว็บ · MISP" : "📡 SATINT · COMINT · web · dark web · MISP feeds") : th ? "🧠 รวม + วิเคราะห์ 8,450 IOC วันนี้" : "🧠 Fused + analysed · 8,450 IOCs today"}
            </span>
          </Tag>
        </>
      )}
      {ap >= 0 && (
        <>
          <Rings at={GLOBE} radius={3.4} color={ap === 0 ? "#ff4d4d" : ap === 1 ? "#ffd43b" : "#51cf66"} period={0.8} />
          {ap >= 1 && <Packets from={[GLOBE]} to={HOLO_C} color="#ffd43b" period={1.2} lift={3} />}
          {ap >= 1 && <Packets from={[GLOBE]} to={CORE_FW} color="#ffd43b" period={1.4} lift={3} />}
          <Tag position={TI_TAG}>
            <span className={ap === 0 ? cards.warn : ap === 2 ? cards.ok : undefined}>
              {
                [
                  th ? "🎯 กลุ่มแฮกเกอร์ใหม่เล็งธนาคารในไทย" : "🎯 New threat actor targeting Thai banks",
                  th ? "📤 ส่ง IOC ให้ SOC + ไฟร์วอลล์ (TIP / MISP)" : "📤 IOCs pushed to the SOC + firewall (TIP / MISP)",
                  th ? "✓ บล็อก 1,284 IP ล่วงหน้าก่อนโดนโจมตี" : "✓ 1,284 IPs blocked before the first hit",
                ][ap]
              }
            </span>
          </Tag>
        </>
      )}
      {kp >= 0 && (
        <>
          <Rings at={[DARKWEB[0], DECK + 0.1, DARKWEB[2]]} radius={2.6} color={kp === 0 ? "#ff4d4d" : "#51cf66"} period={0.9} />
          <Tag position={TI_TAG}>
            <span className={kp === 0 ? cards.warn : cards.ok}>
              {kp === 0 ? (th ? "🕵 เจอรหัสผ่านพนักงาน 12 บัญชีในฟอรัมดาร์กเว็บ" : "🕵 12 staff passwords found on a dark-web forum") : th ? "✓ บังคับเปลี่ยนรหัส + เปิด MFA ทันที" : "✓ Forced reset + MFA before anyone used them"}
            </span>
          </Tag>
        </>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- 5 consulting services

const BOARD = W(-22, -0.4, 12.9);
const BLUE = [[-25, -5.4], [-21, -5.4], [-17, -5.4]].map(([x, y]) => W(x, y, DECK + 1.3));
const RED = [[-23, -9.4], [-19.4, -9.4], [-15.8, -9.4]].map(([x, y]) => W(x, y, DECK + 1.3));
const ROOM = W(-19.4, 3.0, DECK + 1.6);
const CONSULT_TAG = W(-19.4, -5.2, 12.2); // over the trainee desks, below the hotspot pin
const SERVICE_TX = {
  en: {
    soc: ["🛰 Managed SOC + MDR", "Our analysts watch your systems 24/7 from this deck"],
    pentest: ["🎯 VA + Penetration test", "Ethical hackers find the holes before criminals do"],
    iso: ["📋 ISO 27001 · PDPA · compliance", "Gap analysis, policies, audit-ready in months"],
    forensics: ["🔬 Digital forensics", "Evidence collected and analysed after an incident"],
  },
  th: {
    soc: ["🛰 Managed SOC + MDR", "นักวิเคราะห์ของเราเฝ้าระบบคุณ 24/7 จากศูนย์นี้"],
    pentest: ["🎯 VA + Penetration test", "แฮกเกอร์สายขาวหาช่องโหว่ก่อนคนร้าย"],
    iso: ["📋 ISO 27001 · PDPA · Compliance", "ประเมินช่องว่าง วางนโยบาย พร้อมรับการตรวจ"],
    forensics: ["🔬 Digital forensics", "เก็บและวิเคราะห์หลักฐานดิจิทัลหลังเกิดเหตุ"],
  },
};

function ConsultDemo() {
  const { language } = useLanguage();
  const th = TH(language);
  const service = kdemo.use((s) => s.service);
  const drill = kdemo.use((s) => s.drill);
  const [cp] = usePhase(drill, [0, 2.6, 5.4, 8.2], 12);
  const sx = (SERVICE_TX[language] || SERVICE_TX.en)[service];
  return (
    <group>
      {cp < 0 && (
        <>
          {service === "soc" && <Flow points={[ROOM, HOLO_C]} color="#5ee7ff" radius={0.08} speed={2} dash={1.2} />}
          {service === "pentest" && <Packets from={RED} to={HALL_IN} color="#ff922b" period={1.6} lift={4} />}
          {service === "iso" && <Pops points={[...BLUE, ...RED]} shown={() => 1} colors={() => "#51cf66"} size={0.16} dy={0.6} />}
          {service === "forensics" && <Rings at={W(-19.4, -9.4, DECK + 0.08)} radius={3} color="#b197fc" period={1.2} />}
          <Tag position={CONSULT_TAG}>
            {sx[0]}
            <br />
            <span className={cards.small}>{sx[1]}</span>
          </Tag>
        </>
      )}
      {cp >= 0 && (
        <>
          {RED.map((p, i) => (
            <Rings key={`r${i}`} at={[p[0], DECK + 0.08, p[2]]} radius={1.8} color="#ff4d4d" period={0.9 + i * 0.1} />
          ))}
          {BLUE.map((p, i) => (
            <Rings key={`b${i}`} at={[p[0], DECK + 0.08, p[2]]} radius={1.8} color={cp >= 2 ? "#51cf66" : "#4dabf7"} period={0.9 + i * 0.1} />
          ))}
          {cp <= 1 && <Packets from={RED} to={BLUE[1]} color="#ff4d4d" period={0.9} lift={1.2} />}
          {cp >= 2 && <Packets from={BLUE} to={RED[1]} color="#4dabf7" period={1.1} lift={1.2} />}
          <Tag position={CONSULT_TAG}>
            <span className={cp === 0 ? cards.warn : cp === 3 ? cards.ok : undefined}>
              {
                [
                  th ? "🔴 ทีมแดงเริ่มโจมตีเครือข่ายจำลอง" : "🔴 Red team attacks the practice network",
                  th ? "🔵 ทีมน้ำเงินตรวจจับ · ปิดช่องทาง" : "🔵 Blue team detects · closes the way in",
                  th ? "🛡 กักบริเวณ + กู้ระบบตาม playbook" : "🛡 Contained + restored by the playbook",
                  th ? "✓ ทีมน้ำเงินชนะ · 14 นาที · คะแนน 87" : "✓ Blue team wins · 14 min · score 87",
                ][cp]
              }
            </span>
          </Tag>
        </>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- centre-wide overlays (panel toggles)

const SHIELD = W(-4, -2, DECK + 7 + 4.2);
const EDGES = [W(-48, -36, 18), W(-50, 10, 26), W(-20, -52, 24), W(24, -50, 20), W(50, -20, 24), W(48, 22, 30)];
const LINKS = [
  [W(-4, 19.0, DECK + 1.5), W(-4, 0, DECK + 1.5), W(9.5, 4, 3)],
  [W(-4, 0, DECK + 1.5), W(28.5, -1, 3.6)],
  [W(-4, 0, DECK + 1.5), W(-34.5, -18.6, 2.5)],
];

function AttackMap() {
  const { language } = useLanguage();
  return (
    <group>
      <Packets from={EDGES} to={SHIELD} color="#ff4d4d" period={1.4} lift={8} />
      <Rings at={SHIELD} radius={11} color="#5ee7ff" period={1.6} />
      <Tag position={lift(SHIELD, 8.5)}>{TH(language) ? "🌐 บล็อกการโจมตี 2,140 ครั้งวันนี้" : "🌐 2,140 attacks blocked today"}</Tag>
    </group>
  );
}

function SecureLinks() {
  return LINKS.map((pts, i) => <Flow key={i} points={pts} color="#51cf66" radius={0.1} speed={2.4} dash={1.4} />);
}

// ---------------------------------------------------------------- dock (HTML, outside the canvas)

const DT = {
  en: {
    try: "Try it", title: "Defense center", attacks: "🌐 Live attack map", links: "🔗 Secure links", hint: "Click a zone · pick a topic below",
    layer: "Layer", layers: { ngfw: "NGFW", ips: "IPS", ztna: "ZTNA", siem: "SIEM" }, ddos: "🌊 DDoS attack", ztnaGo: "🔐 Remote login",
    net: [["Threats blocked", "18,420 today", 0.9, "#51cf66"], ["Uptime", "99.99%", 0.99, "#4dabf7"], ["Time to detect", "4 min", 0.85, "#ffd43b"], ["Devices on NAC", "1,240", 0.8, "#b197fc"]],
    ransom: "🦠 Ransomware on a PC", dlp: "📤 Data leak", patch: "🔄 Patch every device",
    ep: [["Devices protected", "1,240", 1, "#51cf66"], ["Patched", "98%", 0.98, "#4dabf7"], ["Disks encrypted", "100%", 1, "#ffd43b"], ["Isolate time", "3 s", 0.95, "#b197fc"]],
    deploy: "🚀 Ship an app (DevSecOps)", sqli: "💉 Web attack", xdrOn: "Show XDR links", xdrOff: "Hide XDR links",
    app: [["Apps scanned", "64", 0.8, "#51cf66"], ["Critical vulns", "0", 1, "#4dabf7"], ["WAF blocks", "9,200/day", 0.7, "#ffd43b"], ["Cloud compliance", "98%", 0.98, "#b197fc"]],
    intel: "📡 Gather intel", actor: "🎯 New threat actor", dark: "🕵 Dark-web alert",
    ti: [["Feeds", "120", 0.8, "#51cf66"], ["IOCs today", "8,450", 0.7, "#4dabf7"], ["Actors tracked", "36", 0.5, "#ffd43b"], ["Shared (MISP)", "1,200", 0.6, "#b197fc"]],
    service: "Service", services: { soc: "SOC", pentest: "Pen test", iso: "ISO", forensics: "Forensics" }, drill: "🎯 Run a cyber drill",
    cs: [["Clients", "120+", 0.8, "#51cf66"], ["Pen tests / year", "300", 0.7, "#4dabf7"], ["Drill score", "87 / 100", 0.87, "#ffd43b"], ["ISO 27001 projects", "40", 0.6, "#b197fc"]],
  },
  th: {
    try: "ลองเล่น", title: "ศูนย์ป้องกัน", attacks: "🌐 แผนที่การโจมตี", links: "🔗 ลิงก์ที่ปลอดภัย", hint: "คลิกโซน · เลือกหัวข้อด้านล่าง",
    layer: "ชั้นป้องกัน", layers: { ngfw: "NGFW", ips: "IPS", ztna: "ZTNA", siem: "SIEM" }, ddos: "🌊 โจมตี DDoS", ztnaGo: "🔐 ล็อกอินจากบ้าน",
    net: [["บล็อกภัยคุกคาม", "18,420 วันนี้", 0.9, "#51cf66"], ["ระบบพร้อมใช้", "99.99%", 0.99, "#4dabf7"], ["เวลาตรวจพบ", "4 นาที", 0.85, "#ffd43b"], ["อุปกรณ์ใน NAC", "1,240", 0.8, "#b197fc"]],
    ransom: "🦠 แรนซัมแวร์เข้าเครื่อง", dlp: "📤 ข้อมูลรั่ว", patch: "🔄 แพตช์ทุกเครื่อง",
    ep: [["อุปกรณ์ที่ป้องกัน", "1,240", 1, "#51cf66"], ["อัปเดตแพตช์", "98%", 0.98, "#4dabf7"], ["เข้ารหัสดิสก์", "100%", 1, "#ffd43b"], ["เวลาแยกเครื่อง", "3 วิ", 0.95, "#b197fc"]],
    deploy: "🚀 ปล่อยแอป (DevSecOps)", sqli: "💉 โจมตีเว็บ", xdrOn: "แสดงลิงก์ XDR", xdrOff: "ซ่อนลิงก์ XDR",
    app: [["แอปที่สแกน", "64", 0.8, "#51cf66"], ["ช่องโหว่ร้ายแรง", "0", 1, "#4dabf7"], ["WAF บล็อก", "9,200/วัน", 0.7, "#ffd43b"], ["Compliance คลาวด์", "98%", 0.98, "#b197fc"]],
    intel: "📡 รวบรวมข่าวกรอง", actor: "🎯 พบกลุ่มแฮกเกอร์ใหม่", dark: "🕵 แจ้งเตือนดาร์กเว็บ",
    ti: [["แหล่งข้อมูล", "120", 0.8, "#51cf66"], ["IOC วันนี้", "8,450", 0.7, "#4dabf7"], ["กลุ่มที่ติดตาม", "36", 0.5, "#ffd43b"], ["แบ่งปัน (MISP)", "1,200", 0.6, "#b197fc"]],
    service: "บริการ", services: { soc: "SOC", pentest: "Pen test", iso: "ISO", forensics: "Forensics" }, drill: "🎯 ซ้อมรับมือไซเบอร์",
    cs: [["ลูกค้า", "120+", 0.8, "#51cf66"], ["Pen test / ปี", "300", 0.7, "#4dabf7"], ["คะแนนซ้อม", "87 / 100", 0.87, "#ffd43b"], ["โครงการ ISO 27001", "40", 0.6, "#b197fc"]],
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
  "network-security": ({ t, s }) => (
    <>
      <div className={dock.label}>{t.layer}</div>
      <Seg items={t.layers} value={s.layer} onPick={(k) => kdemo.set({ layer: k })} />
      <div className={dock.grid}>
        <button type="button" className={dock.danger} onClick={() => kdemo.set({ ddos: now() })}>
          {t.ddos}
        </button>
        <button type="button" className={dock.primary} onClick={() => kdemo.set({ ztna: now() })}>
          {t.ztnaGo}
        </button>
      </div>
      <Bars rows={t.net} />
    </>
  ),
  "endpoint-security": ({ t }) => (
    <>
      <div className={dock.grid}>
        <button type="button" className={dock.danger} onClick={() => kdemo.set({ ransom: now() })}>
          {t.ransom}
        </button>
        <button type="button" className={dock.danger} onClick={() => kdemo.set({ dlp: now() })}>
          {t.dlp}
        </button>
      </div>
      <button type="button" className={dock.primary} onClick={() => kdemo.set({ patch: now() })}>
        {t.patch}
      </button>
      <Bars rows={t.ep} />
    </>
  ),
  "app-cloud-security": ({ t, s }) => (
    <>
      <div className={dock.grid}>
        <button type="button" className={dock.primary} onClick={() => kdemo.set({ deploy: now() })}>
          {t.deploy}
        </button>
        <button type="button" className={dock.danger} onClick={() => kdemo.set({ sqli: now() })}>
          {t.sqli}
        </button>
      </div>
      <button type="button" className={s.xdr ? dock.on : dock.btn} onClick={() => kdemo.set({ xdr: !s.xdr })}>
        {s.xdr ? t.xdrOff : t.xdrOn}
      </button>
      <Bars rows={t.app} />
    </>
  ),
  "threat-intelligence": ({ t }) => (
    <>
      <button type="button" className={dock.primary} onClick={() => kdemo.set({ intel: now() })}>
        {t.intel}
      </button>
      <div className={dock.grid}>
        <button type="button" className={dock.danger} onClick={() => kdemo.set({ actor: now() })}>
          {t.actor}
        </button>
        <button type="button" className={dock.danger} onClick={() => kdemo.set({ dark: now() })}>
          {t.dark}
        </button>
      </div>
      <Bars rows={t.ti} />
    </>
  ),
  consulting: ({ t, s }) => (
    <>
      <div className={dock.label}>{t.service}</div>
      <Seg items={t.services} value={s.service} onPick={(k) => kdemo.set({ service: k })} />
      <button type="button" className={dock.primary} onClick={() => kdemo.set({ drill: now() })}>
        {t.drill}
      </button>
      <Bars rows={t.cs} />
    </>
  ),
};

export function CyberPanel({ hidden, activeId }) {
  const { language } = useLanguage();
  const t = DT[language] || DT.en;
  const s = kdemo.use();
  const sys = ksys.use();
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
        <button type="button" className={sys.attacks ? panel.onHvac : panel.btn} aria-pressed={sys.attacks} onClick={() => ksys.set({ attacks: !sys.attacks })}>
          {t.attacks}
        </button>
        <button type="button" className={sys.links ? panel.onEnergy : panel.btn} aria-pressed={sys.links} onClick={() => ksys.set({ links: !sys.links })}>
          {t.links}
        </button>
      </div>
      <p className={panel.hint}>{t.hint}</p>
    </div>
  );
}

// ---------------------------------------------------------------- reactions router (BakedModel's `reactions`)

export function CyberReactions({ active, materials, leds }) {
  const sys = ksys.use();
  return (
    <>
      {sys.attacks && <AttackMap />}
      {sys.links && <SecureLinks />}
      {active === "network-security" && <NetworkDemo materials={materials} leds={leds} />}
      {active === "endpoint-security" && <EndpointDemo />}
      {active === "app-cloud-security" && <CloudDemo />}
      {active === "threat-intelligence" && <IntelDemo />}
      {active === "consulting" && <ConsultDemo />}
    </>
  );
}
