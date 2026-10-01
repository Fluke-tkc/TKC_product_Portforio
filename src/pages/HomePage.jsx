import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshReflectorMaterial, Sparkles } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { SOLUTIONS, cardTitle } from "../data/solutions";
import { createBackTexture, createCardTexture, createGlowTexture } from "../three/cardTexture";
import { LangToggle } from "../components/ui/LangToggle";
import { TkcLogo } from "../components/ui/TkcLogo";
import { WebGLBoundary, prefersReducedMotion } from "../components/ui/WebGLBoundary";
import { useMediaQuery } from "../hooks/useMediaQuery";
import styles from "./HomePage.module.css";

const N = SOLUTIONS.length;
const STEP = (Math.PI * 2) / N;
const RADIUS = 6.4;
const CARD_W = 2.4;
const CARD_H = CARD_W * (4 / 3);
const FLOOR_Y = -CARD_H / 2 - 0.45;
const AUTO_STEP_MS = 4200;
const IDLE_MS = 6000;
const STORAGE_KEY = "tkc-ring-rotation";

const TEXT = {
  en: {
    explore: "Explore",
    cta: "Explore  →",
    soon: "COMING SOON",
    soonToast: "Smart Farming is coming soon",
    hint: "Drag or scroll to rotate · Click a card to enter",
    hintTouch: "Swipe to rotate · Tap a card to enter",
    prev: "Previous solution",
    next: "Next solution",
    music: "Background music",
  },
  th: {
    explore: "สำรวจ",
    cta: "สำรวจ  →",
    soon: "เร็วๆ นี้",
    soonToast: "ระบบเกษตรนวัตกรรมอัจฉริยะ เร็วๆ นี้",
    hint: "ลากหรือเลื่อนเพื่อหมุน · คลิกการ์ดเพื่อเข้าชม",
    hintTouch: "ปัดเพื่อหมุน · แตะการ์ดเพื่อเข้าชม",
    prev: "โซลูชันก่อนหน้า",
    next: "โซลูชันถัดไป",
    music: "เพลงประกอบ",
  },
};

const wrapAngle = (a) => THREE.MathUtils.euclideanModulo(a + Math.PI, Math.PI * 2) - Math.PI;
const frontOf = (rot) => THREE.MathUtils.euclideanModulo(Math.round(-rot / STEP), N);

export default function HomePage() {
  const { language, text } = useLanguage();
  const t = TEXT[language] || TEXT.en;
  const navigate = useNavigate();
  const isTouch = useMediaQuery("(hover: none)");
  const [front, setFront] = useState(() => frontOf(readRotation()));
  const [entering, setEntering] = useState(-1);
  const [toast, setToast] = useState("");
  const [playing, setPlaying] = useState(false);
  const audio = useRef(null);
  const ring = useRef({ rot: readRotation(), vel: 0, target: null, dragging: false, moved: 0, lastX: 0, lastT: 0, lastInteraction: 0 });

  useEffect(() => {
    document.title = "TKC Smart Solutions";
  }, []);

  const turnTo = useCallback((i) => {
    const r = ring.current;
    // shortest way round to card i
    r.target = r.rot + wrapAngle(-i * STEP - r.rot);
    r.vel = 0;
    r.lastInteraction = performance.now();
  }, []);

  const open = useCallback(
    (i) => {
      if (entering >= 0) return;
      const s = SOLUTIONS[i];
      turnTo(i);
      if (s.comingSoon) {
        setToast(t.soonToast);
        return;
      }
      if (s.href) {
        window.location.assign(s.href);
        return;
      }
      setEntering(i);
      sessionStorage.setItem(STORAGE_KEY, String(-i * STEP));
      setTimeout(() => navigate(`/solutions/${s.id}`), 1150);
    },
    [entering, navigate, t.soonToast, turnTo]
  );

  const step = useCallback((dir) => turnTo(THREE.MathUtils.euclideanModulo(front + dir, N)), [front, turnTo]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.("button, a, input")) return;
      if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Enter") open(front);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [front, open, step]);

  useEffect(() => () => audio.current?.pause(), []);

  const toggleMusic = () => {
    audio.current ||= Object.assign(new Audio("/audio/loveromanticinstrumental.m4a"), { loop: true, volume: 0.5 });
    if (playing) audio.current.pause();
    else audio.current.play().catch(() => {});
    setPlaying(!playing);
  };

  // Drag / swipe / wheel handling lives on the DOM wrapper so it works anywhere on screen.
  const onPointerDown = (e) => {
    if (e.target.closest("button, a")) return;
    const r = ring.current;
    r.dragging = true;
    r.moved = 0;
    r.lastX = e.clientX;
    r.lastT = performance.now();
    r.target = null;
    r.vel = 0;
  };
  const onPointerMove = (e) => {
    const r = ring.current;
    if (!r.dragging) return;
    const now = performance.now();
    const dx = e.clientX - r.lastX;
    const d = (dx / window.innerWidth) * 3.2;
    r.rot += d;
    r.vel = THREE.MathUtils.lerp(r.vel, d / Math.max(0.008, (now - r.lastT) / 1000), 0.5);
    r.moved += Math.abs(dx);
    r.lastX = e.clientX;
    r.lastT = now;
    r.lastInteraction = now;
  };
  const onPointerUp = () => {
    const r = ring.current;
    r.dragging = false;
    r.lastInteraction = performance.now();
  };
  const onWheel = (e) => {
    const r = ring.current;
    r.target = null;
    r.vel = THREE.MathUtils.clamp(r.vel - (e.deltaY + e.deltaX) * 0.004, -4, 4);
    r.lastInteraction = performance.now();
  };

  const current = SOLUTIONS[front];

  return (
    <div
      className={styles.page}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={onWheel}
    >
      <WebGLBoundary fallback={<CardGrid lang={language} onOpen={open} />}>
      <Canvas className={styles.canvas} flat dpr={[1, 2]} camera={{ fov: 40, near: 0.1, far: 80, position: [0, 1.4, RADIUS + 9] }} gl={{ antialias: true }}>
        <color attach="background" args={["#04152d"]} />
        <fog attach="fog" args={["#04152d", RADIUS + 4, RADIUS + 22]} />
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 4, RADIUS + 2]} intensity={40} color="#8fdcff" />
        <Suspense fallback={null}>
          <Ring ring={ring} lang={language} t={t} front={front} entering={entering} onFrontChange={setFront} onOpen={open} />
        </Suspense>
        <Floor />
        <Sparkles count={90} scale={[26, 9, 26]} position={[0, 1, 0]} size={2.2} speed={0.25} opacity={0.6} color="#8fe9ff" />
        <CameraMover entering={entering} />
      </Canvas>
      </WebGLBoundary>

      <header className={styles.header}>
        <a className={styles.logo} href="https://www.tkc-services.com/th/home" aria-label="TKC Services">
          <TkcLogo />
        </a>
        <div className={styles.headerRight}>
          <button type="button" className={styles.round} onClick={toggleMusic} aria-label={t.music} aria-pressed={playing}>
            {playing ? "♫" : "♪"}
          </button>
          <LangToggle />
        </div>
      </header>

      <div className={styles.hero}>
        <p className={styles.eyebrow}>{text.subtitle}</p>
        <h1 className={language === "th" ? styles.titleTh : undefined}>{text.title}</h1>
      </div>

      <div className={styles.dock}>
        <button type="button" className={styles.arrow} onClick={() => step(-1)} aria-label={t.prev}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className={styles.current} aria-live="polite">
          <span className={styles.counter}>
            {String(front + 1).padStart(2, "0")} <span>/ {String(N).padStart(2, "0")}</span>
          </span>
          <strong>{current.title[language] || current.title.en}</strong>
          <button type="button" className={styles.explore} onClick={() => open(front)} disabled={current.comingSoon}>
            {current.comingSoon ? t.soon : t.explore}
          </button>
        </div>
        <button type="button" className={styles.arrow} onClick={() => step(1)} aria-label={t.next}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <nav className={styles.dots} aria-label="Solutions">
        {SOLUTIONS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={i === front ? styles.dotActive : styles.dot}
            aria-label={s.title[language] || s.title.en}
            aria-current={i === front}
            onClick={() => turnTo(i)}
          />
        ))}
      </nav>

      <p className={styles.hint}>{isTouch ? t.hintTouch : t.hint}</p>
      <div className={`${styles.toast} ${toast ? styles.toastShow : ""}`} role="status">
        {toast}
      </div>
      <div className={`${styles.fade} ${entering >= 0 ? styles.fadeIn : ""}`} />
    </div>
  );
}

// 2D stand-in when WebGL is unavailable.
function CardGrid({ lang, onOpen }) {
  return (
    <div className={styles.grid}>
      {SOLUTIONS.map((s, i) => (
        <button key={s.id} type="button" className={styles.gridCard} onClick={() => onOpen(i)}>
          <img src={s.card || `${s.scene.base}/card.webp`} alt="" loading="lazy" />
          <span>{s.title[lang] || s.title.en}</span>
        </button>
      ))}
    </div>
  );
}

function readRotation() {
  try {
    const v = parseFloat(sessionStorage.getItem(STORAGE_KEY));
    return Number.isFinite(v) ? v : 0;
  } catch {
    return 0;
  }
}

function Ring({ ring, lang, t, front, entering, onFrontChange, onOpen }) {
  const group = useRef();
  const [textures, setTextures] = useState([]);
  const [hovered, setHovered] = useState(-1);
  const glow = useMemo(() => createGlowTexture(), []);
  const reduceMotion = useMemo(prefersReducedMotion, []);
  const back = useMemo(() => createBackTexture(), []);

  useEffect(() => {
    let alive = true;
    Promise.all(
      SOLUTIONS.map((s, i) =>
        createCardTexture({
          image: s.card || `${s.scene.base}/card.webp`,
          index: i + 1,
          title: cardTitle(s, lang),
          cta: s.comingSoon ? "" : t.cta,
          badge: s.comingSoon ? t.soon : null,
        })
      )
    ).then((list) => {
      if (!alive) return list.forEach((tx) => tx.dispose());
      setTextures((old) => {
        old.forEach((tx) => tx.dispose());
        return list;
      });
    });
    return () => {
      alive = false;
    };
  }, [lang, t]);

  useEffect(() => {
    document.body.style.cursor = hovered >= 0 ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);

  useFrame((state, dt) => {
    const r = ring.current;
    if (!r.dragging) {
      if (r.target !== null) {
        r.rot += (r.target - r.rot) * (1 - Math.exp(-dt * 4));
        if (Math.abs(r.target - r.rot) < 0.0005) {
          r.rot = r.target;
          r.target = null;
        }
      } else if (Math.abs(r.vel) > 0.02) {
        r.rot += r.vel * dt;
        r.vel *= Math.exp(-dt * 2.8);
        if (Math.abs(r.vel) < 0.25) {
          r.target = Math.round(r.rot / STEP) * STEP;
          r.vel = 0;
        }
      } else if (entering < 0 && !reduceMotion && performance.now() - r.lastInteraction > IDLE_MS) {
        const now = performance.now();
        if (now - (r.lastAuto || 0) > AUTO_STEP_MS) {
          r.target = Math.round(r.rot / STEP) * STEP - STEP;
          r.lastAuto = now;
        }
      }
    }
    if (group.current) group.current.rotation.y = r.rot;
    const f = frontOf(r.rot);
    if (f !== front) onFrontChange(f);
  });

  return (
    <group ref={group}>
      {textures.length > 0 && SOLUTIONS.map((s, i) => (
        <Card
          key={s.id}
          angle={i * STEP}
          texture={textures[i]}
          glow={glow}
          back={back}
          emphasis={hovered === i ? 1 : front === i ? 0.6 : 0}
          onOver={() => setHovered(i)}
          onOut={() => setHovered((h) => (h === i ? -1 : h))}
          onClick={() => ring.current.moved < 8 && onOpen(i)}
        />
      ))}
      <mesh rotation-x={-Math.PI / 2} position-y={FLOOR_Y + 0.01}>
        <ringGeometry args={[RADIUS - 0.03, RADIUS + 0.03, 160]} />
        <meshBasicMaterial color="#5ee7ff" transparent opacity={0.35} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Card({ angle, texture, glow, back, emphasis, onOver, onOut, onClick }) {
  const ref = useRef();
  const glowMat = useRef();
  const lift = useRef(0);

  useFrame((_, dt) => {
    lift.current += (emphasis - lift.current) * (1 - Math.exp(-dt * 8));
    const l = lift.current;
    const radius = RADIUS + l * 0.55;
    ref.current.position.set(Math.sin(angle) * radius, l * 0.18, Math.cos(angle) * radius);
    ref.current.scale.setScalar(1 + l * 0.07);
    glowMat.current.opacity = 0.12 + l * 0.6;
  });

  return (
    <group ref={ref} rotation-y={angle}>
      <mesh position-z={-0.05} scale={[CARD_W * 1.7, CARD_H * 1.4, 1]}>
        <planeGeometry />
        <meshBasicMaterial ref={glowMat} map={glow} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
      </mesh>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          onOver();
        }}
        onPointerOut={onOut}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <planeGeometry args={[CARD_W, CARD_H]} />
        <meshBasicMaterial map={texture} transparent alphaTest={0.5} toneMapped={false} />
      </mesh>
      <mesh rotation-y={Math.PI} position-z={-0.01}>
        <planeGeometry args={[CARD_W, CARD_H]} />
        <meshBasicMaterial map={back} transparent alphaTest={0.5} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Floor() {
  const isNarrow = useMediaQuery("(max-width: 900px)");
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={FLOOR_Y}>
      <circleGeometry args={[40, 64]} />
      <MeshReflectorMaterial
        blur={[400, 120]}
        resolution={isNarrow ? 512 : 1024}
        mixBlur={1}
        mixStrength={18}
        roughness={0.9}
        depthScale={1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#07142c"
        metalness={0.6}
      />
    </mesh>
  );
}

function CameraMover({ entering }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const look = useRef(new THREE.Vector3(0, 0.2, 0));
  useFrame((_, dt) => {
    const aspect = size.width / size.height;
    // Pull back on narrow screens so neighbouring cards stay in view.
    const portrait = aspect < 1;
    const dist = RADIUS + (portrait ? 11.5 : 9.6);
    const goal = entering >= 0 ? new THREE.Vector3(0, 0.05, RADIUS + 1.9) : new THREE.Vector3(0, portrait ? 1.6 : 1.0, dist);
    const lookGoal = entering >= 0 ? new THREE.Vector3(0, 0.05, RADIUS) : new THREE.Vector3(0, portrait ? -1.0 : -0.95, 0);
    const k = 1 - Math.exp(-dt * (entering >= 0 ? 2.2 : 3));
    camera.position.lerp(goal, k);
    look.current.lerp(lookGoal, k);
    camera.lookAt(look.current);
  });
  return null;
}
