import { useProgress } from "@react-three/drei";
import styles from "./ui.module.css";

export function Loader({ label }) {
  const { active, progress } = useProgress();
  const done = !active && progress >= 100;
  return (
    <div className={`${styles.loader} ${done ? styles.loaderDone : ""}`} aria-hidden={done}>
      <div className={styles.loaderRing} />
      <p>
        {label} <span>{Math.round(progress)}%</span>
      </p>
    </div>
  );
}
