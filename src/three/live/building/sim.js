// Smart Building simulation: time of day + operating mode -> what the building does and what it costs.
// Pure functions, shared by the 3D scene (visuals) and the control panel (numbers, explanation).

export const SOLAR_KWP = 180;
export const BAYS = 16;
export const MODES = ["comfort", "eco", "away"];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// 0 before sunrise / after sunset, 1 at solar noon (Bangkok: about 06:15 - 18:15)
export function sunHeight(hour) {
  return Math.max(0, Math.sin((Math.PI * (hour - 6.25)) / 12));
}

// share of desks in use over a working day
function schedule(hour) {
  const arrive = smooth(7, 9.2, hour);
  const leave = 1 - smooth(17.2, 19.5, hour);
  const lunch = 1 - 0.25 * Math.exp(-((hour - 12.3) ** 2) / 0.35);
  return clamp(arrive * leave * lunch * 0.92 + 0.03 * smooth(6, 8, hour) * (1 - smooth(21, 23, hour)));
}

export function simulate({ hour, mode }) {
  const sun = sunHeight(hour);
  const daylight = clamp(sun * 1.5);
  const occ = mode === "away" ? 0.03 : schedule(hour);
  // lighting follows daylight and people; eco dims to 55 %, the corridors keep a night level for security
  const needLight = occ > 0.06 ? clamp(1.15 - daylight * 1.2) : 0;
  const lights = Math.max(0.08 * (1 - daylight), needLight * (mode === "eco" ? 0.55 : 1));
  const solar = SOLAR_KWP * sun ** 1.2 * 0.84;
  const heat = 0.55 + 0.45 * sun; // solar gain on the facade
  const hvac = mode === "away" ? 14 : (mode === "eco" ? 72 : 118) * occ * heat + (mode === "eco" ? 16 : 24);
  const plug = 58 * occ + 14;
  const light = 46 * lights;
  const load = hvac + plug + light;
  const grid = load - solar; // < 0: exporting surplus
  const co2 = 420 + occ * (mode === "comfort" ? 360 : mode === "eco" ? 520 : 0);
  const temp = mode === "away" ? 27.5 + 2.5 * sun : mode === "eco" ? 25.5 : 24;
  const parked = Math.round(BAYS * clamp(occ * 1.08));
  // automatic shading: a low sun hits the facades (east in the morning, west in the afternoon); overhead it hits the roof
  const lowSun = smooth(0.1, 0.3, sun) * (1 - smooth(0.82, 0.95, sun));
  const east = hour < 11.5 ? lowSun : 0;
  const west = hour > 12.8 ? lowSun : 0;
  const streetLights = 1 - smooth(0.05, 0.2, sun);
  const signage = mode === "away" ? 0 : smooth(6.5, 7, hour) * (1 - smooth(22.5, 23, hour));
  return { hour, mode, sun, daylight, occ, lights, solar, hvac, plug, light, load, grid, co2, temp, parked, east, west, streetLights, signage };
}

export function clock(hour) {
  const h = Math.floor(hour) % 24;
  const m = Math.floor((hour - Math.floor(hour)) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// one plain sentence about what the building is doing right now
export function explain(s, lang) {
  const th = lang === "th";
  const kw = (v) => `${Math.round(Math.abs(v))} kW`;
  const parts = [];
  if (s.mode === "away") {
    parts.push(th ? "โหมดไม่มีคนใช้งาน: ปิดแอร์และไฟเกือบทั้งหมด เหลือไฟทางเดินเพื่อความปลอดภัย" : "Away mode: air-con and most lights are off, corridors keep a security glow");
  } else if (s.occ < 0.08) {
    parts.push(th ? "นอกเวลาทำการ อาคารเกือบว่าง ระบบลดการใช้พลังงานเอง" : "Out of hours the building is nearly empty and throttles itself down");
  } else {
    parts.push(th ? `มีคนใช้งาน ${Math.round(s.occ * 100)}% ของพื้นที่` : `${Math.round(s.occ * 100)}% of desks are in use`);
  }
  if (s.solar > 5) {
    if (s.grid < 0) parts.push(th ? `โซลาร์ผลิต ${kw(s.solar)} เกินความต้องการ จึงขายไฟส่วนเกิน ${kw(s.grid)} คืนกริด` : `solar makes ${kw(s.solar)}, more than needed, so ${kw(s.grid)} flows back to the grid`);
    else parts.push(th ? `โซลาร์ช่วยได้ ${kw(s.solar)} ที่เหลือ ${kw(s.grid)} ดึงจากกริด` : `solar covers ${kw(s.solar)}, the grid supplies the other ${kw(s.grid)}`);
  } else {
    parts.push(th ? `ไม่มีแดด ใช้ไฟจากกริดทั้งหมด ${kw(s.grid)}` : `no sun: all ${kw(s.grid)} comes from the grid`);
  }
  if (s.east > 0.5 || s.west > 0.5) parts.push(th ? `ม่านบังแดดฝั่ง${s.east > 0.5 ? "ตะวันออก" : "ตะวันตก"}ลดลงอัตโนมัติ` : `the ${s.east > 0.5 ? "east" : "west"} louvres close against the sun`);
  else if (s.lights > 0.5 && s.occ > 0.08) parts.push(th ? "แสงธรรมชาติไม่พอ ไฟภายในเปิดอัตโนมัติ" : "daylight is low, so the lights switch on by themselves");
  return parts.join(th ? " · " : " · ");
}
