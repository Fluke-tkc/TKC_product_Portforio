import { useEffect, useRef } from "react";
import styles from "./ui.module.css";

const LABELS = {
  en: { infographic: "View infographic", prev: "Previous", next: "Next", close: "Close", info: "Info", try: "Try it", expand: "Show more", collapse: "Show less" },
  th: { infographic: "ดูอินโฟกราฟิก", prev: "ก่อนหน้า", next: "ถัดไป", close: "ปิด", info: "ข้อมูล", try: "ลองเล่น", expand: "แสดงเพิ่ม", collapse: "ย่อลง" },
};

function Sections({ content, t, onOpenInfographic }) {
  return (
    <>
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
    </>
  );
}

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
        <Sections content={content} t={t} onOpenInfographic={onOpenInfographic} />
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

// Phones: one bottom sheet instead of the side panel and the try-it dock. Folded, it shows the topic, the
// Info / Try it tabs and prev / next, so the model stays in view; a tab (or a swipe up) unfolds it. The Try it tab
// is an empty slot that the scene's dock is portalled into (trySlot).
export function InfoSheet({ content, index, total, lang, open, tab, hasTry, trySlot, onTab, onToggle, onClose, onPrev, onNext, onOpenInfographic }) {
  const bodyRef = useRef(null);
  const swipe = useRef(null);
  const t = LABELS[lang] || LABELS.en;

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [content]);

  const tabButton = (id, label) => (
    <button type="button" role="tab" aria-selected={open && tab === id} className={open && tab === id ? styles.tabOn : styles.tab} onClick={() => onTab(id)}>
      {label}
    </button>
  );

  return (
    <aside
      className={`${styles.sheet} ${open ? styles.sheetOpen : ""}`}
      aria-live="polite"
      aria-label={content.title}
      onPointerDown={(e) => (swipe.current = e.clientY)}
      onPointerUp={(e) => {
        const dy = swipe.current === null ? 0 : e.clientY - swipe.current;
        swipe.current = null;
        if ((dy < -40 && !open) || (dy > 40 && open)) onToggle();
      }}
    >
      <button type="button" className={styles.sheetHandle} onClick={onToggle} aria-label={open ? t.collapse : t.expand}>
        <span />
      </button>
      <header className={styles.sheetHead}>
        <span className={styles.panelIndex}>
          {String(index + 1).padStart(2, "0")} <span>/ {String(total).padStart(2, "0")}</span>
        </span>
        <h2 className={styles.sheetTitle} onClick={onToggle}>
          {content.title}
        </h2>
        <button type="button" className={styles.iconButton} onClick={onClose} aria-label={t.close}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </header>
      <div className={styles.sheetBar}>
        <div className={styles.tabs} role="tablist">
          {tabButton("info", t.info)}
          {hasTry && tabButton("try", t.try)}
        </div>
        <div className={styles.sheetNav}>
          <button type="button" onClick={onPrev} aria-label={t.prev}>
            ‹
          </button>
          <button type="button" onClick={onNext} aria-label={t.next}>
            ›
          </button>
        </div>
      </div>
      {open && tab === "info" && (
        <div className={styles.sheetBody} ref={bodyRef}>
          <Sections content={content} t={t} onOpenInfographic={onOpenInfographic} />
        </div>
      )}
      {open && tab === "try" && <div className={styles.sheetBody} ref={trySlot} data-compact="" />}
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
