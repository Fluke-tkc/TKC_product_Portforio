import { useEffect, useRef } from "react";
import styles from "./ui.module.css";

const LABELS = {
  en: { infographic: "View infographic", prev: "Previous", next: "Next", close: "Close" },
  th: { infographic: "ดูอินโฟกราฟิก", prev: "ก่อนหน้า", next: "ถัดไป", close: "ปิด" },
};

export function InfoPanel({ content, index, total, lang, onClose, onPrev, onNext, onOpenInfographic }) {
  const bodyRef = useRef(null);
  const t = LABELS[lang] || LABELS.en;

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [content]);

  return (
    <aside className={styles.panel} aria-live="polite" aria-label={content.title}>
      <header className={styles.panelHead}>
        <span className={styles.panelIndex}>
          {String(index + 1).padStart(2, "0")} <span>/ {String(total).padStart(2, "0")}</span>
        </span>
        <button type="button" className={styles.iconButton} onClick={onClose} aria-label={t.close}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div className={styles.panelBody} ref={bodyRef}>
        <h2 className={styles.panelTitle}>{content.title}</h2>
        {content.summary && <p className={styles.panelSummary}>{content.summary}</p>}

        {content.sections.map((section) => (
          <section key={section.h} className={styles.section}>
            <h3>{section.h}</h3>
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}

        <button type="button" className={styles.infographicButton} onClick={onOpenInfographic}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M3 16l5-5 4 4 3-3 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
          {t.infographic}
        </button>
      </div>

      <footer className={styles.panelFoot}>
        <button type="button" className={styles.navButton} onClick={onPrev}>
          <span aria-hidden="true">←</span> {t.prev}
        </button>
        <button type="button" className={styles.navButton} onClick={onNext}>
          {t.next} <span aria-hidden="true">→</span>
        </button>
      </footer>
    </aside>
  );
}

export function Lightbox({ src, alt, onClose }) {
  return (
    <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={alt} onClick={onClose}>
      <img src={src} alt={alt} onClick={(e) => e.stopPropagation()} />
      <button type="button" className={`${styles.iconButton} ${styles.lightboxClose}`} onClick={onClose} aria-label="Close">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
