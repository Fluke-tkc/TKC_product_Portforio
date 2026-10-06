// "Try it" demos of the 10 TKC Cloud Nexus campus, one per infographic (CS_1 ... CS_7), drawn over the baked model:
// 1 data centre (normal / peak load with auto-scaling, a server failure and failover, the cooling airflow), 2 big data
// (an ETL run from every building into the lake, the silo and the chart terrace; stream or batch), 3 AI services
// (vision / NLP / RPA, training a model on the GPU ring, asking the AI from every building), 4 security & compliance
// (a login from an unknown device, a compliance audit, encrypted links), 5 ERP (an order from the street to the
// truck; finance / supply / HR), 6 contact centre (a rush of customers met by the chatbot and the agents; channels),
// 7 blockchain (a transaction validated by the nodes and chained, a smart contract).
// Also the campus overlays (users worldwide, data spokes), the panel and the reactions router used by SmartCloud.jsx.
// Coordinates from smart_cloud.py (Blender x, y, z -> three.js x, z, -y).
import { useLanguage } from "../../../contexts/LanguageContext";
import { Flow } from "../flow";
import { Packets, Rings, Tag } from "../reactions";
import dock from "./buildingDemos.module.css";
import cards from "./buildingDemos2.module.css";
import panel from "./buildingSystems.module.css";
import { Bars, Pops, Seg, TH, Wire, now, usePhase } from "./demoKit";
import { qdemo, qsys } from "./cloudStore";

const W = (x, y, z) => [x, z, -y];
const lift = (p, dy) => [p[0], p[1] + dy, p[2]];
const DECK = 7.76;

// ---------------------------------------------------------------- places on the campus

const SPHERE = W(0, 4, 32.5);
const SILO_TOP = W(38, 8, 25);
const DC_ROOF = W(-32, 6, 7.8);
const BD_ROOF = W(27, 4, 12);
const CC_TOP = W(0, 28, 12);
const ERP_MID = W(31, 25, 18);
const SEC_ROOF = W(-34, -14, 4.8);
const CHAIN_HOLO = W(34, -14, 8.6);

// data centre: one row of each aisle (x along the hall), the rack that fails, the aisle it fails over to
const RACK_X = [0, 3, 6, 9, 12, 15, 18, 21].map((i) => -41 + 0.66 * (i + 0.5));
const AISLES = [0.2, 5.4, 10.6];
const RACK_TOPS = AISLES.flatMap((y) => RACK_X.map((x) => W(x, y - 1.15, 2.6)));
const FAIL = W(-34.07, 4.25, 0.3);
const FAILOVER = [-37.4, -34.1, -30.8].map((x) => W(x, 11.75, 2.6));
const AIRFLOW = AISLES.map((y) => [W(-41.5, y, 1.1), W(-26.4, y, 1.1)]);
const DC_TAG = W(-27, 3, 3.5); // over the aisles, below the title

const LAKE = W(31, -6.8, 0.6);
const SOURCES = [DC_ROOF, CC_TOP, ERP_MID, SEC_ROOF];
const BAR_TOPS = [10.36, 11.76, 13.16, 14.76, 16.76, 18.76].map((z, k) => W(22.625 + k * 1.75, 4.2, z));
const BD_TAG = W(35, -2, 9); // between the charts and the silo, clear of the dock

const SERVE = [CC_TOP, ERP_MID, SEC_ROOF, BD_ROOF];
const AI_TAG = W(8, 2, 20); // right of the tower, clear of the dock
const AI_RING = W(0, 4, 32.4);

const STREET = [W(-34, -27, 1.4), W(-22, -30, 1.4)];
const SEC_DOOR = W(-31, -15.2, 1.6);
const BOARD = [-37.2, -36.4, -35.6, -34.8, -34].map((x) => W(x, -11.3, 2.6));
const HUB_FOOT = W(-8, -2, 1.2);
const SEC_TAG = W(-27, -20, 3.2);

const ORDER_FROM = W(20, -27, 1.4);
const TRUCK = W(41.4, 23, 2.2);
const VAN = W(39, 16.5, 1.6);
const ERP_FLOOR = W(40, 19, 0.3);
const ERP_TAG = W(38, 19, 6); // over the warehouse yard, clear of the dock

// contact centre: agent desks on floors 1 and 2 of the crescent, the chatbot kiosk at its lobby
const DESKS = [3.96, 7.76].flatMap((z) =>
  [62, 70, 78, 86, 94, 102, 110, 118].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return W(23.6 * Math.cos(a), 4 + 23.6 * Math.sin(a), z + 1.3);
  })
);
const CALLERS = [W(-24, -10, 6), W(-8, -14, 6), W(10, -14, 6), W(24, -10, 6)];
const BOT = W(0, 26.6, 2.4);
const CC_TAG = W(5.2, 26, 9); // over the middle of the crescent floors, right of the pin and clear of the dock

const NODES = [0, 1, 2, 3, 4, 5].map((k) => W(32 + k * 0.68, -11.8, 2.6));
const WALLET = W(30, -15.4, 1.6);
const CHAIN_TAG = W(35.5, -19, 10.5); // right of the chained cubes, over the lab roof and clear of the dock

// ---------------------------------------------------------------- 1 data centre

function DataCenterDemo() {
  const { language } = useLanguage();
  const th = TH(language);
  const load = qdemo.use((s) => s.load);
  const fail = qdemo.use((s) => s.fail);
  const airflow = qdemo.use((s) => s.airflow);
  const [fp] = usePhase(fail, [0, 2.2, 4.8], 8);
  const peak = load === "peak";
  return (
    <group>
      <Pops points={RACK_TOPS} shown={() => 1} colors={(i) => (peak ? (i % 3 ? "#ffa94d" : "#ffd43b") : i % 4 ? "#51cf66" : "#5ee7ff")} size={0.16} dy={0.2} />
      {airflow && AIRFLOW.map((pts, i) => <Flow key={i} points={pts} color="#74c0fc" radius={0.12} speed={2.2} dash={1.2} />)}
      {fp >= 0 && (
        <>
          <Wire at={FAIL} size={[0.9, 2.5, 1.3]} color={fp === 2 ? "#51cf66" : "#ff4d4d"} />
          {fp === 1 && FAILOVER.map((p, i) => <Packets key={i} from={[lift(FAIL, 2.4)]} to={p} color="#ffd43b" period={0.9 + i * 0.2} lift={2} />)}
        </>
      )}
      <Tag position={DC_TAG}>
        {fp >= 0 ? (
          <span className={fp === 0 ? cards.warn : fp === 2 ? cards.ok : undefined}>
            {
              [
                th ? "💥 เซิร์ฟเวอร์ B-14 ดิสก์เสีย" : "💥 Server B-14 loses a disk",
                th ? "🔀 ย้าย VM อัตโนมัติไปแถว C" : "🔀 VMs fail over to aisle C automatically",
                th ? "✓ ระบบลูกค้าไม่สะดุด · เปิดใบงานเปลี่ยนดิสก์" : "✓ No customer noticed · disk swap ticket opened",
              ][fp]
            }
          </span>
        ) : peak ? (
          <>
            {th ? "📈 โหลดพีค 92% · ขยายเพิ่ม 40 VM อัตโนมัติ" : "📈 Peak load 92% · auto-scaled +40 VMs"}
            <br />
            <span className={cards.small}>{th ? "จ่ายตามใช้จริง · ลดลงเองเมื่อโหลดลด" : "Pay per use · scales back down by itself"}</span>
          </>
        ) : (
          <>
            {th ? "🗄 1,284 เซิร์ฟเวอร์ · Tier III · uptime 99.98%" : "🗄 1,284 servers · Tier III · 99.98% uptime"}
            <br />
            <span className={cards.small}>{th ? "สำรองข้อมูล DRaaS ไปไซต์ที่สอง" : "DRaaS replicates to a second site"}</span>
          </>
        )}
      </Tag>
    </group>
  );
}

// ---------------------------------------------------------------- 2 big data

function BigDataDemo() {
  const { language } = useLanguage();
  const th = TH(language);
  const etl = qdemo.use((s) => s.etl);
  const proc = qdemo.use((s) => s.proc);
  const [ep] = usePhase(etl, [0, 2.6, 5, 7.6], 11);
  const stream = proc === "stream";
  return (
    <group>
      <Flow points={[LAKE, W(36, -4, 0.6), W(38, 4.6, 0.6)]} color="#5ee7ff" radius={0.1} speed={stream ? 3 : 0.8} dash={stream ? 0.8 : 2.6} />
      {ep >= 0 && (
        <>
          {ep === 0 && <Packets from={SOURCES} to={LAKE} color="#5ee7ff" period={1.3} lift={6} />}
          {ep === 1 && <Packets from={[LAKE]} to={SILO_TOP} color="#74c0fc" period={1.1} lift={3} />}
          {ep >= 2 && <Packets from={[SILO_TOP]} to={BAR_TOPS[5]} color="#b197fc" period={1.2} lift={2} />}
          <Pops points={BAR_TOPS} shown={(i) => (ep >= 3 ? 1.4 : ep === 2 ? (i % 2 ? 1 : 0.5) : 0)} colors={() => "#ffd43b"} size={0.25} dy={0.4} />
          <Tag position={BD_TAG}>
            <span className={ep === 3 ? cards.ok : undefined}>
              {
                [
                  th ? "📥 ดึงข้อมูลจากทุกระบบ: ศูนย์ข้อมูล คอลเซ็นเตอร์ ERP ความปลอดภัย" : "📥 Extract from every system: DC, contact centre, ERP, security",
                  th ? "🧹 แปลง + ล้างข้อมูล · เก็บลง Data Lake 4.2 PB" : "🧹 Transform + clean · load into the 4.2 PB data lake",
                  th ? "⚙ วิเคราะห์ด้วย Spark บนคลาวด์" : "⚙ Analysed with Spark on the cloud",
                  th ? "✓ อินไซต์: ยอดขายภาคเหนือ +23% · แดชบอร์ดอัปเดต" : "✓ Insight: northern sales +23% · dashboards updated",
                ][ep]
              }
            </span>
          </Tag>
        </>
      )}
      {ep < 0 && (
        <Tag position={BD_TAG}>
          {stream ? (th ? "⚡ สตรีมมิ่ง · ข้อมูลเข้า 120,000 รายการ/วิ" : "⚡ Streaming · 120,000 events/s") : th ? "🗂 ประมวลผลแบบชุดทุกคืน 02:00" : "🗂 Batch jobs every night at 02:00"}
          <br />
          <span className={cards.small}>{th ? "กำกับข้อมูล · เข้ารหัส · ตาม PDPA" : "Governed · encrypted · PDPA compliant"}</span>
        </Tag>
      )}
    </group>
  );
}

// ---------------------------------------------------------------- 3 AI services

const AX = {
  en: {
    vision: ["👁 Computer vision · OCR", "Reads 3,000 invoices an hour · spots defects"],
    nlp: ["💬 NLP · speech to text", "Understands Thai and English · sentiment"],
    rpa: ["🤖 RPA + AI chatbots", "Bots run 40 back-office tasks around the clock"],
  },
  th: {
    vision: ["👁 Computer vision · OCR", "อ่านใบแจ้งหนี้ 3,000 ใบ/ชม. · ตรวจหาตำหนิ"],
    nlp: ["💬 NLP · แปลงเสียงเป็นข้อความ", "เข้าใจไทยและอังกฤษ · วิเคราะห์อารมณ์"],
    rpa: ["🤖 RPA + แชตบอต AI", "บอททำงานหลังบ้าน 40 อย่างตลอด 24 ชม."],
  },
};

function AiDemo() {
  const { language } = useLanguage();
  const th = TH(language);
  const service = qdemo.use((s) => s.service);
  const train = qdemo.use((s) => s.train);
  const ask = qdemo.use((s) => s.ask);
  const [tp] = usePhase(train, [0, 2.6, 5.6], 9);
  const [ap] = usePhase(ask, [0, 2.4], 7);
  const color = { vision: "#5ee7ff", nlp: "#e599f7", rpa: "#ffd43b" }[service];
  const tx = (AX[language] || AX.en)[service];
  return (
    <group>
      <Rings at={AI_RING} radius={11} color={tp >= 0 ? "#b197fc" : color} period={tp >= 0 ? 0.9 : 2} />
      {tp >= 0 && tp < 2 && <Packets from={[SILO_TOP, DC_ROOF, BD_ROOF]} to={SPHERE} color="#b197fc" period={1.1} lift={5} />}
      {ap === 0 && <Packets from={SERVE} to={SPHERE} color={color} period={1.2} lift={5} />}
      {ap === 1 && SERVE.map((p, i) => <Packets key={i} from={[SPHERE]} to={p} color="#51cf66" period={1.2 + i * 0.15} lift={5} />)}
      <Tag position={AI_TAG}>
        {tp >= 0 ? (
          <span className={tp === 2 ? cards.ok : undefined}>
            {[th ? "🧠 เทรนโมเดลบน GPU 16 ตัว" : "🧠 Training on 16 GPUs", th ? "📊 Epoch 8/10 · ความแม่นยำ 96.1%" : "📊 Epoch 8/10 · accuracy 96.1%", th ? "✓ โมเดลใหม่ 97.4% · ขึ้นใช้งานผ่าน API" : "✓ New model 97.4% · live behind the API"][tp]}
          </span>
        ) : ap >= 0 ? (
          <span className={ap === 1 ? cards.ok : undefined}>{ap === 0 ? (th ? "❓ ทุกอาคารส่งคำถามมาที่ AI" : "❓ Every building asks the AI") : th ? "✓ ตอบใน 0.4 วิ · 2.1 ล้านคำขอ/วัน" : "✓ Answers in 0.4 s · 2.1 M requests a day"}</span>
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

// ---------------------------------------------------------------- 4 security & compliance

function SecurityDemo() {
  const { language } = useLanguage();
  const th = TH(language);
  const login = qdemo.use((s) => s.login);
  const audit = qdemo.use((s) => s.audit);
  const encrypt = qdemo.use((s) => s.encrypt);
  const [lp] = usePhase(login, [0, 2.2, 4.6], 8);
  const [ap] = usePhase(audit, [0, 3.2], 8);
  return (
    <group>
      {encrypt && <Flow points={[W(-31, -14, 1.2), W(-20, -8, 1.2), HUB_FOOT]} color="#51cf66" radius={0.12} speed={2} dash={1.2} />}
      {lp >= 0 && (
        <>
          {lp === 0 && <Packets from={STREET} to={SEC_DOOR} color="#ff4d4d" period={1} lift={3} />}
          <Rings at={lift(SEC_DOOR, -1.4)} radius={3} color={["#ff4d4d", "#ffd43b", "#51cf66"][lp]} period={0.8} />
        </>
      )}
      {ap >= 0 && <Pops points={BOARD} shown={(i) => (ap === 1 ? 1 : i % 2)} colors={() => "#51cf66"} size={0.16} dy={0.4} />}
      <Tag position={SEC_TAG}>
        {lp >= 0 ? (
          <span className={lp === 0 ? cards.warn : lp === 2 ? cards.ok : undefined}>
            {[th ? "🌍 ล็อกอินจากเครื่องที่ไม่รู้จัก · ต่างประเทศ" : "🌍 Login from an unknown device abroad", th ? "🔐 ขอ MFA + ตรวจพฤติกรรม → ไม่ผ่าน" : "🔐 MFA + behaviour check → failed", th ? "✓ บล็อก · ล็อกบัญชี · ส่งเตือน SIEM" : "✓ Blocked · account locked · SIEM alerted"][lp]}
          </span>
        ) : ap >= 0 ? (
          <span className={ap === 1 ? cards.ok : undefined}>{ap === 0 ? (th ? "📋 ตรวจ ISO 27001 · PDPA · SOC 2 อัตโนมัติ" : "📋 Automated ISO 27001 · PDPA · SOC 2 checks") : th ? "✓ ผ่าน 142/142 ข้อ · รายงานพร้อมส่งผู้ตรวจ" : "✓ 142/142 controls pass · report ready for the auditor"}</span>
        ) : (
          <>
            {th ? "🛡 เข้ารหัสทุกข้อมูล · IAM · ตรวจจับการบุกรุก" : "🛡 Encryption · IAM · intrusion detection"}
            <br />
            <span className={cards.small}>{encrypt ? (th ? "🔒 ทุกลิงก์เข้ารหัส TLS 1.3" : "🔒 Every link on TLS 1.3") : th ? "ศูนย์เฝ้าระวัง 24/7" : "Monitored 24/7"}</span>
          </>
        )}
      </Tag>
    </group>
  );
}

// ---------------------------------------------------------------- 5 ERP

const EX = {
  en: { finance: ["💰 Finance", "Ledger, budgets and invoices close daily"], supply: ["📦 Supply chain", "Stock, purchasing and delivery in one view"], hr: ["👥 HR", "Payroll and leave for 1,200 staff"] },
  th: { finance: ["💰 การเงิน", "บัญชี งบประมาณ ใบแจ้งหนี้ ปิดรายวัน"], supply: ["📦 ซัพพลายเชน", "สต็อก จัดซื้อ และจัดส่งในจอเดียว"], hr: ["👥 บุคคล", "เงินเดือนและวันลาพนักงาน 1,200 คน"] },
};

function ErpDemo() {
  const { language } = useLanguage();
  const th = TH(language);
  const mod = qdemo.use((s) => s.module);
  const order = qdemo.use((s) => s.order);
  const [op] = usePhase(order, [0, 2.2, 4.4, 6.8], 10);
  const tx = (EX[language] || EX.en)[mod];
  return (
    <group>
      {op >= 0 && (
        <>
          {op === 0 && <Packets from={[ORDER_FROM]} to={ERP_MID} color="#5ee7ff" period={1.1} lift={6} />}
          {op === 1 && <Packets from={[ERP_MID]} to={VAN} color="#ffd43b" period={1.1} lift={3} />}
          {op >= 2 && <Rings at={ERP_FLOOR} radius={4} color={op === 3 ? "#51cf66" : "#ffd43b"} period={1} />}
          {op >= 2 && <Pops points={[TRUCK, VAN]} shown={() => 1} colors={() => "#51cf66"} size={0.3} dy={2} />}
        </>
      )}
      <Tag position={ERP_TAG}>
        {op >= 0 ? (
          <span className={op === 3 ? cards.ok : undefined}>
            {
              [
                th ? "🛒 คำสั่งซื้อใหม่ #8842 จากหน้าร้านออนไลน์" : "🛒 New order #8842 from the web shop",
                th ? "📦 ERP ตัดสต็อก · เช็กเครดิตลูกค้า" : "📦 ERP reserves stock · checks the customer's credit",
                th ? "🚚 สั่งจัดส่ง · รถออกจากคลัง" : "🚚 Delivery booked · the truck leaves",
                th ? "✓ ออกใบกำกับภาษีอัตโนมัติ · บัญชีอัปเดต" : "✓ Tax invoice issued · ledger updated",
              ][op]
            }
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

// ---------------------------------------------------------------- 6 contact centre

const CX = {
  en: { voice: "📞 Voice · AI transcribes every call", chat: "💬 Web chat · the bot answers first", line: "🟢 LINE OA · orders and tracking", email: "✉ Email · auto-sorted by topic" },
  th: { voice: "📞 โทรศัพท์ · AI ถอดเสียงทุกสาย", chat: "💬 แชตเว็บ · บอทตอบก่อน", line: "🟢 LINE OA · สั่งซื้อและติดตาม", email: "✉ อีเมล · คัดแยกหัวข้ออัตโนมัติ" },
};

function ContactDemo() {
  const { language } = useLanguage();
  const th = TH(language);
  const channel = qdemo.use((s) => s.channel);
  const rush = qdemo.use((s) => s.rush);
  const [rp] = usePhase(rush, [0, 2.4, 5], 8);
  const busy = (i) => rp >= 1 && i % 3 !== 1;
  return (
    <group>
      <Pops points={DESKS} shown={() => 1} colors={(i) => (busy(i) ? "#ffd43b" : "#51cf66")} size={0.14} dy={0.3} />
      {rp === 0 && <Packets from={CALLERS} to={BOT} color="#5ee7ff" period={0.9} lift={5} />}
      {rp === 1 && <Packets from={[BOT]} to={DESKS[4]} color="#ffd43b" period={1} lift={2} />}
      {rp === 1 && <Packets from={[BOT]} to={DESKS[11]} color="#ffd43b" period={1.2} lift={3} />}
      <Rings at={W(0, 26.6, 0.3)} radius={3} color={rp >= 0 ? "#ffd43b" : "#5ee7ff"} period={1.2} />
      <Tag position={CC_TAG}>
        {rp >= 0 ? (
          <span className={rp === 2 ? cards.ok : undefined}>
            {
              [
                th ? "📈 ลูกค้าติดต่อเข้ามา 320 ราย/นาที" : "📈 320 customers a minute get in touch",
                th ? "🤖 บอทตอบเอง 78% · ส่งต่อพนักงาน 22%" : "🤖 The bot solves 78% · 22% go to agents",
                th ? "✓ รอสายเฉลี่ย 18 วิ · CSAT 4.8/5" : "✓ Average wait 18 s · CSAT 4.8/5",
              ][rp]
            }
          </span>
        ) : (
          <>
            {(CX[language] || CX.en)[channel]}
            <br />
            <span className={cards.small}>{th ? "ทุกช่องทางในหน้าจอเดียว · 24/7" : "Every channel on one screen · 24/7"}</span>
          </>
        )}
      </Tag>
    </group>
  );
}

// ---------------------------------------------------------------- 7 blockchain

function ChainDemo() {
  const { language } = useLanguage();
  const th = TH(language);
  const tx = qdemo.use((s) => s.tx);
  const contract = qdemo.use((s) => s.contract);
  const [tp] = usePhase(tx, [0, 2, 4.4, 6.6], 9);
  const [cp] = usePhase(contract, [0, 2.8], 7);
  return (
    <group>
      <Pops points={NODES} shown={() => 1} colors={() => (tp === 1 || tp === 2 ? "#51cf66" : "#e599f7")} size={0.16} dy={0.25} />
      {tp === 0 && NODES.map((n, i) => <Packets key={i} from={[WALLET]} to={n} color="#e599f7" period={0.9 + i * 0.1} lift={1.5} />)}
      {tp === 2 && <Packets from={NODES} to={CHAIN_HOLO} color="#51cf66" period={1} lift={2} />}
      {(tp >= 2 || cp >= 0) && <Rings at={CHAIN_HOLO} radius={4} color={cp >= 0 ? "#ffd43b" : "#51cf66"} period={1} />}
      <Tag position={CHAIN_TAG}>
        {tp >= 0 ? (
          <span className={tp === 3 ? cards.ok : undefined}>
            {
              [
                th ? "💸 โอน 50,000 บาท · กระจายไปทุกโหนด" : "💸 A ฿50,000 transfer is broadcast to every node",
                th ? "✅ โหนดตรวจสอบลายเซ็นและยอดเงิน" : "✅ The nodes check the signature and the balance",
                th ? "⛓ เพิ่มเป็นบล็อก #4812 · ต่อท้ายเชน" : "⛓ Added as block #4812 · chained to the last",
                th ? "✓ ยืนยันใน 2 วิ · แก้ไขย้อนหลังไม่ได้" : "✓ Final in 2 s · can't be altered afterwards",
              ][tp]
            }
          </span>
        ) : cp >= 0 ? (
          <span className={cp === 1 ? cards.ok : undefined}>{cp === 0 ? (th ? "📜 สัญญาอัจฉริยะ: จ่ายเงินเมื่อสินค้าถึง" : "📜 Smart contract: pay when the goods arrive") : th ? "✓ GPS ยืนยันส่งถึง → จ่ายเงินอัตโนมัติ" : "✓ GPS confirms delivery → payment released"}</span>
        ) : (
          <>
            {th ? "⛓ บล็อกเชน · Smart contract · DeFi" : "⛓ Blockchain · smart contracts · DeFi"}
            <br />
            <span className={cards.small}>{th ? "6 โหนดในคลาวด์ · ข้อมูลโปร่งใสตรวจสอบได้" : "6 nodes on the cloud · transparent and auditable"}</span>
          </>
        )}
      </Tag>
    </group>
  );
}

// ---------------------------------------------------------------- campus overlays (panel toggles)

const EDGES = [W(-46, -34, 30), W(-46, 30, 34), W(0, 36, 40), W(46, 30, 34), W(46, -34, 30), W(0, -38, 28)];
const SPOKES = [
  [W(-17.4, 4, DECK + 0.1), W(-22, 4, DECK + 0.1), W(-32, 6, 3)],
  [W(17.4, 4, DECK + 0.1), W(21, 4, DECK + 0.1), W(27, 4, DECK + 0.6)],
  [W(0, 21.4, DECK + 0.1), W(0, 26.2, DECK + 0.1), W(0, 26.6, 2)],
];

function Users() {
  return (
    <group>
      <Packets from={EDGES} to={SPHERE} color="#5ee7ff" period={1.6} lift={6} />
      <Rings at={AI_RING} radius={12} color="#5ee7ff" period={1.6} />
    </group>
  );
}

function Spokes() {
  return SPOKES.map((pts, i) => <Flow key={i} points={pts} color="#51cf66" radius={0.12} speed={2.4} dash={1.4} />);
}

// ---------------------------------------------------------------- dock (HTML, outside the canvas)

const DT = {
  en: {
    try: "Try it", title: "Cloud campus", users: "🌐 Users worldwide", spokes: "🔗 Data spokes", hint: "Click a building · pick a topic below",
    load: "Load", loads: { normal: "Normal", peak: "Peak" }, fail: "💥 Server failure", airOn: "Show cooling airflow", airOff: "Hide cooling airflow",
    dc: [["Uptime", "99.98%", 0.99, "#51cf66"], ["Servers", "1,284", 0.8, "#4dabf7"], ["PUE", "1.35", 0.75, "#ffd43b"], ["Backup RPO", "15 min", 0.85, "#b197fc"]],
    proc: "Processing", procs: { stream: "Stream", batch: "Batch" }, etl: "🔄 Run the ETL pipeline",
    bd: [["Data lake", "4.2 PB", 0.84, "#51cf66"], ["Sources", "38", 0.6, "#4dabf7"], ["Query time", "2.1 s", 0.9, "#ffd43b"], ["Cost vs on-prem", "−45%", 0.55, "#b197fc"]],
    service: "Service", services: { vision: "Vision", nlp: "NLP", rpa: "RPA" }, train: "🧠 Train a model", ask: "❓ Ask the AI",
    ai: [["Models live", "24", 0.6, "#51cf66"], ["Requests", "2.1 M/day", 0.8, "#4dabf7"], ["GPUs", "16", 0.5, "#ffd43b"], ["Accuracy", "97.4%", 0.97, "#b197fc"]],
    login: "🌍 Unknown login", audit: "📋 Compliance audit", encOn: "Encrypt every link", encOff: "Hide encrypted links",
    sec: [["Data encrypted", "100%", 1, "#51cf66"], ["Threats blocked", "8,400/day", 0.8, "#4dabf7"], ["Controls passed", "142/142", 1, "#ffd43b"], ["Certifications", "ISO · SOC 2", 0.7, "#b197fc"]],
    module: "Module", modules: { finance: "Finance", supply: "Supply", hr: "HR" }, order: "🛒 New customer order",
    erp: [["Orders today", "1,284", 0.8, "#51cf66"], ["Inventory accuracy", "99.6%", 0.99, "#4dabf7"], ["Month-end close", "2 days", 0.7, "#ffd43b"], ["Users", "1,200", 0.6, "#b197fc"]],
    channel: "Channel", channels: { voice: "Voice", chat: "Chat", line: "LINE", email: "Email" }, rush: "📈 Customer rush",
    cc: [["Bot resolution", "78%", 0.78, "#51cf66"], ["Average wait", "18 s", 0.9, "#4dabf7"], ["CSAT", "4.8 / 5", 0.96, "#ffd43b"], ["Agents online", "42", 0.6, "#b197fc"]],
    tx: "💸 New transaction", contract: "📜 Smart contract",
    bc: [["Nodes", "6", 0.6, "#51cf66"], ["Block time", "2 s", 0.9, "#4dabf7"], ["Transactions", "86,400/day", 0.7, "#ffd43b"], ["Tamper-proof", "100%", 1, "#b197fc"]],
  },
  th: {
    try: "ลองเล่น", title: "แคมปัสคลาวด์", users: "🌐 ผู้ใช้ทั่วโลก", spokes: "🔗 เส้นทางข้อมูล", hint: "คลิกอาคาร · เลือกหัวข้อด้านล่าง",
    load: "โหลด", loads: { normal: "ปกติ", peak: "พีค" }, fail: "💥 เซิร์ฟเวอร์เสีย", airOn: "แสดงลมเย็น", airOff: "ซ่อนลมเย็น",
    dc: [["ระบบพร้อมใช้", "99.98%", 0.99, "#51cf66"], ["เซิร์ฟเวอร์", "1,284", 0.8, "#4dabf7"], ["PUE", "1.35", 0.75, "#ffd43b"], ["สำรองข้อมูล", "ทุก 15 นาที", 0.85, "#b197fc"]],
    proc: "การประมวลผล", procs: { stream: "สตรีม", batch: "แบบชุด" }, etl: "🔄 รัน ETL",
    bd: [["Data lake", "4.2 PB", 0.84, "#51cf66"], ["แหล่งข้อมูล", "38", 0.6, "#4dabf7"], ["เวลาคิวรี", "2.1 วิ", 0.9, "#ffd43b"], ["ต้นทุนเทียบ on-prem", "−45%", 0.55, "#b197fc"]],
    service: "บริการ", services: { vision: "Vision", nlp: "NLP", rpa: "RPA" }, train: "🧠 เทรนโมเดล", ask: "❓ ถาม AI",
    ai: [["โมเดลที่ใช้งาน", "24", 0.6, "#51cf66"], ["คำขอ", "2.1 ล้าน/วัน", 0.8, "#4dabf7"], ["GPU", "16", 0.5, "#ffd43b"], ["ความแม่นยำ", "97.4%", 0.97, "#b197fc"]],
    login: "🌍 ล็อกอินแปลก", audit: "📋 ตรวจ compliance", encOn: "เข้ารหัสทุกลิงก์", encOff: "ซ่อนลิงก์เข้ารหัส",
    sec: [["ข้อมูลเข้ารหัส", "100%", 1, "#51cf66"], ["บล็อกภัย", "8,400/วัน", 0.8, "#4dabf7"], ["ผ่านข้อกำหนด", "142/142", 1, "#ffd43b"], ["มาตรฐาน", "ISO · SOC 2", 0.7, "#b197fc"]],
    module: "โมดูล", modules: { finance: "การเงิน", supply: "ซัพพลาย", hr: "บุคคล" }, order: "🛒 คำสั่งซื้อใหม่",
    erp: [["คำสั่งซื้อวันนี้", "1,284", 0.8, "#51cf66"], ["สต็อกแม่นยำ", "99.6%", 0.99, "#4dabf7"], ["ปิดงบสิ้นเดือน", "2 วัน", 0.7, "#ffd43b"], ["ผู้ใช้", "1,200", 0.6, "#b197fc"]],
    channel: "ช่องทาง", channels: { voice: "โทร", chat: "แชต", line: "LINE", email: "อีเมล" }, rush: "📈 ลูกค้าติดต่อเยอะ",
    cc: [["บอทตอบเอง", "78%", 0.78, "#51cf66"], ["รอเฉลี่ย", "18 วิ", 0.9, "#4dabf7"], ["ความพึงพอใจ", "4.8 / 5", 0.96, "#ffd43b"], ["พนักงานออนไลน์", "42", 0.6, "#b197fc"]],
    tx: "💸 ธุรกรรมใหม่", contract: "📜 สัญญาอัจฉริยะ",
    bc: [["โหนด", "6", 0.6, "#51cf66"], ["เวลาต่อบล็อก", "2 วิ", 0.9, "#4dabf7"], ["ธุรกรรม", "86,400/วัน", 0.7, "#ffd43b"], ["แก้ไขไม่ได้", "100%", 1, "#b197fc"]],
  },
};

const btn = (cls, label, patch) => (
  <button type="button" className={cls} onClick={() => qdemo.set(patch())}>
    {label}
  </button>
);

const DOCK = {
  "data-center": ({ t, s }) => (
    <>
      <div className={dock.label}>{t.load}</div>
      <Seg items={t.loads} value={s.load} onPick={(k) => qdemo.set({ load: k })} />
      <div className={dock.grid}>
        {btn(dock.danger, t.fail, () => ({ fail: now() }))}
        {btn(s.airflow ? dock.on : dock.btn, s.airflow ? t.airOff : t.airOn, () => ({ airflow: !s.airflow }))}
      </div>
      <Bars rows={t.dc} />
    </>
  ),
  "big-data": ({ t, s }) => (
    <>
      <div className={dock.label}>{t.proc}</div>
      <Seg items={t.procs} value={s.proc} onPick={(k) => qdemo.set({ proc: k })} />
      {btn(dock.primary, t.etl, () => ({ etl: now() }))}
      <Bars rows={t.bd} />
    </>
  ),
  "ai-services": ({ t, s }) => (
    <>
      <div className={dock.label}>{t.service}</div>
      <Seg items={t.services} value={s.service} onPick={(k) => qdemo.set({ service: k })} />
      <div className={dock.grid}>
        {btn(dock.primary, t.train, () => ({ train: now() }))}
        {btn(dock.primary, t.ask, () => ({ ask: now() }))}
      </div>
      <Bars rows={t.ai} />
    </>
  ),
  "security-compliance": ({ t, s }) => (
    <>
      <div className={dock.grid}>
        {btn(dock.danger, t.login, () => ({ login: now() }))}
        {btn(dock.primary, t.audit, () => ({ audit: now() }))}
      </div>
      {btn(s.encrypt ? dock.on : dock.btn, s.encrypt ? t.encOff : t.encOn, () => ({ encrypt: !s.encrypt }))}
      <Bars rows={t.sec} />
    </>
  ),
  erp: ({ t, s }) => (
    <>
      <div className={dock.label}>{t.module}</div>
      <Seg items={t.modules} value={s.module} onPick={(k) => qdemo.set({ module: k })} />
      {btn(dock.primary, t.order, () => ({ order: now() }))}
      <Bars rows={t.erp} />
    </>
  ),
  "call-center": ({ t, s }) => (
    <>
      <div className={dock.label}>{t.channel}</div>
      <Seg items={t.channels} value={s.channel} onPick={(k) => qdemo.set({ channel: k })} />
      {btn(dock.primary, t.rush, () => ({ rush: now() }))}
      <Bars rows={t.cc} />
    </>
  ),
  blockchain: ({ t }) => (
    <>
      <div className={dock.grid}>
        {btn(dock.primary, t.tx, () => ({ tx: now() }))}
        {btn(dock.primary, t.contract, () => ({ contract: now() }))}
      </div>
      <Bars rows={t.bc} />
    </>
  ),
};

export function CloudPanel({ hidden, activeId }) {
  const { language } = useLanguage();
  const t = DT[language] || DT.en;
  const s = qdemo.use();
  const sys = qsys.use();
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
        <button type="button" className={sys.users ? panel.onHvac : panel.btn} aria-pressed={sys.users} onClick={() => qsys.set({ users: !sys.users })}>
          {t.users}
        </button>
        <button type="button" className={sys.spokes ? panel.onEnergy : panel.btn} aria-pressed={sys.spokes} onClick={() => qsys.set({ spokes: !sys.spokes })}>
          {t.spokes}
        </button>
      </div>
      <p className={panel.hint}>{t.hint}</p>
    </div>
  );
}

// ---------------------------------------------------------------- reactions router (BakedModel's `reactions`)

export function CloudReactions({ active }) {
  const sys = qsys.use();
  return (
    <>
      {sys.users && <Users />}
      {sys.spokes && <Spokes />}
      {active === "data-center" && <DataCenterDemo />}
      {active === "big-data" && <BigDataDemo />}
      {active === "ai-services" && <AiDemo />}
      {active === "security-compliance" && <SecurityDemo />}
      {active === "erp" && <ErpDemo />}
      {active === "call-center" && <ContactDemo />}
      {active === "blockchain" && <ChainDemo />}
    </>
  );
}
