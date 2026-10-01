import building from "./building";
import hospital from "./hospital";
import learning from "./learning";
import logistics from "./logistics";
import cables from "./cables";
import autonomous from "./autonomous";
import cybersecurity from "./cybersecurity";
import utility from "./utility";
import cloud from "./cloud";
import sceneMeta from "../sceneMeta.json";

// Solutions that have a hand-built 3D model; the rest still use the image-depth scene.
const MODELLED = new Set(["building", "hospital", "learning", "logistics", "cables", "autonomous", "cybersecurity", "utility"]);

const withScene = (data) => ({
  ...data,
  model: MODELLED.has(data.id),
  scene: { base: `/scenes/${data.id}`, ...sceneMeta[data.id] },
});

// Where long Thai names should break on the home-ring cards (Thai has no spaces to wrap at).
const CARD_TITLES_TH = {
  hospital: "ระบบโรงพยาบาล\nอัจฉริยะ",
  learning: "ระบบการเรียนรู้\nอัจฉริยะ",
  cables: "ระบบโครงข่าย\nสายสื่อสารอัจฉริยะ",
  autonomous: "ระบบการทำงาน\nอัตโนมัติ",
  cybersecurity: "ระบบการรักษาความ\nปลอดภัยทางไซเบอร์",
  farm: "ระบบเกษตรนวัตกรรม\nอัจฉริยะ",
  utility: "ระบบโครงสร้าง\nพื้นฐานอัจฉริยะ",
  cloud: "ระบบบริการ\nคลาวด์อัจฉริยะ",
};

export const cardTitle = (solution, lang) =>
  (lang === "th" && CARD_TITLES_TH[solution.id]) || solution.title[lang] || solution.title.en;

// Order of the cards on the home ring.
export const SOLUTIONS = [
  withScene(building),
  withScene(hospital),
  withScene(learning),
  withScene(logistics),
  withScene(cables),
  withScene(autonomous),
  withScene(cybersecurity),
  // no scene of its own: the card opens the farm platform
  { id: "farm", title: { en: "Smart Farming", th: "ระบบเกษตรนวัตกรรมอัจฉริยะ" }, href: "https://myfarmsuk.com/", card: "/scenes/farm/card.webp" },
  withScene(utility),
  withScene(cloud),
];

export const getSolution = (id) => SOLUTIONS.find((s) => s.id === id && !s.comingSoon && !s.href);

// Content for the current language, falling back to English until a Thai transcription exists.
export const localized = (hotspot, lang) => hotspot[lang] || hotspot.en;
