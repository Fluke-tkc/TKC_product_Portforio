import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { getSolution, localized } from "../data/solutions";
import * as THREE from "three";
import { DepthDiorama, FOV, homeDistance, layoutFor, pointOnSurface, useSceneAssets, viewHalfSize } from "../three/DepthDiorama";
import { CameraRig } from "../three/CameraRig";
import { HotspotPins } from "../three/HotspotPins";
import { InfoPanel, InfoSheet, Lightbox } from "../components/ui/InfoPanel";
import { LangToggle } from "../components/ui/LangToggle";
import { Loader } from "../components/ui/Loader";
import { WebGLBoundary } from "../components/ui/WebGLBoundary";
import { useMediaQuery } from "../hooks/useMediaQuery";
import pinStyles from "../three/HotspotPins.module.css";
import styles from "./SolutionPage.module.css";

const ModelView = lazy(() => import("../three/model/ModelView"));

const TEXT = {
  en: {
    back: "All solutions",
    loading: "Building 3D scene",
    hint: "Drag to explore · Scroll to zoom · Click a point for details",
    hintTouch: "Drag to look around · Two fingers to rotate & zoom · Tap a point",
    hintModel: "Drag to rotate 360° · Scroll to zoom · Click an object or point for details",
    hintModelTouch: "Drag to rotate · Pinch to zoom · Tap an object or point",
    points: "Explore",
    prev: "Previous topics",
    next: "More topics",
  },
  th: {
    back: "โซลูชันทั้งหมด",
    loading: "กำลังสร้างฉาก 3 มิติ",
    hint: "ลากเพื่อหมุนดู · เลื่อนเพื่อซูม · คลิกจุดเพื่อดูรายละเอียด",
    hintTouch: "ลากเพื่อเลื่อนดู · ใช้สองนิ้วเพื่อหมุนและซูม · แตะจุดเพื่อดูรายละเอียด",
    hintModel: "ลากเพื่อหมุนรอบ 360° · เลื่อนเพื่อซูม · คลิกวัตถุหรือจุดเพื่อดูรายละเอียด",
    hintModelTouch: "ลากเพื่อหมุน · ถ่างนิ้วเพื่อซูม · แตะวัตถุหรือจุดเพื่อดูรายละเอียด",
    points: "สำรวจ",
    prev: "หัวข้อก่อนหน้า",
    next: "หัวข้อถัดไป",
  },
};

export default function SolutionPage() {
  const { slug } = useParams();
  const solution = getSolution(slug);
  if (!solution) return <Navigate to="/" replace />;
  return <SolutionView key={slug} solution={solution} />;
}

function SolutionView({ solution }) {
  const { language } = useLanguage();
  const t = TEXT[language] || TEXT.en;
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [lightbox, setLightbox] = useState(false);
  const [hint, setHint] = useState(true);
  const isNarrow = useMediaQuery("(max-width: 900px)");
  const isTouch = useMediaQuery("(hover: none)");
  // phones: the info sheet starts folded on the Info tab; its Try it tab hosts the scene's dock
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTab, setSheetTab] = useState("info");
  const [trySlot, setTrySlot] = useState(null);

  const hotspots = solution.hotspots;
  const activeIndex = hotspots.findIndex((h) => h.id === params.get("point"));
  const active = activeIndex >= 0 ? localized(hotspots[activeIndex], language) : null;
  const title = solution.title[language] || solution.title.en;
  const modelHotspots = useMemo(() => hotspots.map((h) => ({ id: h.id, title: localized(h, language).title })), [hotspots, language]);
  const tagline = solution.tagline[language] || solution.tagline.en;

  const select = useCallback(
    (i) => {
      setHint(false);
      setLightbox(false);
      setParams(i >= 0 ? { point: hotspots[i].id } : {}, { replace: true });
    },
    [hotspots, setParams]
  );
  const step = useCallback((dir) => select((activeIndex + dir + hotspots.length) % hotspots.length), [activeIndex, hotspots.length, select]);
  const pickTab = (id) => {
    if (sheetOpen && sheetTab === id) setSheetOpen(false);
    else {
      setSheetTab(id);
      setSheetOpen(true);
    }
  };

  useEffect(() => {
    if (activeIndex < 0) setSheetOpen(false);
  }, [activeIndex]);

  useEffect(() => {
    document.title = `${title} | TKC Smart Solutions`;
  }, [title]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (lightbox) setLightbox(false);
        else if (activeIndex >= 0) select(-1);
        else navigate("/");
      } else if (activeIndex >= 0 && !lightbox && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        step(e.key === "ArrowRight" ? 1 : -1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, lightbox, navigate, select, step]);

  useEffect(() => {
    const id = setTimeout(() => setHint(false), 9000);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className={styles.page}>
      <WebGLBoundary fallback={<FlatScene solution={solution} lang={language} activeIndex={activeIndex} onSelect={select} />}>
        {solution.model ? (
          <Suspense fallback={null}>
            <ModelView
              id={solution.id}
              className={styles.canvas}
              hotspots={modelHotspots}
              activeIndex={activeIndex}
              onSelect={select}
              isNarrow={isNarrow}
              panelSlot={isNarrow && active ? trySlot : undefined}
            />
          </Suspense>
        ) : (
        <Canvas
          className={styles.canvas}
          flat
          dpr={[1, 2]}
          camera={{ fov: FOV, near: 0.1, far: 200, position: [0, 0, 40] }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          onPointerDown={() => setHint(false)}
        >
          <color attach="background" args={["#04152d"]} />
          <Suspense fallback={null}>
            <Scene solution={solution} lang={language} activeIndex={activeIndex} onSelect={select} isNarrow={isNarrow} />
          </Suspense>
        </Canvas>
        )}
        <Loader label={t.loading} />
      </WebGLBoundary>

      <header className={styles.header}>
        <button type="button" className={styles.back} onClick={() => navigate("/")}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{t.back}</span>
        </button>
        <div className={styles.titleBlock}>
          <p className={styles.eyebrow}>TKC Smart Solutions</p>
          <h1>{title}</h1>
          {tagline && <p className={styles.tagline}>{tagline}</p>}
        </div>
        <LangToggle />
      </header>

      {active && isNarrow && (
        <InfoSheet
          content={active}
          index={activeIndex}
          total={hotspots.length}
          lang={language}
          open={sheetOpen}
          tab={sheetTab}
          hasTry={!!solution.model}
          trySlot={setTrySlot}
          onTab={pickTab}
          onToggle={() => setSheetOpen((o) => !o)}
          onClose={() => select(-1)}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          onOpenInfographic={() => setLightbox(true)}
        />
      )}
      {active && !isNarrow && (
        <InfoPanel
          content={active}
          index={activeIndex}
          total={hotspots.length}
          lang={language}
          onClose={() => select(-1)}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          onOpenInfographic={() => setLightbox(true)}
        />
      )}

      <ChipSlider label={t.points} prevLabel={t.prev} nextLabel={t.next} hidden={active && isNarrow} activeIndex={activeIndex}>
        {hotspots.map((h, i) => (
          <button
            key={h.id}
            type="button"
            className={i === activeIndex ? styles.chipActive : styles.chip}
            aria-pressed={i === activeIndex}
            onClick={() => select(i === activeIndex ? -1 : i)}
          >
            <span className={styles.chipNum}>{i + 1}</span>
            {localized(h, language).title}
          </button>
        ))}
      </ChipSlider>

      <p className={`${styles.hint} ${hint ? "" : styles.hintHidden}`}>{solution.model ? (isTouch ? t.hintModelTouch : t.hintModel) : isTouch ? t.hintTouch : t.hint}</p>

      {lightbox && active && (
        <Lightbox src={hotspots[activeIndex].detail[language] || hotspots[activeIndex].detail.en} alt={active.title} onClose={() => setLightbox(false)} />
      )}
    </div>
  );
}

// Horizontal slide bar for the topic chips: arrows, mouse drag, wheel and swipe; keeps the active chip in view.
function ChipSlider({ label, prevLabel, nextLabel, hidden, activeIndex, children }) {
  const track = useRef(null);
  const drag = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const el = track.current;
    if (el) setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track.current);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    track.current?.children[activeIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeIndex]);

  const page = (dir) => track.current.scrollBy({ left: dir * track.current.clientWidth * 0.75, behavior: "smooth" });
  const overflow = !(edge.start && edge.end);

  return (
    <nav className={`${styles.dock} ${hidden ? styles.dockHidden : ""}`} aria-label={label}>
      {overflow && (
        <button type="button" className={styles.dockArrow} onClick={() => page(-1)} disabled={edge.start} aria-label={prevLabel}>
          ‹
        </button>
      )}
      <div
        ref={track}
        className={styles.dockTrack}
        data-fade-start={!edge.start}
        data-fade-end={!edge.end}
        onScroll={measure}
        onWheel={(e) => {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) track.current.scrollLeft += e.deltaY;
        }}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse") drag.current = { x: e.clientX, left: track.current.scrollLeft, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          if (!d.moved && Math.abs(e.clientX - d.x) > 5) {
            d.moved = true;
            track.current.setPointerCapture(e.pointerId);
          }
          if (d.moved) track.current.scrollLeft = d.left - (e.clientX - d.x);
        }}
        onPointerUp={() => {
          // a drag must not also click the chip it ended on
          if (drag.current?.moved) setTimeout(() => (drag.current = null));
          else drag.current = null;
        }}
        onClickCapture={(e) => {
          if (drag.current?.moved) e.stopPropagation();
        }}
      >
        {children}
      </div>
      {overflow && (
        <button type="button" className={styles.dockArrow} onClick={() => page(1)} disabled={edge.end} aria-label={nextLabel}>
          ›
        </button>
      )}
    </nav>
  );
}

function Scene({ solution, lang, activeIndex, onSelect, isNarrow }) {
  const assets = useSceneAssets(solution.scene);
  const layout = useMemo(() => layoutFor(solution.scene), [solution.scene]);
  const size = useThree((s) => s.size);
  const camera = useThree((s) => s.camera);
  const homeDist = homeDistance(layout, size.width / size.height);
  const [introStart] = useState(() => performance.now());
  const [pinsVisible, setPinsVisible] = useState(false);

  useLayoutEffect(() => {
    camera.position.set(0, -layout.h * 0.15, homeDist * 1.55);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setPinsVisible(true), 2200);
    return () => clearTimeout(id);
  }, []);

  const pins = useMemo(
    () =>
      solution.hotspots.map((h) => ({
        id: h.id,
        title: localized(h, lang).title,
        position: pointOnSurface(layout, homeDist, solution.depth, assets.depthGrid, h.pos[0], h.pos[1]),
      })),
    [solution, lang, layout, homeDist, assets.depthGrid]
  );

  const focus = activeIndex >= 0 ? pins[activeIndex].position : null;
  // Keep the focused point clear of the info panel: beside it on desktop, above the bottom sheet on phones.
  const viewShift = !focus ? [0, 0] : isNarrow ? [0, size.height * 0.19] : [Math.min(420, size.width * 0.4) / 2 + 12, 0];
  const portrait = size.width < size.height;

  return (
    <>
      <DepthDiorama
        scene={solution.scene}
        layout={layout}
        refZ={homeDist}
        depthScale={solution.depth}
        assets={assets}
        focusUv={activeIndex >= 0 ? solution.hotspots[activeIndex].pos : null}
        introStart={introStart}
      />
      <HotspotPins pins={pins} activeIndex={activeIndex} visible={pinsVisible} onSelect={onSelect} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.45}
        zoomSpeed={0.7}
        panSpeed={0.6}
        screenSpacePanning
        touches={portrait ? { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE } : undefined}
        minAzimuthAngle={-0.42}
        maxAzimuthAngle={0.42}
        minPolarAngle={Math.PI / 2 - 0.32}
        maxPolarAngle={Math.PI / 2 + 0.22}
        minDistance={homeDist * 0.3}
        maxDistance={homeDist * 1.25}
      />
      <CameraRig homeDist={homeDist} focus={focus} viewShift={viewShift} />
      {!focus && <PanBounds layout={layout} />}
    </>
  );
}

// Keep panning within the picture.
function PanBounds({ layout }) {
  const controls = useThree((s) => s.controls);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  useFrame(() => {
    if (!controls) return;
    const t = controls.target;
    const [hw, hh] = viewHalfSize(camera.position.distanceTo(t), size.width / size.height);
    const mx = Math.max(layout.w * 0.5 - hw * 0.85, 0);
    const my = Math.max(layout.h * 0.5 - hh * 0.85, 0);
    const x = Math.min(mx, Math.max(-mx, t.x));
    const y = Math.min(my, Math.max(-my, t.y));
    if (x !== t.x || y !== t.y) {
      camera.position.x += x - t.x;
      camera.position.y += y - t.y;
      t.set(x, y, t.z);
    }
  });
  return null;
}

// 2D stand-in when WebGL is unavailable: the same picture and points, without depth.
function FlatScene({ solution, lang, activeIndex, onSelect }) {
  return (
    <div className={styles.flat}>
      <div className={styles.flatFrame} style={{ aspectRatio: solution.scene.aspect }}>
        <img src={`${solution.scene.base}/color.webp`} alt="" />
        {solution.hotspots.map((h, i) => (
          <span key={h.id} className={styles.flatPin} style={{ left: `${h.pos[0] * 100}%`, top: `${h.pos[1] * 100}%` }}>
            <button
              type="button"
              className={[pinStyles.pin, pinStyles.visible, activeIndex === i && pinStyles.active].filter(Boolean).join(" ")}
              onClick={() => onSelect(i)}
              aria-label={localized(h, lang).title}
              aria-pressed={activeIndex === i}
            >
              <span className={pinStyles.pulse} aria-hidden="true" />
              <span className={pinStyles.core} aria-hidden="true">
                {i + 1}
              </span>
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
