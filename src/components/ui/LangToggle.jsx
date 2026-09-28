import { useLanguage } from "../../contexts/LanguageContext";
import styles from "./ui.module.css";

export function LangToggle() {
  const { language, setLanguageDirectly } = useLanguage();
  return (
    <div className={styles.lang} role="group" aria-label="Language">
      {["en", "th"].map((lang) => (
        <button
          key={lang}
          type="button"
          className={language === lang ? styles.langActive : undefined}
          aria-pressed={language === lang}
          onClick={() => setLanguageDirectly(lang)}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
