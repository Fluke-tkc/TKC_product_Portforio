// Control panel of the live Smart Building: time of day, operating mode, system layers, exploded view,
// plus the live numbers and one sentence explaining what the building is doing.
import { useState } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { BAYS, clock, explain, simulate } from "./sim";
import { store } from "./state";
import styles from "./Panel.module.css";

const T = {
  en: {
    time: "Time of day", play: "Play the day", pause: "Pause", presets: [["Morning", 8], ["Noon", 12.5], ["Evening", 18.5], ["Night", 22]],
    mode: "Building mode", modes: { comfort: "Comfort", eco: "Eco", away: "Away" },
    layers: "System layers", layerNames: { energy: "Energy", hvac: "Air", network: "IoT", security: "Security" },
    view: "View", assembled: "Assembled", exploded: "Floors apart",
    load: "Demand", solar: "Solar", grid: "Grid", exporting: "Export", importing: "Import", occ: "People", co2: "CO₂", park: "Parking free",
    controls: "Controls",
  },
  th: {
    time: "ช่วงเวลา", play: "เล่นทั้งวัน", pause: "หยุด", presets: [["เช้า", 8], ["เที่ยง", 12.5], ["เย็น", 18.5], ["ค่ำ", 22]],
    mode: "โหมดอาคาร", modes: { comfort: "สบาย", eco: "ประหยัด", away: "ไม่มีคน" },
    layers: "ชั้นข้อมูลระบบ", layerNames: { energy: "พลังงาน", hvac: "แอร์", network: "IoT", security: "ความปลอดภัย" },
    view: "มุมมอง", assembled: "ประกอบ", exploded: "แยกชั้น",
    load: "ใช้ไฟ", solar: "โซลาร์", grid: "กริด", exporting: "ขายคืน", importing: "ซื้อเข้า", occ: "คนในอาคาร", co2: "CO₂", park: "ที่จอดว่าง",
    controls: "ปรับฉาก",
  },
};

const LAYER_ICONS = {
  energy: "M13 2 4 14h7l-1 8 9-12h-7z",
  hvac: "M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7",
  network: "M12 20a1.5 1.5 0 1 0 0-.01M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 14 0M1.5 9.5a15 15 0 0 1 21 0",
  security: "M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z",
};

function Icon({ d }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Panel({ hidden }) {
  const { language } = useLanguage();
  const t = T[language] || T.en;
  const narrow = useMediaQuery("(max-width: 900px)");
  const [open, setOpen] = useState(false);
  const hour = store.use((s) => s.hour);
  const mode = store.use((s) => s.mode);
  const playing = store.use((s) => s.playing);
  const exploded = store.use((s) => s.exploded);
  const layers = { energy: store.use((s) => s.energy), hvac: store.use((s) => s.hvac), network: store.use((s) => s.network), security: store.use((s) => s.security) };
  const s = simulate({ hour, mode });
  const exporting = s.grid < 0;

  const stats = (
    <section className={styles.stats} aria-live="polite">
      <div className={styles.clockRow}>
        <span className={styles.clock}>{clock(hour)}</span>
        <span className={styles.dot} style={{ background: s.daylight > 0.2 ? "#ffd23f" : "#8fb0ff" }} />
      </div>
      <div className={styles.tiles}>
        <Tile label={t.load} value={Math.round(s.load)} unit="kW" />
        <Tile label={t.solar} value={Math.round(s.solar)} unit="kW" tone="#ffd23f" />
        <Tile label={`${t.grid} · ${exporting ? t.exporting : t.importing}`} value={Math.round(Math.abs(s.grid))} unit="kW" tone={exporting ? "#4dff9a" : "#ffa24d"} />
        <Tile label={t.occ} value={Math.round(s.occ * 100)} unit="%" />
        <Tile label={t.co2} value={Math.round(s.co2)} unit="ppm" tone={s.co2 > 800 ? "#ffa24d" : undefined} />
        <Tile label={t.park} value={`${BAYS - s.parked}/${BAYS}`} />
      </div>
      <p className={styles.explain}>{explain(s, language)}</p>
    </section>
  );

  const controls = (
    <section className={styles.controls}>
      <div className={styles.group}>
        <div className={styles.label}>
          {t.time}
          <span className={styles.value}>{clock(hour)}</span>
        </div>
        <div className={styles.row}>
          <button
            type="button"
            className={styles.play}
            aria-label={playing ? t.pause : t.play}
            title={playing ? t.pause : t.play}
            onClick={() => store.set({ playing: !playing })}
          >
            {playing ? "❚❚" : "▶"}
          </button>
          <input
            className={styles.slider}
            type="range"
            min="0"
            max="23.75"
            step="0.25"
            value={hour}
            aria-label={t.time}
            onChange={(e) => store.set({ hour: Number(e.target.value), playing: false })}
          />
        </div>
        <div className={styles.segment}>
          {t.presets.map(([name, h]) => (
            <button key={name} type="button" className={Math.abs(hour - h) < 0.3 ? styles.on : undefined} onClick={() => store.set({ hour: h, playing: false })}>
              {name}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.group}>
        <div className={styles.label}>{t.mode}</div>
        <div className={styles.segment}>
          {Object.entries(t.modes).map(([id, name]) => (
            <button key={id} type="button" className={mode === id ? styles.on : undefined} aria-pressed={mode === id} onClick={() => store.set({ mode: id })}>
              {name}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.group}>
        <div className={styles.label}>{t.layers}</div>
        <div className={styles.layerGrid}>
          {Object.entries(t.layerNames).map(([id, name]) => (
            <button key={id} type="button" className={layers[id] ? styles.layerOn : styles.layer} aria-pressed={layers[id]} onClick={() => store.set({ [id]: !layers[id] })} data-layer={id}>
              <Icon d={LAYER_ICONS[id]} />
              {name}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.group}>
        <div className={styles.label}>{t.view}</div>
        <div className={styles.segment}>
          <button type="button" className={!exploded ? styles.on : undefined} aria-pressed={!exploded} onClick={() => store.set({ exploded: false })}>
            {t.assembled}
          </button>
          <button type="button" className={exploded ? styles.on : undefined} aria-pressed={exploded} onClick={() => store.set({ exploded: true })}>
            {t.exploded}
          </button>
        </div>
      </div>
    </section>
  );

  if (narrow) {
    return (
      <div className={`${styles.narrow} ${hidden ? styles.hidden : ""}`}>
        <button type="button" className={styles.toggle} aria-expanded={open} onClick={() => setOpen(!open)}>
          ⚙ {t.controls} · {clock(hour)} · {Math.round(s.load)} kW
        </button>
        {open && (
          <div className={styles.sheet}>
            {controls}
            {stats}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className={hidden ? styles.hidden : undefined}>
      <div className={styles.left}>{stats}</div>
      <div className={styles.right}>{controls}</div>
    </div>
  );
}

function Tile({ label, value, unit, tone }) {
  return (
    <div className={styles.tile}>
      <span className={styles.tileLabel}>{label}</span>
      <span className={styles.tileValue} style={tone ? { color: tone } : undefined}>
        {value}
        {unit && <small>{unit}</small>}
      </span>
    </div>
  );
}
