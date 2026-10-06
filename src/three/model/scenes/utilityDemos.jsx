// "Try it" demos of the 09 Smart Utility district, one per infographic (U_3 ... U_8), drawn over the baked model:
// 1 DR & EMS (an evening peak met by a demand-response event, AI optimisation), 2 renewables (sunny / cloudy / windy
// changes what the solar farm and the turbines give, a forecast), 3 AMI (read every smart meter through the data
// concentrator, an outage found by the meters' last gasp), 4 microgrid (the grid fails and the street islands on its
// community battery and rooftop PV, P2P trading), 5 EV integration (smart charging / V2G / solar-to-car, booking a
// charger), 6 energy storage (charge / discharge, a frequency dip answered in 0.2 s, a thermal alarm).
// Also the district overlays (power flow, smart meters), the panel and the reactions router used by SmartUtility.jsx.
// Coordinates from smart_utility.py (Blender x, y, z -> three.js x, z, -y).
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Flow } from "../flow";
import { Packets, Rays, Rings, Tag } from "../reactions";
import dock from "./buildingDemos.module.css";
import cards from "./buildingDemos2.module.css";
import panel from "./buildingSystems.module.css";
import { Bars, Pops, Seg, TH, Wire, now, usePhase, useTint } from "./demoKit";
import { udemo, usys } from "./utilityStore";

const W = (x, y, z) => [x, z, -y];
const lift = (p, dy) => [p[0], p[1] + dy, p[2]];
const G0 = 0.16;
const RED = new THREE.Color(1, 0.82, 0.8);
const DUSK = new THREE.Color(0.55, 0.6, 0.85);
const GREY = new THREE.Color(0.78, 0.8, 0.86);

// ---------------------------------------------------------------- places in the district

// the DR view looks in through the front glass at the video wall and the operator rows (the hologram is off to the left)
const HALL_HOLO = W(-5, 8.6, 3.4); // the video wall's centre
const HALL_FLOOR = W(-5, 1.2, 0.34);
const HALL_WALL = W(-5, 8.4, 3.6);
const HALL_TAG = W(-5, -1.6, 3.2);
const DR_OUT = [W(-17, -5, 4), W(-5, -5, 5), W(7, -5, 4)]; // through the front glass towards the district
const DESKS = [-11, -7, -3, 1].map((x) => W(x, 5.6, 1.4)).concat([-9, -5, -1].map((x) => W(x, 3.0, 1.4)));

const SOLAR = [14.8, 18.2, 21.6, 25, 30.2, 33.6, 37, 40.4].flatMap((x) => [W(x, 13.8, 1.6), W(x, 18.4, 1.6)]);
const INVERTER = W(25.6, 22.6, 2.6);
const HUBS = [W(15, 22.9, 20.9), W(36, 22.9, 20.9)];
const FARM_TAG = W(34, 16, 15); // right of the pylons, clear of the dock

const HOUSES = [18.5, 27.5, 36.5];
const METERS_FRONT = HOUSES.map((x, i) => W(x + (i % 2 ? -0.3 : 0.3), 1.3, 1.9)); // row 2 (the AMI row) faces the lane
const METERS_BACK = HOUSES.map((x, i) => W(x + (i % 2 ? -0.3 : 0.3), -15.3, 1.9)); // row 1 faces the street
const DCU = W(24, -5.8, 4.4); // the data concentrator on the lane pole
const POLE_TX = W(32.8, -5.5, 6.4);
const AMI_TAG = W(26, -2, 7.6);
const ROW2_ROOFS = HOUSES.map((x) => W(x, 4.6, 8.4));

const ROW1_ROOFS = HOUSES.map((x) => W(x, -13.4, 7.6));
const ROW1_DOORS = HOUSES.map((x, i) => W(x + (i % 2 ? -1.4 : 1.4), -15.8, 1.2));
const CBATT = W(41.8, -13.4, 2.6);
const MGCTL = W(41.8, -17.4, 1.7);
const MG_TAG = W(35, -15, 7);

const PORT_Y = -10.15;
const CARS = [0, 1, 3, 4, 5, 7, 8].map((k) => W(-18 + (k + 0.5) * 2.889, PORT_Y, 1.5));
const V2G = [1, 4, 7].map((k) => W(-18 + (k + 0.5) * 2.889, PORT_Y, 1.5));
const CHARGERS = [1, 3, 5, 7].map((k) => W(-18 + k * 2.889, -7.25, 1.6));
const FREE_BAY = W(-18 + 2.5 * 2.889, PORT_Y, 0.2);
const HALL_IN = W(-6, -1, 2.5);
const CANOPY = W(-5, -9.8, 3.6);
const EV_TAG = W(-7, -8.6, 2.6);

const BESS = [-40.4, -36.4, -32.4, -28.4].map((x) => W(x, -4.8, 3.4));
const BESS_FLOOR = W(-34.4, -4.8, 0.2);
const PCS = [W(-38.4, -14.6, 2.6), W(-30.4, -14.6, 2.6)];
const SUB_TX = W(-30, 12, 4.5);
const HOT_BESS = W(-32.4, -4.8, 0.32);
const BESS_TAG = W(-33, -9.5, 6.5);

// ---------------------------------------------------------------- 1 demand response & EMS

function EmsDemo({ materials }) {
  const { language } = useLanguage();
  const th = TH(language);
  const peak = udemo.use((s) => s.peak);
  const optimise = udemo.use((s) => s.optimise);
  const [pp] = usePhase(peak, [0, 2.4, 5, 8], 11);
  const [op] = usePhase(optimise, [0, 2.6], 7);
  useTint(materials, () => (pp === 0 ? RED : null));
  const shed = pp >= 2;
  return (
    <group>
      {pp >= 0 && (
        <>
          <Rings at={HALL_FLOOR} radius={5} color={["#ff4d4d", "#ffd43b", "#5ee7ff", "#51cf66"][pp]} period={0.9} />
          {pp >= 1 && pp < 3 && <Packets from={[HALL_HOLO]} to={DR_OUT[1]} color="#ffd43b" period={1.1} lift={2} />}
          {pp >= 1 && pp < 3 && <Packets from={[HALL_HOLO]} to={DR_OUT[0]} color="#ffd43b" period={1.3} lift={2} />}
          {pp >= 1 && pp < 3 && <Packets from={[HALL_HOLO]} to={DR_OUT[2]} color="#ffd43b" period={1.5} lift={2} />}
          <Pops points={DESKS} shown={() => (shed ? 1 : 0.6)} colors={(i) => (shed ? "#51cf66" : i % 3 ? "#ffd43b" : "#ff6b6b")} size={0.24} dy={0.6} />
          <Tag position={HALL_TAG}>
            <span className={pp === 0 ? cards.warn : pp === 3 ? cards.ok : undefined}>
              {
                [
                  th ? "🔥 ช่วงพีคตอนเย็น · โหลด 98% ของกำลังผลิต" : "🔥 Evening peak · load at 98% of capacity",
                  th ? "📡 EMS ส่งสัญญาณ DR ไป 1,240 จุด" : "📡 EMS sends a DR signal to 1,240 sites",
                  th ? "❄ แอร์ +1°C · พักชาร์จ EV · BESS จ่ายไฟ" : "❄ HVAC +1°C · EV charging paused · BESS discharging",
                  th ? "✓ ลดพีคได้ 2.4 MW · ประหยัด ฿186,000" : "✓ Peak cut by 2.4 MW · ฿186,000 saved",
                ][pp]
              }
            </span>
          </Tag>
        </>
      )}
      {op >= 0 && pp < 0 && (
        <>
          <Packets from={[HALL_WALL]} to={HALL_HOLO} color="#b197fc" period={1.2} lift={1.5} />
          <Rings at={HALL_FLOOR} radius={4} color="#b197fc" period={1.2} />
          <Tag position={HALL_TAG}>
            <span className={op === 1 ? cards.ok : undefined}>
              {op === 0 ? (th ? "🧠 AI พยากรณ์โหลดพรุ่งนี้ · พีค 17:40 น." : "🧠 AI forecasts tomorrow · peak at 17:40") : th ? "✓ ตั้งเวลาแอร์ ชาร์จรถ และแบตไว้ล่วงหน้า · −11% ค่าไฟ" : "✓ HVAC, EV charging and BESS scheduled ahead · −11% bill"}
            </span>
          </Tag>
        </>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- 2 renewables

function RenewableDemo({ materials, anim }) {
  const { language } = useLanguage();
  const th = TH(language);
  const weather = udemo.use((s) => s.weather);
  const forecast = udemo.use((s) => s.forecast);
  const [fp] = usePhase(forecast, [0, 3], 8);
  const rotors = useMemo(() => anim.filter((o) => /^(wt\dr|off_vawt\d)$/.test(o.name)), [anim]);
  useEffect(() => {
    rotors.forEach((o) => (o.userData.mult = weather === "windy" ? 3.2 : weather === "cloudy" ? 1.2 : 0.6));
    return () => rotors.forEach((o) => delete o.userData.mult);
  }, [rotors, weather]);
  useTint(materials, () => (weather === "cloudy" ? GREY : null));
  const tx = (WX[language] || WX.en)[weather];
  return (
    <group>
      {weather === "sunny" && <Rays at={W(28, 16, 1)} radius={11} count={9} length={26} />}
      {weather !== "windy" && <Packets from={weather === "sunny" ? SOLAR.slice(0, 8) : SOLAR.slice(0, 3)} to={INVERTER} color="#ffd43b" period={weather === "sunny" ? 1.4 : 2.6} lift={2} />}
      {weather !== "sunny" && <Packets from={HUBS} to={INVERTER} color="#74c0fc" period={weather === "windy" ? 1.1 : 2.4} lift={3} />}
      <Rings at={lift(INVERTER, -2.4)} radius={4} color={weather === "cloudy" ? "#ffd43b" : "#51cf66"} period={1.2} />
      <Tag position={FARM_TAG}>
        {fp >= 0 ? (
          <span className={fp === 1 ? cards.ok : undefined}>
            {fp === 0 ? (th ? "📈 พยากรณ์อากาศ + AI · พรุ่งนี้แดดจัด 10–15 น." : "📈 Weather + AI forecast · sunny tomorrow 10:00–15:00") : th ? "✓ วางแผนชาร์จ BESS ช่วงเที่ยง · ขายไฟเย็น" : "✓ BESS charges at noon, sells in the evening"}
          </span>
        ) : (
          <>
            {tx[0]}
            <br />
            <span className={cards.small}>{tx[1]}</span>
          </>
        )}
      </Tag>
    </group>
  );
}

const WX = {
  en: {
    sunny: ["☀ Sunny · solar 3.2 MW · wind 0.4 MW", "Clean energy covers 64% of the district"],
    cloudy: ["☁ Cloudy · solar −60%", "BESS and wind fill the gap · no blackout"],
    windy: ["🌬 Windy · turbines 2.8 MW", "Surplus stored in BESS for the evening"],
  },
  th: {
    sunny: ["☀ แดดจัด · โซลาร์ 3.2 MW · ลม 0.4 MW", "พลังงานสะอาดจ่ายไฟให้ย่าน 64%"],
    cloudy: ["☁ ฟ้าครึ้ม · โซลาร์ลดลง 60%", "BESS และลมช่วยเติม · ไฟไม่ดับ"],
    windy: ["🌬 ลมแรง · กังหัน 2.8 MW", "ไฟส่วนเกินเก็บเข้า BESS ไว้ใช้ตอนเย็น"],
  },
};

// ---------------------------------------------------------------- 3 AMI

function AmiDemo() {
  const { language } = useLanguage();
  const th = TH(language);
  const read = udemo.use((s) => s.read);
  const outage = udemo.use((s) => s.outage);
  const [rp] = usePhase(read, [0, 2.6, 5], 8);
  const [op] = usePhase(outage, [0, 2.2, 4.6, 7.4], 10);
  const out = (i) => op >= 0 && op < 3 && i > 0; // the two houses on the failed transformer
  return (
    <group>
      <Pops points={METERS_FRONT} shown={() => 1} colors={(i) => (out(i) ? "#ff4d4d" : rp >= 1 ? "#51cf66" : "#5ee7ff")} size={0.3} dy={0.3} />
      {rp >= 0 && (
        <>
          {rp === 0 && <Packets from={METERS_FRONT.concat(METERS_BACK)} to={DCU} color="#5ee7ff" period={1.2} lift={1.5} />}
          {rp >= 1 && <Packets from={[DCU]} to={W(-5, 2, 8)} color="#5ee7ff" period={1.4} lift={4} />}
          <Rings at={DCU} radius={2.4} color="#5ee7ff" period={1} vertical />
          <Tag position={AMI_TAG}>
            <span className={rp === 2 ? cards.ok : undefined}>
              {
                [
                  th ? "📟 มิเตอร์ส่งค่าทุก 15 นาที ผ่าน RF mesh" : "📟 Every meter reports each 15 min over RF mesh",
                  th ? "📡 ตัวรวมข้อมูลส่งขึ้นระบบ MDMS" : "📡 The concentrator forwards to the MDMS",
                  th ? "✓ อ่านครบ 1,240 มิเตอร์ใน 40 วิ · ไม่ต้องจดมือ" : "✓ 1,240 meters read in 40 s · no meter readers",
                ][rp]
              }
            </span>
          </Tag>
        </>
      )}
      {op >= 0 && rp < 0 && (
        <>
          <Rings at={POLE_TX} radius={2.2} color={op < 3 ? "#ff4d4d" : "#51cf66"} period={0.8} />
          {op === 0 && <Packets from={METERS_FRONT.slice(1)} to={DCU} color="#ff4d4d" period={0.9} lift={1.5} />}
          {op >= 1 && op < 3 && <Packets from={[DCU]} to={W(-5, 2, 8)} color="#ff4d4d" period={1.1} lift={4} />}
          <Tag position={AMI_TAG}>
            <span className={op < 3 ? cards.warn : cards.ok}>
              {
                [
                  th ? "⚡ หม้อแปลงเสา TR-12 ดับ · มิเตอร์ส่ง 'last gasp'" : "⚡ Pole transformer TR-12 trips · meters send a 'last gasp'",
                  th ? "📍 ระบบชี้จุดเสียได้ใน 30 วิ · ลูกค้ายังไม่ต้องโทรแจ้ง" : "📍 Fault located in 30 s · before anyone calls",
                  th ? "🚐 ส่งทีมช่างไปที่เสา · แจ้งลูกค้าทาง SMS" : "🚐 Crew sent to the pole · customers told by SMS",
                  th ? "✓ ไฟกลับมาใน 25 นาที" : "✓ Power back in 25 min",
                ][op]
              }
            </span>
          </Tag>
        </>
      )}
      {rp < 0 && op < 0 && (
        <Tag position={AMI_TAG}>
          <span className={cards.small}>{th ? "🏠 บ้านละ 1 มิเตอร์อัจฉริยะ · สื่อสาร 2 ทาง" : "🏠 A smart meter on every home · two-way"}</span>
        </Tag>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- 4 microgrid

function MicrogridDemo({ materials }) {
  const { language } = useLanguage();
  const th = TH(language);
  const island = udemo.use((s) => s.island);
  const trade = udemo.use((s) => s.trade);
  const [ip] = usePhase(island, [0, 2.2, 4.6, 8], 11);
  const [tp] = usePhase(trade, [0, 2.8], 7);
  useTint(materials, () => (ip >= 0 && ip < 3 ? DUSK : null));
  return (
    <group>
      {ip >= 0 && (
        <>
          <Rings at={MGCTL} radius={2.6} color={["#ff4d4d", "#ffd43b", "#51cf66", "#51cf66"][ip]} period={0.9} />
          {ip >= 2 && <Packets from={[CBATT]} to={ROW1_DOORS[2]} color="#51cf66" period={1.2} lift={2} />}
          {ip >= 2 && ROW1_ROOFS.map((r, i) => <Packets key={i} from={[r]} to={ROW1_DOORS[i]} color="#ffd43b" period={1.3 + i * 0.2} lift={0.8} />)}
          <Pops points={ROW1_DOORS} shown={() => 1} colors={() => (ip === 0 ? "#495057" : "#51cf66")} size={0.2} dy={1.2} />
          <Tag position={MG_TAG}>
            <span className={ip === 0 ? cards.warn : ip === 3 ? cards.ok : undefined}>
              {
                [
                  th ? "⚡ ไฟจากระบบหลักดับ" : "⚡ The main grid goes down",
                  th ? "🔀 ไมโครกริดตัดแยกตัวเองใน 0.1 วิ" : "🔀 The microgrid islands itself in 0.1 s",
                  th ? "🔋 แบตชุมชน + โซลาร์หลังคา จ่ายไฟให้ทุกบ้าน" : "🔋 Community battery + rooftop PV power every home",
                  th ? "✓ ไม่มีบ้านไหนไฟดับ · ต่อกลับเมื่อระบบหลักมา" : "✓ No home went dark · reconnects when the grid is back",
                ][ip]
              }
            </span>
          </Tag>
        </>
      )}
      {tp >= 0 && ip < 0 && (
        <>
          <Packets from={[ROW1_ROOFS[0]]} to={ROW1_ROOFS[2]} color="#ffd43b" period={1.2} lift={3} />
          <Packets from={[ROW1_ROOFS[1]]} to={CBATT} color="#8ce99a" period={1.4} lift={2} />
          <Tag position={MG_TAG}>
            <span className={tp === 1 ? cards.ok : undefined}>
              {tp === 0 ? (th ? "💱 บ้าน A ขายไฟส่วนเกิน 3.2 kWh ให้บ้าน C" : "💱 House A sells 3.2 kWh of surplus to house C") : th ? "✓ ซื้อขายบนบล็อกเชน · ฿3.10/kWh ถูกกว่าการไฟฟ้า" : "✓ Settled on blockchain · ฿3.10/kWh, below the tariff"}
            </span>
          </Tag>
        </>
      )}
      {ip < 0 && tp < 0 && (
        <Tag position={MG_TAG}>
          <span className={cards.small}>{th ? "🏘 บ้านผลิตไฟเอง ใช้เอง แบ่งกันใช้" : "🏘 Homes that make, use and share their power"}</span>
        </Tag>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- 5 EV integration

const EVX = {
  en: {
    smart: ["⚡ Smart charging", "Cars charge when power is cheap and clean"],
    v2g: ["🔁 V2G · cars feed the building", "3 cars give 33 kW back at the evening peak"],
    solar: ["☀ Solar carport → cars", "The roof charges the cars directly"],
  },
  th: {
    smart: ["⚡ ชาร์จอัจฉริยะ", "ชาร์จตอนไฟถูกและสะอาด"],
    v2g: ["🔁 V2G · รถจ่ายไฟคืนอาคาร", "รถ 3 คันช่วยจ่าย 33 kW ช่วงพีคเย็น"],
    solar: ["☀ หลังคาโซลาร์ → รถ", "หลังคาชาร์จรถโดยตรง"],
  },
};

function EvDemo() {
  const { language } = useLanguage();
  const th = TH(language);
  const evmode = udemo.use((s) => s.evmode);
  const book = udemo.use((s) => s.book);
  const [bp] = usePhase(book, [0, 2.4], 7);
  const tx = (EVX[language] || EVX.en)[evmode];
  return (
    <group>
      <Pops points={CARS} shown={() => 1} colors={(i) => (evmode === "v2g" && [1, 3, 5].includes(i) ? "#51cf66" : i % 3 === 2 ? "#ffd43b" : "#5ee7ff")} size={0.16} dy={0.4} />
      {evmode === "smart" && CHARGERS.map((c, i) => <Packets key={i} from={[c]} to={CARS[[1, 2, 4, 5][i]]} color="#5ee7ff" period={1.4 + i * 0.2} lift={0.8} />)}
      {evmode === "v2g" && <Packets from={V2G} to={HALL_IN} color="#51cf66" period={1.3} lift={2} />}
      {evmode === "solar" && (
        <>
          <Rays at={CANOPY} radius={6} count={6} length={18} />
          <Packets from={[CANOPY]} to={CARS[3]} color="#ffd43b" period={1.2} lift={0.6} />
          <Packets from={[CANOPY]} to={CARS[1]} color="#ffd43b" period={1.5} lift={0.6} />
        </>
      )}
      {bp >= 0 && <Rings at={FREE_BAY} radius={2} color="#ffd43b" period={1} />}
      <Tag position={EV_TAG}>
        {bp >= 0 ? (
          <span className={bp === 1 ? cards.ok : undefined}>{bp === 0 ? (th ? "📱 จองที่ชาร์จผ่านแอป" : "📱 Booking a charger in the app") : th ? "✓ ช่อง C-3 จองแล้ว 18:00 · ชาร์จเต็ม 21:40" : "✓ Bay C-3 booked for 18:00 · full by 21:40"}</span>
        ) : (
          <>
            {tx[0]}
            <br />
            <span className={cards.small}>{tx[1]}</span>
          </>
        )}
      </Tag>
    </group>
  );
}

// ---------------------------------------------------------------- 6 energy storage

function StorageDemo() {
  const { language } = useLanguage();
  const th = TH(language);
  const mode = udemo.use((s) => s.bessmode);
  const freq = udemo.use((s) => s.freq);
  const thermal = udemo.use((s) => s.thermal);
  const [fp] = usePhase(freq, [0, 1.6, 4.4], 8);
  const [hp] = usePhase(thermal, [0, 2.4, 5], 8);
  const busy = fp >= 0 || hp >= 0;
  return (
    <group>
      <Pops points={BESS} shown={() => 1} colors={(i) => (hp >= 0 && hp < 2 && i === 2 ? "#ff4d4d" : mode === "discharge" || fp === 1 ? "#ffd43b" : "#51cf66")} size={0.24} dy={0.5} />
      {!busy && mode === "charge" && <Packets from={[SUB_TX]} to={BESS[1]} color="#51cf66" period={1.4} lift={4} />}
      {!busy && mode === "charge" && <Packets from={[SUB_TX]} to={BESS[3]} color="#51cf66" period={1.7} lift={4} />}
      {!busy && mode === "discharge" && <Packets from={BESS} to={PCS[1]} color="#ffd43b" period={1.3} lift={2} />}
      {fp >= 0 && (
        <>
          <Rings at={BESS_FLOOR} radius={7} color={["#ff4d4d", "#ffd43b", "#51cf66"][fp]} period={0.8} />
          {fp === 1 && <Packets from={BESS} to={SUB_TX} color="#ffd43b" period={0.8} lift={4} />}
        </>
      )}
      {hp >= 0 && fp < 0 && (
        <>
          <Wire at={HOT_BESS} size={[2.8, 3.4, 12.6]} color={hp === 2 ? "#51cf66" : hp === 1 ? "#5ee7ff" : "#ff4d4d"} />
          {hp === 1 && <Rings at={lift(HOT_BESS, 3.6)} radius={2} color="#5ee7ff" period={0.8} />}
        </>
      )}
      <Tag position={BESS_TAG}>
        {fp >= 0 ? (
          <span className={fp === 0 ? cards.warn : fp === 2 ? cards.ok : undefined}>
            {[th ? "⚠ ความถี่ระบบตกเหลือ 49.7 Hz" : "⚠ Grid frequency drops to 49.7 Hz", th ? "⚡ BESS จ่าย 5 MW ภายใน 0.2 วิ" : "⚡ BESS injects 5 MW within 0.2 s", th ? "✓ กลับมา 50.00 Hz · ไม่มีไฟกระพริบ" : "✓ Back to 50.00 Hz · no flicker"][fp]}
          </span>
        ) : hp >= 0 ? (
          <span className={hp === 0 ? cards.warn : hp === 2 ? cards.ok : undefined}>
            {[th ? "🌡 BESS 3 เซลล์ร้อน 47 °C" : "🌡 A cell in BESS 3 reaches 47 °C", th ? "❄ แอร์เต็มกำลัง · ตัดสตริงนั้นออก" : "❄ HVAC to max · that string isolated", th ? "✓ 31 °C · กลับมาทำงาน" : "✓ 31 °C · back online"][hp]}
          </span>
        ) : (
          <>
            {mode === "charge" ? (th ? "🔋 ชาร์จช่วงไฟถูก · SOC 82%" : "🔋 Charging on cheap power · SOC 82%") : th ? "⚡ จ่ายไฟช่วงพีค · 2.5 MW" : "⚡ Discharging at the peak · 2.5 MW"}
            <br />
            <span className={cards.small}>{th ? "4 ตู้ · 10 MWh · Li-ion LFP" : "4 containers · 10 MWh · Li-ion LFP"}</span>
          </>
        )}
      </Tag>
    </group>
  );
}

// ---------------------------------------------------------------- district overlays (panel toggles)

const LINE = [W(-30, 28.2, 22), W(-30, 22.5, 11), W(-30, 12, 4.5), W(-25, 9.2, 0.5), W(-20, 9.2, 0.5), W(-20, -5, 0.5)];
const FEEDERS = [
  [W(-20, -5, 0.5), W(-34, -5, 0.5)],
  [W(-20, -5, 0.5), W(-5, -5, 0.5), W(-5, -9.8, 3.4)],
  [W(-20, 8, 0.5), W(-15.4, 8, 0.5)],
  [W(-5, -5, 0.5), W(12, -5, 0.5), W(15.2, -5.5, 9.2), W(41.6, -5.5, 9.2)],
];

function PowerFlow() {
  return (
    <group>
      <Flow points={LINE} color="#ffd43b" radius={0.12} speed={2.4} dash={1.6} />
      {FEEDERS.map((f, i) => (
        <Flow key={i} points={f} color="#51cf66" radius={0.1} speed={2} dash={1.4} />
      ))}
      <Flow points={[INVERTER, W(25.6, 22.6, 0.5), W(12, 8, 0.5), W(-20, 8, 0.5)]} color="#8ce99a" radius={0.1} speed={2} dash={1.4} />
    </group>
  );
}

function MeterNet() {
  const pts = METERS_FRONT.concat(METERS_BACK);
  return (
    <group>
      <Pops points={pts} shown={() => 1} colors={() => "#5ee7ff"} size={0.2} dy={0.3} />
      <Packets from={pts} to={DCU} color="#5ee7ff" period={1.6} lift={2} />
      <Rings at={DCU} radius={3} color="#5ee7ff" period={1.4} vertical />
    </group>
  );
}

// ---------------------------------------------------------------- dock (HTML, outside the canvas)

const DT = {
  en: {
    try: "Try it", title: "District systems", power: "⚡ Power flow", meters: "📟 Smart meters", hint: "Click a zone · pick a topic below",
    peak: "🔥 Evening peak (DR event)", optimise: "🧠 AI optimisation",
    ems: [["Peak load", "−12%", 0.88, "#51cf66"], ["Sites in DR", "1,240", 0.8, "#4dabf7"], ["Energy cost", "−18%", 0.82, "#ffd43b"], ["CO₂", "−420 t/yr", 0.7, "#b197fc"]],
    weather: "Weather", weathers: { sunny: "Sunny", cloudy: "Cloudy", windy: "Windy" }, forecast: "📈 Forecast tomorrow",
    ren: [["Renewable share", "64%", 0.64, "#51cf66"], ["Solar farm", "4.5 MWp", 0.75, "#ffd43b"], ["Wind", "2 × 1.5 MW", 0.5, "#4dabf7"], ["Forecast accuracy", "95%", 0.95, "#b197fc"]],
    read: "📟 Read all meters", outage: "⚠ Outage on the lane",
    ami: [["Meters online", "99.8%", 0.998, "#51cf66"], ["Read interval", "15 min", 0.9, "#4dabf7"], ["Outage found in", "30 s", 0.92, "#ffd43b"], ["Manual reads", "0", 1, "#b197fc"]],
    island: "🔌 Grid outage → island", trade: "💱 P2P energy trade",
    mg: [["Self-supply", "72%", 0.72, "#51cf66"], ["Island switch", "0.1 s", 0.95, "#4dabf7"], ["Community battery", "500 kWh", 0.6, "#ffd43b"], ["P2P trades", "86 / day", 0.5, "#b197fc"]],
    evmode: "Mode", evmodes: { smart: "Smart", v2g: "V2G", solar: "Solar" }, book: "📱 Book a charger",
    ev: [["Chargers", "4 DC + V2G", 0.8, "#51cf66"], ["Off-peak charging", "84%", 0.84, "#4dabf7"], ["V2G back to grid", "33 kW", 0.4, "#ffd43b"], ["Solar share", "38%", 0.38, "#b197fc"]],
    bessmode: "Mode", bessmodes: { charge: "Charge", discharge: "Discharge" }, freq: "📉 Frequency dip", thermal: "🌡 Thermal alarm",
    bess: [["State of charge", "82%", 0.82, "#51cf66"], ["Capacity", "10 MWh", 1, "#4dabf7"], ["Response", "0.2 s", 0.95, "#ffd43b"], ["Round-trip", "91%", 0.91, "#b197fc"]],
  },
  th: {
    try: "ลองเล่น", title: "ระบบในย่าน", power: "⚡ การไหลของไฟ", meters: "📟 มิเตอร์อัจฉริยะ", hint: "คลิกโซน · เลือกหัวข้อด้านล่าง",
    peak: "🔥 พีคตอนเย็น (DR)", optimise: "🧠 AI ปรับการใช้ไฟ",
    ems: [["โหลดพีค", "−12%", 0.88, "#51cf66"], ["จุดร่วม DR", "1,240", 0.8, "#4dabf7"], ["ค่าไฟ", "−18%", 0.82, "#ffd43b"], ["CO₂", "−420 ตัน/ปี", 0.7, "#b197fc"]],
    weather: "สภาพอากาศ", weathers: { sunny: "แดดจัด", cloudy: "ฟ้าครึ้ม", windy: "ลมแรง" }, forecast: "📈 พยากรณ์พรุ่งนี้",
    ren: [["สัดส่วนพลังงานหมุนเวียน", "64%", 0.64, "#51cf66"], ["ฟาร์มโซลาร์", "4.5 MWp", 0.75, "#ffd43b"], ["ลม", "2 × 1.5 MW", 0.5, "#4dabf7"], ["ความแม่นพยากรณ์", "95%", 0.95, "#b197fc"]],
    read: "📟 อ่านมิเตอร์ทั้งหมด", outage: "⚠ ไฟดับในซอย",
    ami: [["มิเตอร์ออนไลน์", "99.8%", 0.998, "#51cf66"], ["รอบการอ่าน", "15 นาที", 0.9, "#4dabf7"], ["หาจุดดับได้ใน", "30 วิ", 0.92, "#ffd43b"], ["จดมิเตอร์มือ", "0", 1, "#b197fc"]],
    island: "🔌 ไฟหลักดับ → แยกโหมด", trade: "💱 ซื้อขายไฟ P2P",
    mg: [["ผลิตใช้เอง", "72%", 0.72, "#51cf66"], ["สลับโหมด", "0.1 วิ", 0.95, "#4dabf7"], ["แบตชุมชน", "500 kWh", 0.6, "#ffd43b"], ["ซื้อขาย P2P", "86 ครั้ง/วัน", 0.5, "#b197fc"]],
    evmode: "โหมด", evmodes: { smart: "อัจฉริยะ", v2g: "V2G", solar: "โซลาร์" }, book: "📱 จองที่ชาร์จ",
    ev: [["ที่ชาร์จ", "4 DC + V2G", 0.8, "#51cf66"], ["ชาร์จช่วงไฟถูก", "84%", 0.84, "#4dabf7"], ["V2G คืนระบบ", "33 kW", 0.4, "#ffd43b"], ["สัดส่วนโซลาร์", "38%", 0.38, "#b197fc"]],
    bessmode: "โหมด", bessmodes: { charge: "ชาร์จ", discharge: "จ่ายไฟ" }, freq: "📉 ความถี่ตก", thermal: "🌡 แจ้งเตือนความร้อน",
    bess: [["ระดับประจุ", "82%", 0.82, "#51cf66"], ["ความจุ", "10 MWh", 1, "#4dabf7"], ["ตอบสนอง", "0.2 วิ", 0.95, "#ffd43b"], ["ประสิทธิภาพ", "91%", 0.91, "#b197fc"]],
  },
};

const btn = (cls, label, patch) => (
  <button type="button" className={cls} onClick={() => udemo.set(patch())}>
    {label}
  </button>
);

const DOCK = {
  "dr-ems": ({ t }) => (
    <>
      <div className={dock.grid}>
        {btn(dock.danger, t.peak, () => ({ peak: now() }))}
        {btn(dock.primary, t.optimise, () => ({ optimise: now() }))}
      </div>
      <Bars rows={t.ems} />
    </>
  ),
  "renewable-energy": ({ t, s }) => (
    <>
      <div className={dock.label}>{t.weather}</div>
      <Seg items={t.weathers} value={s.weather} onPick={(k) => udemo.set({ weather: k })} danger="cloudy" />
      {btn(dock.primary, t.forecast, () => ({ forecast: now() }))}
      <Bars rows={t.ren} />
    </>
  ),
  ami: ({ t }) => (
    <>
      <div className={dock.grid}>
        {btn(dock.primary, t.read, () => ({ read: now() }))}
        {btn(dock.danger, t.outage, () => ({ outage: now() }))}
      </div>
      <Bars rows={t.ami} />
    </>
  ),
  microgrid: ({ t }) => (
    <>
      <div className={dock.grid}>
        {btn(dock.danger, t.island, () => ({ island: now() }))}
        {btn(dock.primary, t.trade, () => ({ trade: now() }))}
      </div>
      <Bars rows={t.mg} />
    </>
  ),
  "ev-integration": ({ t, s }) => (
    <>
      <div className={dock.label}>{t.evmode}</div>
      <Seg items={t.evmodes} value={s.evmode} onPick={(k) => udemo.set({ evmode: k })} />
      {btn(dock.primary, t.book, () => ({ book: now() }))}
      <Bars rows={t.ev} />
    </>
  ),
  "energy-storage": ({ t, s }) => (
    <>
      <div className={dock.label}>{t.bessmode}</div>
      <Seg items={t.bessmodes} value={s.bessmode} onPick={(k) => udemo.set({ bessmode: k })} />
      <div className={dock.grid}>
        {btn(dock.danger, t.freq, () => ({ freq: now() }))}
        {btn(dock.danger, t.thermal, () => ({ thermal: now() }))}
      </div>
      <Bars rows={t.bess} />
    </>
  ),
};

export function UtilityPanel({ hidden, activeId }) {
  const { language } = useLanguage();
  const t = DT[language] || DT.en;
  const s = udemo.use();
  const sys = usys.use();
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
        <button type="button" className={sys.power ? panel.onEnergy : panel.btn} aria-pressed={sys.power} onClick={() => usys.set({ power: !sys.power })}>
          {t.power}
        </button>
        <button type="button" className={sys.meters ? panel.onHvac : panel.btn} aria-pressed={sys.meters} onClick={() => usys.set({ meters: !sys.meters })}>
          {t.meters}
        </button>
      </div>
      <p className={panel.hint}>{t.hint}</p>
    </div>
  );
}

// ---------------------------------------------------------------- reactions router (BakedModel's `reactions`)

export function UtilityReactions({ active, materials, anim }) {
  const sys = usys.use();
  return (
    <>
      {sys.power && <PowerFlow />}
      {sys.meters && <MeterNet />}
      {active === "dr-ems" && <EmsDemo materials={materials} />}
      {active === "renewable-energy" && <RenewableDemo materials={materials} anim={anim} />}
      {active === "ami" && <AmiDemo />}
      {active === "microgrid" && <MicrogridDemo materials={materials} />}
      {active === "ev-integration" && <EvDemo />}
      {active === "energy-storage" && <StorageDemo />}
    </>
  );
}
