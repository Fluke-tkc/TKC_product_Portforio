import { Html } from "@react-three/drei";
import styles from "./HotspotPins.module.css";

export function HotspotPins({ pins, activeIndex, visible, onSelect, occlude }) {
  return pins.map((pin, i) => (
    <Html key={pin.id} position={pin.position} center zIndexRange={[20, 10]} occlude={occlude}>
      <button
        type="button"
        className={[styles.pin, visible && styles.visible, activeIndex === i && styles.active].filter(Boolean).join(" ")}
        style={{ transitionDelay: visible ? `${i * 90}ms` : "0ms" }}
        onClick={() => onSelect(i)}
        aria-label={pin.title}
        aria-pressed={activeIndex === i}
      >
        <span className={styles.pulse} aria-hidden="true" />
        <span className={styles.core} aria-hidden="true">
          {i + 1}
        </span>
        <span className={styles.label} aria-hidden="true">
          {pin.title}
        </span>
      </button>
    </Html>
  ));
}
