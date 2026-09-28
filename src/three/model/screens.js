// Content for the emissive screens in the Blender dioramas (materials named screen_*).
import * as THREE from "three";

const clock = { value: 0 };
let running = false;
function tick(now) {
  clock.value = now / 1000;
  requestAnimationFrame(tick);
}

function canvas(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.flipY = false; // glTF UVs
  t.anisotropy = 8;
  return t;
}

function gradient(ctx, w, h, a, b) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function bars(ctx, x, y, w, h, n, color, seed = 1) {
  let s = seed;
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    const v = 0.25 + (s / 233280) * 0.75;
    ctx.fillStyle = color;
    ctx.fillRect(x + (i * w) / n + 2, y + h * (1 - v), w / n - 4, h * v);
  }
}

function line(ctx, x, y, w, h, color, seed = 3) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  let s = seed;
  for (let i = 0; i <= 20; i++) {
    s = (s * 9301 + 49297) % 233280;
    const yy = y + h * (0.2 + (s / 233280) * 0.6);
    i ? ctx.lineTo(x + (i * w) / 20, yy) : ctx.moveTo(x, yy);
  }
  ctx.stroke();
}

function title(ctx, text, x, y, size, color = "#fff") {
  ctx.fillStyle = color;
  ctx.font = `700 ${size}px Prompt, sans-serif`;
  ctx.fillText(text, x, y);
}

function ecg(ctx, x, y, w, h, color, width = 4) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  for (let i = 0; i <= 120; i++) {
    const t = (i % 30) / 30;
    const v = t > 0.42 && t < 0.46 ? -1 : t > 0.46 && t < 0.5 ? 0.8 : t > 0.6 && t < 0.7 ? -0.25 : 0;
    const px = x + (i / 120) * w;
    const py = y + h / 2 + v * h * 0.45;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function donut(ctx, cx, cy, r, parts) {
  let a = -Math.PI / 2;
  parts.forEach(([v, c]) => {
    ctx.strokeStyle = c;
    ctx.lineWidth = r * 0.35;
    ctx.beginPath();
    ctx.arc(cx, cy, r, a, a + v * Math.PI * 2);
    ctx.stroke();
    a += v * Math.PI * 2;
  });
}

// round badge with a white glyph on a coloured disc (transparent outside the disc)
function badge(color, glyph) {
  return (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, w * 0.1, w / 2, h / 2, w / 2);
    g.addColorStop(0, color[0]);
    g.addColorStop(1, color[1]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 16;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    glyph(ctx, w, h);
  };
}

const DRAW = {
  media: (ctx, w, h) => {
    gradient(ctx, w, h, "#061a3a", "#1f5fd6");
    ctx.fillStyle = "rgba(94,231,255,0.18)";
    for (let i = 0; i < 12; i++) ctx.fillRect(w * 0.62 + i * 26, h * 0.85 - (40 + ((i * 53) % 150)), 18, 40 + ((i * 53) % 150));
    ctx.fillStyle = "#5ee7ff";
    ctx.font = "600 34px Prompt, sans-serif";
    ctx.fillText("TKC SMART SOLUTIONS", 44, 86);
    ctx.fillStyle = "#fff";
    ctx.font = "700 96px Prompt, sans-serif";
    ctx.fillText("SMART BUILDING", 38, 200);
    ctx.font = "400 36px Prompt, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillText("Energy · Security · Comfort", 44, 262);
  },
  totem: (ctx, w, h) => {
    gradient(ctx, w, h, "#0b2447", "#12386b");
    ctx.fillStyle = "#5ee7ff";
    ctx.font = "600 30px Prompt, sans-serif";
    ctx.fillText("WELCOME", 30, 70);
    ctx.fillStyle = "#fff";
    ctx.font = "700 54px Prompt, sans-serif";
    ctx.fillText("TKC", 30, 140);
    ctx.font = "400 26px Prompt, sans-serif";
    ["Café  G", "Retail  1", "Offices  2-5", "Sky garden  R"].forEach((t, i) => ctx.fillText(t, 30, 260 + i * 70));
    ctx.fillStyle = "rgba(94,231,255,0.25)";
    ctx.fillRect(30, 560, w - 60, 4);
  },
  parking: (ctx, w, h) => {
    ctx.fillStyle = "#050b14";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#4dff9a";
    ctx.font = "700 120px monospace";
    ctx.fillText("P    9", 30, 150); // free bays in the Smart Building car park
    ctx.font = "600 44px monospace";
    ctx.fillText("FREE", 36, 210);
  },
  bms: (ctx, w, h) => {
    ctx.fillStyle = "#07121f";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#5ee7ff";
    ctx.font = "600 28px sans-serif";
    ctx.fillText("BMS  ·  HVAC 22.5°C  ·  ENERGY -18%", 20, 40);
    bars(ctx, 20, 70, w * 0.45, h - 100, 10, "#1f8fff", 5);
    line(ctx, w * 0.52, 70, w * 0.44, h - 100, "#4dff9a", 7);
  },
  dashboard: (ctx, w, h) => {
    ctx.fillStyle = "#0a1624";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#12304d";
    ctx.fillRect(12, 12, w - 24, 34);
    bars(ctx, 16, 60, w * 0.46, h - 80, 8, "#3aa0ff", 11);
    line(ctx, w * 0.52, 60, w * 0.44, h - 80, "#5ee7ff", 13);
  },
  monitor: (ctx, w, h) => {
    gradient(ctx, w, h, "#dfe9f5", "#b8cce4");
    ctx.fillStyle = "#1f5fd6";
    ctx.fillRect(0, 0, w, 26);
    ctx.fillStyle = "rgba(20,40,70,0.35)";
    for (let i = 0; i < 6; i++) ctx.fillRect(20, 50 + i * 28, w * (0.4 + ((i * 37) % 50) / 100), 12);
  },
  ad: (ctx, w, h) => {
    gradient(ctx, w, h, "#ff8a3d", "#ffc15e");
    ctx.fillStyle = "#fff";
    ctx.font = "700 60px Prompt, sans-serif";
    ctx.fillText("SMART", 30, 120);
    ctx.fillText("CITY", 30, 190);
    ctx.font = "400 28px Prompt, sans-serif";
    ctx.fillText("TKC Services", 30, 260);
  },
  face: (ctx, w, h) => {
    ctx.fillStyle = "#07121f";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#4dff9a";
    ctx.lineWidth = 6;
    ctx.strokeRect(w * 0.2, h * 0.2, w * 0.6, h * 0.5);
    ctx.fillStyle = "#4dff9a";
    ctx.font = "600 30px sans-serif";
    ctx.fillText("VERIFIED", w * 0.18, h * 0.88);
  },
  // ---------------------------------------------------------------- Smart Hospital
  hsp_brand: (ctx, w, h) => {
    gradient(ctx, w, h, "#0a3fd6", "#19c3ff");
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    for (let i = 0; i < 9; i++) ctx.fillRect(w * 0.55 + i * 38, h * 0.1, 18, h * 0.8);
    roundRect(ctx, 60, h / 2 - 90, 180, 180, 36, "#fff");
    ctx.fillStyle = "#e0102a";
    ctx.fillRect(130, h / 2 - 65, 40, 130);
    ctx.fillRect(85, h / 2 - 20, 130, 40);
    title(ctx, "SMART HOSPITAL", 280, h / 2 + 5, 92);
    ctx.font = "400 40px Prompt, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText("Care · Data · AI · Safety", 286, h / 2 + 70);
  },
  hsp_data: (ctx, w, h) => {
    gradient(ctx, w, h, "#061a44", "#0b2f7a");
    title(ctx, "DATA ANALYTICS & KNOWLEDGE", 40, 70, 54, "#5ee7ff");
    const bands = ["#ff3b6b", "#ff9f1c", "#ffe14d", "#3ddc84", "#27b4ff", "#8b5cff"];
    bands.forEach((c, k) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(40, h - 40);
      for (let i = 0; i <= 20; i++) ctx.lineTo(40 + i * ((w * 0.55) / 20), h - 60 - k * 38 - Math.sin(i * 0.6 + k) * 22 - i * 4);
      ctx.lineTo(40 + w * 0.55, h - 40);
      ctx.fill();
    });
    ecg(ctx, w * 0.62, 110, w * 0.34, 120, "#3ddc84", 6);
    [["BEDS", "412", "#27b4ff"], ["WAIT", "8m", "#ffe14d"], ["AI ALERTS", "3", "#ff3b6b"]].forEach(([k, v, c], i) => {
      roundRect(ctx, w * 0.62 + i * (w * 0.115), 270, w * 0.105, 150, 18, "rgba(255,255,255,0.1)");
      ctx.fillStyle = c;
      ctx.font = "700 64px Prompt, sans-serif";
      ctx.fillText(v, w * 0.63 + i * (w * 0.115), 360);
      ctx.fillStyle = "#cfe8ff";
      ctx.font = "400 24px Prompt, sans-serif";
      ctx.fillText(k, w * 0.63 + i * (w * 0.115), 400);
    });
  },
  hsp_chart: (ctx, w, h) => {
    ctx.fillStyle = "#07183a";
    ctx.fillRect(0, 0, w, h);
    ["#ff3b6b", "#ffe14d", "#3ddc84", "#27b4ff", "#8b5cff", "#ff9f1c"].forEach((c, i) => {
      ctx.fillStyle = c;
      const v = 0.3 + ((i * 37) % 60) / 100;
      ctx.fillRect(20 + i * 38, h - 20 - v * (h - 60), 26, v * (h - 60));
    });
    ecg(ctx, 250, 30, w - 270, h - 60, "#5ee7ff", 3);
  },
  hsp_diag: (ctx, w, h) => {
    gradient(ctx, w, h, "#04203f", "#0b4d8f");
    title(ctx, "SMART DIAGNOSTICS & TREATMENT", 40, 66, 50, "#5ee7ff");
    for (let k = 0; k < 3; k++) {
      const cx = 150 + k * 250;
      const g = ctx.createRadialGradient(cx, 230, 10, cx, 230, 100);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.5, ["#ff6bd6", "#ffd24d", "#5ee7ff"][k]);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx, 230, 95, 110, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ecg(ctx, 40, h - 150, w * 0.6, 90, "#3ddc84", 5);
    ecg(ctx, w * 0.66, 120, w * 0.3, 90, "#ffd24d", 4);
    ecg(ctx, w * 0.66, 250, w * 0.3, 90, "#ff6bd6", 4);
    title(ctx, "AI: 98.6% match", w * 0.66, h - 70, 40, "#3ddc84");
  },
  hsp_scan: (ctx, w, h) => {
    ctx.fillStyle = "#020812";
    ctx.fillRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w * 0.4, h / 2, 8, w * 0.4, h / 2, h * 0.45);
    g.addColorStop(0, "#f0f6ff");
    g.addColorStop(0.6, "#6c86a8");
    g.addColorStop(1, "#020812");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(w * 0.4, h / 2, h * 0.34, h * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#5ee7ff";
    ctx.lineWidth = 4;
    ctx.strokeRect(w * 0.3, h * 0.3, w * 0.2, h * 0.3);
    ecg(ctx, w * 0.66, h * 0.3, w * 0.3, h * 0.4, "#3ddc84", 3);
  },
  xray: (ctx, w, h) => {
    ctx.fillStyle = "#050a10";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(230,240,255,0.85)";
    ctx.lineWidth = 8;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.ellipse(w / 2, 60 + i * 34, w * 0.34, 26, 0, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(230,240,255,0.8)";
    ctx.fillRect(w / 2 - 8, 30, 16, h - 60);
  },
  hsp_care: (ctx, w, h) => {
    gradient(ctx, w, h, "#067a5c", "#12c79a");
    title(ctx, "INTEGRATED PATIENT CARE", 40, 66, 52);
    ctx.fillStyle = "#ff3b6b";
    ctx.beginPath();
    ctx.moveTo(170, 330);
    ctx.bezierCurveTo(40, 240, 60, 130, 170, 170);
    ctx.bezierCurveTo(280, 130, 300, 240, 170, 330);
    ctx.fill();
    ecg(ctx, 340, 170, w - 380, 120, "#fff", 6);
    [["HR", "72"], ["SpO2", "98%"], ["BP", "118/76"], ["TEMP", "36.8"]].forEach(([k, v], i) => {
      roundRect(ctx, 340 + i * ((w - 380) / 4), 320, (w - 380) / 4 - 16, 110, 16, "rgba(255,255,255,0.18)");
      ctx.fillStyle = "#fff";
      ctx.font = "700 46px Prompt, sans-serif";
      ctx.fillText(v, 356 + i * ((w - 380) / 4), 380);
      ctx.font = "400 24px Prompt, sans-serif";
      ctx.fillText(k, 356 + i * ((w - 380) / 4), 416);
    });
  },
  vitals: (ctx, w, h) => {
    ctx.fillStyle = "#020a08";
    ctx.fillRect(0, 0, w, h);
    ecg(ctx, 10, 20, w * 0.65, h * 0.35, "#3ddc84", 4);
    ecg(ctx, 10, h * 0.45, w * 0.65, h * 0.3, "#ffd24d", 3);
    ctx.font = "700 44px monospace";
    ctx.fillStyle = "#3ddc84";
    ctx.fillText("72", w * 0.72, 60);
    ctx.fillStyle = "#5ee7ff";
    ctx.fillText("98", w * 0.72, 120);
    ctx.fillStyle = "#ff6bd6";
    ctx.font = "700 30px monospace";
    ctx.fillText("118/76", w * 0.7, 170);
  },
  hsp_mgmt: (ctx, w, h) => {
    ctx.fillStyle = "rgba(4,40,90,0.92)";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#5ee7ff";
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, w - 8, h - 8);
    title(ctx, "HOSPITAL MANAGEMENT", 24, 50, 34, "#5ee7ff");
    donut(ctx, 110, 170, 60, [[0.45, "#3ddc84"], [0.3, "#ffd24d"], [0.25, "#ff3b6b"]]);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) roundRect(ctx, 220 + c * 50, 90 + r * 40, 42, 32, 6, (r * 5 + c) % 7 === 0 ? "#ff9f1c" : "rgba(94,231,255,0.35)");
  },
  kiosk: (ctx, w, h) => {
    gradient(ctx, w, h, "#ffffff", "#dff1ff");
    ctx.fillStyle = "#0a3fd6";
    ctx.fillRect(0, 0, w, 70);
    title(ctx, "Welcome", 20, 50, 34);
    [["Check-in", "#12b886"], ["Appointment", "#1c7ed6"], ["Pay bill", "#f76707"], ["Find my way", "#d6336c"]].forEach(([t, c], i) => {
      roundRect(ctx, 20, 100 + i * 105, w - 40, 88, 16, c);
      title(ctx, t, 40, 158 + i * 105, 32);
    });
  },
  queue: (ctx, w, h) => {
    ctx.fillStyle = "#061433";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#ffd24d";
    ctx.font = "600 34px Prompt, sans-serif";
    ctx.fillText("NOW SERVING", 24, 50);
    ctx.fillStyle = "#fff";
    ctx.font = "700 96px Prompt, sans-serif";
    ctx.fillText("A-021", 24, 150);
    ctx.fillStyle = "#3ddc84";
    ctx.font = "600 34px Prompt, sans-serif";
    ctx.fillText("Counter 3  →", 24, 205);
  },
  tele: (ctx, w, h) => {
    gradient(ctx, w, h, "#0b3d91", "#1db4e8");
    ctx.fillStyle = "#ffe0c2";
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.42, h * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.95, h * 0.36, h * 0.3, 0, Math.PI, 0);
    ctx.fill();
    roundRect(ctx, w / 2 - 110, h - 60, 90, 44, 22, "#12b886");
    roundRect(ctx, w / 2 + 20, h - 60, 90, 44, 22, "#e03131");
    title(ctx, "Dr. On Call", 16, 40, 28);
  },
  cafe: (ctx, w, h) => {
    ctx.fillStyle = "#2b1a12";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#ff9f1c";
    ctx.fillRect(0, 0, w, 80);
    title(ctx, "CAFÉ", 24, 58, 48);
    [["Latte", "65"], ["Green tea", "55"], ["Smoothie", "75"], ["Sandwich", "89"], ["Salad", "95"]].forEach(([t, p], i) => {
      ctx.fillStyle = "#fff";
      ctx.font = "500 30px Prompt, sans-serif";
      ctx.fillText(t, 24, 140 + i * 56);
      ctx.fillStyle = "#ffd24d";
      ctx.fillText(p, w - 80, 140 + i * 56);
    });
  },
  icon_cross: badge(["#ff5a6e", "#d9102a"], (ctx, w, h) => {
    ctx.fillRect(w / 2 - 22, h * 0.24, 44, h * 0.52);
    ctx.fillRect(w * 0.24, h / 2 - 22, w * 0.52, 44);
  }),
  icon_heart: badge(["#ff7eb3", "#e0115f"], (ctx, w, h) => {
    ctx.beginPath();
    ctx.moveTo(w / 2, h * 0.74);
    ctx.bezierCurveTo(w * 0.18, h * 0.52, w * 0.28, h * 0.24, w / 2, h * 0.38);
    ctx.bezierCurveTo(w * 0.72, h * 0.24, w * 0.82, h * 0.52, w / 2, h * 0.74);
    ctx.fill();
  }),
  icon_calendar: badge(["#5ab8ff", "#0a58d6"], (ctx, w, h) => {
    ctx.strokeRect(w * 0.28, h * 0.3, w * 0.44, h * 0.42);
    ctx.fillRect(w * 0.28, h * 0.3, w * 0.44, h * 0.1);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) ctx.fillRect(w * (0.33 + c * 0.12), h * (0.46 + r * 0.12), w * 0.07, h * 0.07);
  }),
  icon_chart: badge(["#b58bff", "#6a2be0"], (ctx, w, h) => {
    [0.3, 0.5, 0.4, 0.6].forEach((v, i) => ctx.fillRect(w * (0.28 + i * 0.12), h * (0.72 - v * 0.7), w * 0.08, h * v * 0.7));
  }),
  icon_pulse: badge(["#5ef0c2", "#0aa67a"], (ctx, w, h) => {
    ctx.beginPath();
    ctx.moveTo(w * 0.22, h / 2);
    ctx.lineTo(w * 0.4, h / 2);
    ctx.lineTo(w * 0.48, h * 0.3);
    ctx.lineTo(w * 0.56, h * 0.7);
    ctx.lineTo(w * 0.62, h / 2);
    ctx.lineTo(w * 0.78, h / 2);
    ctx.stroke();
  }),
  // ---------------------------------------------------------------- Smart Learning
  lrn_adaptive: (ctx, w, h) => {
    gradient(ctx, w, h, "#1b1464", "#1c7ed6");
    roundRect(ctx, 40, 40, w * 0.46, h - 80, 28, "#2f2bb8");
    ctx.save();
    ctx.translate(90, h * 0.62);
    ctx.rotate(-0.35);
    title(ctx, "Adaptive", 0, 0, 96);
    title(ctx, "learning", 60, 96, 96);
    ctx.restore();
    const petals = ["#ffd43b", "#ffa94d", "#ff6b6b", "#f06595", "#cc5de8", "#5c7cfa", "#22b8cf", "#51cf66"];
    petals.forEach((c, i) => {
      const a = (i / petals.length) * Math.PI * 2;
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.ellipse(w * 0.74 + Math.cos(a) * 70, h * 0.5 + Math.sin(a) * 70, 70, 34, a, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#6b3f14";
    ctx.beginPath();
    ctx.arc(w * 0.74, h * 0.5, 54, 0, Math.PI * 2);
    ctx.fill();
    title(ctx, "AI · personalised path", w * 0.56, h - 50, 34, "#9ee7ff");
  },
  lrn_wheel: (ctx, w, h) => {
    ctx.fillStyle = "#0b1a3a";
    ctx.fillRect(0, 0, w, h);
    const cols = ["#ff6b6b", "#ffa94d", "#ffd43b", "#94d82d", "#38d9a9", "#22b8cf", "#4dabf7", "#748ffc", "#b197fc", "#f783ac"];
    for (let ring = 0; ring < 4; ring++) {
      cols.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.globalAlpha = 1 - ring * 0.18;
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2);
        ctx.arc(w / 2, h / 2, w * (0.44 - ring * 0.09), (i / cols.length) * Math.PI * 2, ((i + 0.92) / cols.length) * Math.PI * 2);
        ctx.fill();
      });
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#0b1a3a";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.1, 0, Math.PI * 2);
    ctx.fill();
  },
  lrn_ar: (ctx, w, h) => {
    gradient(ctx, w, h, "#0b3d91", "#15aabf");
    title(ctx, "AR", 30, 90, 90);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 6;
    const cx = w * 0.62, cy = h * 0.52, s = h * 0.28;
    ctx.beginPath();
    ctx.moveTo(cx, cy - s);
    ctx.lineTo(cx + s, cy - s / 2);
    ctx.lineTo(cx + s, cy + s / 2);
    ctx.lineTo(cx, cy + s);
    ctx.lineTo(cx - s, cy + s / 2);
    ctx.lineTo(cx - s, cy - s / 2);
    ctx.closePath();
    ctx.moveTo(cx - s, cy - s / 2);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + s, cy - s / 2);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy + s);
    ctx.stroke();
  },
  tablet: (ctx, w, h) => {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, w, h);
    gradient(ctx, w, h, "#4dabf7", "#b197fc");
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 16;
    ctx.strokeRect(0, 0, w, h);
    ["#ff6b6b", "#ffd43b", "#51cf66", "#fff"].forEach((c, i) => roundRect(ctx, 30 + (i % 2) * 120, 30 + Math.floor(i / 2) * 80, 100, 64, 12, c));
  },
  laptop: (ctx, w, h) => {
    ctx.fillStyle = "#f1f3f5";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#5f3dc4";
    ctx.fillRect(0, 0, w, 40);
    title(ctx, "LMS", 12, 30, 26);
    [["#51cf66", 0.8], ["#ffd43b", 0.55], ["#ff6b6b", 0.35]].forEach(([c, v], i) => {
      roundRect(ctx, 20, 60 + i * 50, w - 40, 32, 8, "#dee2e6");
      roundRect(ctx, 20, 60 + i * 50, (w - 40) * v, 32, 8, c);
    });
  },
  imac: (ctx, w, h) => {
    ctx.fillStyle = "#1e1e2e";
    ctx.fillRect(0, 0, w, h);
    const code = ["#cba6f7", "#89b4fa", "#a6e3a1", "#f9e2af", "#f38ba8"];
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = code[i % code.length];
      ctx.fillRect(20 + (i % 3) * 14, 20 + i * 22, 60 + ((i * 53) % 160), 12);
    }
    roundRect(ctx, w * 0.62, 20, w * 0.34, h - 40, 10, "#313244");
    ctx.fillStyle = "#a6e3a1";
    ctx.beginPath();
    ctx.arc(w * 0.79, h * 0.45, 36, 0, Math.PI * 2);
    ctx.fill();
  },
  lrn_lms: (ctx, w, h) => {
    gradient(ctx, w, h, "#e7f5ff", "#d0ebff");
    ctx.fillStyle = "#1c7ed6";
    ctx.fillRect(0, 0, w, 70);
    title(ctx, "Cloud LMS · My courses", 24, 48, 36);
    [["AI Basics", "#7950f2", 0.8], ["Data Science", "#12b886", 0.55], ["Cyber Safety", "#f76707", 0.3], ["Design", "#e64980", 0.65]].forEach(([t, c, v], i) => {
      roundRect(ctx, 24 + (i % 2) * (w / 2 - 12), 100 + Math.floor(i / 2) * 150, w / 2 - 36, 130, 18, "#fff");
      roundRect(ctx, 24 + (i % 2) * (w / 2 - 12), 100 + Math.floor(i / 2) * 150, w / 2 - 36, 40, 18, c);
      ctx.fillStyle = "#212529";
      ctx.font = "600 30px Prompt, sans-serif";
      ctx.fillText(t, 44 + (i % 2) * (w / 2 - 12), 176 + Math.floor(i / 2) * 150);
      roundRect(ctx, 44 + (i % 2) * (w / 2 - 12), 196 + Math.floor(i / 2) * 150, (w / 2 - 76) * v, 14, 7, c);
    });
  },
  lrn_exam: (ctx, w, h) => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#f76707";
    ctx.fillRect(0, 0, w, 44);
    title(ctx, "Assessment 12 / 40", 12, 32, 24);
    ["A", "B", "C", "D"].forEach((t, i) => {
      roundRect(ctx, 20, 60 + i * 44, w - 40, 34, 8, i === 2 ? "#51cf66" : "#e9ecef");
      ctx.fillStyle = "#212529";
      ctx.font = "600 22px Prompt, sans-serif";
      ctx.fillText(t, 32, 84 + i * 44);
    });
  },
  lrn_cert: (ctx, w, h) => {
    gradient(ctx, w, h, "#fff9db", "#ffe8cc");
    ctx.strokeStyle = "#e8590c";
    ctx.lineWidth = 12;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    title(ctx, "CERTIFICATE", w * 0.18, 110, 72, "#5f3dc4");
    ctx.fillStyle = "#495057";
    ctx.font = "400 30px Prompt, sans-serif";
    ctx.fillText("Professional Skills · Level 3", w * 0.2, 170);
    ctx.fillStyle = "#fab005";
    ctx.beginPath();
    ctx.arc(w * 0.82, h * 0.68, 64, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e8590c";
    ctx.fillRect(w * 0.79, h * 0.68 + 50, 22, 70);
    ctx.fillRect(w * 0.83, h * 0.68 + 50, 22, 70);
    title(ctx, "PASSED ✓", w * 0.1, h * 0.8, 54, "#2b8a3e");
  },
  lrn_iot: (ctx, w, h) => {
    ctx.fillStyle = "#0b1a3a";
    ctx.fillRect(0, 0, w, h);
    [["24°C", "#4dabf7"], ["CO₂ 450", "#51cf66"], ["LUX 520", "#ffd43b"]].forEach(([t, c], i) => {
      ctx.fillStyle = c;
      ctx.font = "700 44px Prompt, sans-serif";
      ctx.fillText(t, 24, 64 + i * 64);
    });
  },
  icon_cloud: badge(["#74c0fc", "#1971c2"], (ctx, w, h) => {
    ctx.beginPath();
    ctx.arc(w * 0.4, h * 0.56, w * 0.13, 0, Math.PI * 2);
    ctx.arc(w * 0.55, h * 0.47, w * 0.16, 0, Math.PI * 2);
    ctx.arc(w * 0.66, h * 0.58, w * 0.11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(w * 0.3, h * 0.56, w * 0.44, h * 0.13);
  }),
  icon_brain: badge(["#e599f7", "#9c36b5"], (ctx, w, h) => {
    ctx.beginPath();
    ctx.ellipse(w * 0.43, h / 2, w * 0.15, h * 0.2, 0, 0, Math.PI * 2);
    ctx.ellipse(w * 0.57, h / 2, w * 0.15, h * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#9c36b5";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(w / 2, h * 0.32);
    ctx.lineTo(w / 2, h * 0.68);
    ctx.stroke();
  }),
  icon_award: badge(["#ffd43b", "#f08c00"], (ctx, w, h) => {
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.42, w * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(w * 0.4, h * 0.55, w * 0.07, h * 0.22);
    ctx.fillRect(w * 0.53, h * 0.55, w * 0.07, h * 0.22);
  }),
  icon_wifi: badge(["#63e6be", "#0ca678"], (ctx, w, h) => {
    [0.3, 0.2, 0.1].forEach((r) => {
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.66, w * r, Math.PI * 1.25, Math.PI * 1.75);
      ctx.stroke();
    });
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.66, 12, 0, Math.PI * 2);
    ctx.fill();
  }),
  // ---------------------------------------------------------------- Smart Logistics
  scan: (ctx, w, h) => {
    ctx.fillStyle = "#0b1f33";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 38; i++) ctx.fillRect(30 + i * 9, 30, (i * 7) % 3 === 0 ? 5 : 2, 90);
    ctx.fillStyle = "#51cf66";
    ctx.font = "700 40px Prompt, sans-serif";
    ctx.fillText("SCANNED ✓", 30, 170);
    ctx.fillStyle = "#9ec5fe";
    ctx.font = "400 26px monospace";
    ctx.fillText("PKG 8841-2207  1.2 kg", 30, 215);
  },
  volume: (ctx, w, h) => {
    ctx.fillStyle = "#0b1f33";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#5ee7ff";
    ctx.lineWidth = 4;
    const x = 40, y = 70, s = 90;
    ctx.strokeRect(x, y + 30, s, s);
    ctx.strokeRect(x + 40, y, s, s);
    [[0, 0], [s, 0], [0, s], [s, s]].forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(x + dx, y + 30 + dy);
      ctx.lineTo(x + 40 + dx, y + dy);
      ctx.stroke();
    });
    ctx.fillStyle = "#fff";
    ctx.font = "700 40px Prompt, sans-serif";
    ctx.fillText("2.36 m³", 220, 110);
    ctx.fillStyle = "#ffd43b";
    ctx.fillText("412 kg", 220, 170);
    ctx.fillStyle = "#51cf66";
    ctx.font = "600 26px Prompt, sans-serif";
    ctx.fillText("Fits: Truck 2 · 78%", 220, 220);
  },
  route: (ctx, w, h) => {
    ctx.fillStyle = "#e9f2fb";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#c5d6e8";
    ctx.lineWidth = 3;
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (i * h) / 12 + 10);
      ctx.lineTo(w, (i * h) / 12 - 30);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo((i * w) / 12, 0);
      ctx.lineTo((i * w) / 12 + 40, h);
      ctx.stroke();
    }
    [["#1c7ed6", 0.1], ["#f76707", 0.35], ["#2f9e44", 0.62]].forEach(([c, o]) => {
      ctx.strokeStyle = c;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(w * 0.08, h * 0.8);
      for (let k = 1; k <= 5; k++) ctx.lineTo(w * (0.08 + k * 0.17), h * (0.8 - Math.sin(k + o * 9) * 0.25 - o));
      ctx.stroke();
    });
    ctx.fillStyle = "#212529";
    ctx.font = "700 44px Prompt, sans-serif";
    ctx.fillText("ROUTE OPTIMIZATION", 30, 60);
    ctx.fillStyle = "#1c7ed6";
    ctx.font = "600 30px Prompt, sans-serif";
    ctx.fillText("ETA −18 min · Fuel −12%", 30, 104);
  },
  route_small: (ctx, w, h) => {
    ctx.fillStyle = "#e9f2fb";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#f76707";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(20, h - 30);
    ctx.bezierCurveTo(w * 0.3, 20, w * 0.6, h, w - 20, 30);
    ctx.stroke();
    ctx.fillStyle = "#1c7ed6";
    ctx.beginPath();
    ctx.arc(w - 20, 30, 14, 0, Math.PI * 2);
    ctx.fill();
  },
  fleet: (ctx, w, h) => {
    ctx.fillStyle = "#0b1f33";
    ctx.fillRect(0, 0, w, h);
    [["TRK-01", "On route", "#51cf66"], ["TRK-02", "Loading", "#ffd43b"], ["VAN-07", "Delivered", "#74c0fc"], ["VAN-09", "Delayed", "#ff8787"]].forEach(([id, st, c], i) => {
      ctx.fillStyle = "#e7f5ff";
      ctx.font = "600 26px monospace";
      ctx.fillText(id, 20, 44 + i * 58);
      ctx.fillStyle = c;
      ctx.fillText(st, 180, 44 + i * 58);
    });
  },
  dock: (ctx, w, h) => {
    ctx.fillStyle = "#0b1f33";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#fff";
    ctx.font = "700 40px Prompt, sans-serif";
    ctx.fillText("DOCK · LOADING", 20, 56);
    roundRect(ctx, 20, 90, w - 40, 44, 12, "#233a52");
    roundRect(ctx, 20, 90, (w - 40) * 0.78, 44, 12, "#51cf66");
    ctx.fillStyle = "#fff";
    ctx.font = "700 32px Prompt, sans-serif";
    ctx.fillText("78%", w - 110, 124);
  },
  pos: (ctx, w, h) => {
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#1864ab";
    ctx.fillRect(0, 0, w, 56);
    title(ctx, "POS", 20, 42, 34);
    [["Parcel pickup", "0.00"], ["Box M", "35.00"], ["Tape", "19.00"]].forEach(([t, p], i) => {
      ctx.fillStyle = "#343a40";
      ctx.font = "500 26px Prompt, sans-serif";
      ctx.fillText(t, 24, 100 + i * 42);
      ctx.fillText(p, w - 110, 100 + i * 42);
    });
    ["#e64980", "#7950f2", "#15aabf", "#40c057"].forEach((c, i) => roundRect(ctx, 20 + i * ((w - 40) / 4), h - 70, (w - 40) / 4 - 10, 50, 10, c));
    ctx.fillStyle = "#212529";
    ctx.font = "700 30px Prompt, sans-serif";
    ctx.fillText("TOTAL  54.00", 24, h - 90);
  },
  locker: (ctx, w, h) => {
    gradient(ctx, w, h, "#1c7ed6", "#15aabf");
    title(ctx, "Smart", 20, 70, 44);
    title(ctx, "Locker", 20, 118, 44);
    ctx.fillStyle = "#fff";
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) roundRect(ctx, 20 + c * 70, 160 + r * 60, 60, 50, 8, (r * 3 + c) % 4 === 1 ? "#ffd43b" : "rgba(255,255,255,0.8)");
  },
  icon_scan: badge(["#74c0fc", "#1864ab"], (ctx, w, h) => {
    for (let i = 0; i < 7; i++) ctx.fillRect(w * 0.3 + i * w * 0.06, h * 0.32, i % 2 ? w * 0.02 : w * 0.035, h * 0.36);
  }),
  icon_box: badge(["#ffc078", "#d9480f"], (ctx, w, h) => {
    ctx.fillRect(w * 0.3, h * 0.38, w * 0.4, h * 0.34);
    ctx.fillStyle = "#d9480f";
    ctx.fillRect(w * 0.47, h * 0.38, w * 0.06, h * 0.34);
  }),
  icon_route: badge(["#8ce99a", "#2b8a3e"], (ctx, w, h) => {
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.42, w * 0.13, Math.PI, 0);
    ctx.lineTo(w / 2, h * 0.75);
    ctx.closePath();
    ctx.fill();
  }),
  icon_truck: badge(["#66d9e8", "#0c8599"], (ctx, w, h) => {
    ctx.fillRect(w * 0.24, h * 0.36, w * 0.34, h * 0.26);
    ctx.fillRect(w * 0.58, h * 0.45, w * 0.16, h * 0.17);
    [0.34, 0.64].forEach((x) => {
      ctx.beginPath();
      ctx.arc(w * x, h * 0.66, w * 0.06, 0, Math.PI * 2);
      ctx.fill();
    });
  }),
  icon_cart: badge(["#b197fc", "#5f3dc4"], (ctx, w, h) => {
    ctx.beginPath();
    ctx.moveTo(w * 0.24, h * 0.34);
    ctx.lineTo(w * 0.32, h * 0.34);
    ctx.lineTo(w * 0.4, h * 0.6);
    ctx.lineTo(w * 0.72, h * 0.6);
    ctx.lineTo(w * 0.76, h * 0.42);
    ctx.lineTo(w * 0.35, h * 0.42);
    ctx.stroke();
    [0.44, 0.68].forEach((x) => {
      ctx.beginPath();
      ctx.arc(w * x, h * 0.7, w * 0.04, 0, Math.PI * 2);
      ctx.fill();
    });
  }),
  // ---------------------------------------------------------------- Smart Cables
  diag: (ctx, w, h) => {
    ctx.fillStyle = "#0b1f33";
    ctx.fillRect(0, 0, w, h);
    title(ctx, "CABLE DIAGNOSTICS", 22, 44, 30, "#5ee7ff");
    [["FO-07  Fibre", "−3.1 dB", "#ffd43b"], ["CU-12  Copper", "OK", "#51cf66"], ["PW-03  Power", "OK", "#51cf66"], ["FO-21  Fibre", "OK", "#51cf66"]].forEach(([id, st, c], i) => {
      ctx.fillStyle = "#e7f5ff";
      ctx.font = "500 24px monospace";
      ctx.fillText(id, 22, 92 + i * 40);
      ctx.fillStyle = c;
      ctx.font = "700 24px Prompt, sans-serif";
      ctx.fillText(st, w - 130, 92 + i * 40);
    });
    bars(ctx, 22, h - 56, w - 44, 40, 16, "#339af0", 5);
  },
  iot: (ctx, w, h) => {
    gradient(ctx, w, h, "#0b1f33", "#1c3d5a");
    title(ctx, "IoT CABLE NODE", 20, 46, 32);
    roundRect(ctx, 20, 70, 150, 44, 22, "#2b8a3e");
    title(ctx, "ONLINE", 42, 102, 26);
    ctx.fillStyle = "#e7f5ff";
    ctx.font = "500 26px Prompt, sans-serif";
    ctx.fillText("Links 128 · Faults 0", 20, 160);
    ctx.fillText("Cabinet 31 °C", 20, 198);
    line(ctx, 20, 210, w - 40, 70, "#5ee7ff", 7);
  },
  icon_cable: badge(["#ffc078", "#e8590c"], (ctx, w, h) => {
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.22, 0, Math.PI * 2);
    ctx.stroke();
    [0, 1, 2].forEach((k) => {
      const a = -Math.PI / 2 + (k * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.arc(w / 2 + Math.cos(a) * w * 0.09, h / 2 + Math.sin(a) * w * 0.09, w * 0.05, 0, Math.PI * 2);
      ctx.fill();
    });
  }),
  icon_plug: badge(["#74c0fc", "#1864ab"], (ctx, w, h) => {
    ctx.fillRect(w * 0.36, h * 0.36, w * 0.28, h * 0.2);
    ctx.fillRect(w * 0.41, h * 0.24, w * 0.05, h * 0.12);
    ctx.fillRect(w * 0.54, h * 0.24, w * 0.05, h * 0.12);
    ctx.beginPath();
    ctx.moveTo(w / 2, h * 0.56);
    ctx.quadraticCurveTo(w / 2, h * 0.74, w * 0.66, h * 0.76);
    ctx.stroke();
  }),
  // ---------------------------------------------------------------- Autonomous
  sec: (ctx, w, h) => {
    ctx.fillStyle = "#07121f";
    ctx.fillRect(0, 0, w, h);
    const cols = 4;
    const rows = 2;
    const cw = (w - 30) / cols;
    const ch = (h - 70) / rows;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const x = 10 + c * (cw + 3);
        const y = 60 + r * (ch + 3);
        ctx.fillStyle = ["#1d3b57", "#23445f", "#1a3550"][(r + c) % 3];
        ctx.fillRect(x, y, cw, ch);
        ctx.strokeStyle = (r * cols + c) % 5 === 2 ? "#ff6b6b" : "#5ee7ff";
        ctx.lineWidth = 4;
        ctx.strokeRect(x + cw * 0.35, y + ch * 0.25, cw * 0.25, ch * 0.5);
      }
    title(ctx, "SECURITY · LIVE", 18, 42, 30, "#5ee7ff");
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.arc(w - 40, 32, 10, 0, Math.PI * 2);
    ctx.fill();
  },
  v2x: (ctx, w, h) => {
    gradient(ctx, w, h, "#0b1f33", "#15406b");
    title(ctx, "C-V2X", 24, 58, 48, "#5ee7ff");
    ["V2V", "V2I", "V2N", "V2P"].forEach((t, i) => {
      roundRect(ctx, 24 + i * 118, 86, 104, 50, 12, ["#1c7ed6", "#0ca678", "#7048e8", "#f08c00"][i]);
      title(ctx, t, 44 + i * 118, 122, 28);
    });
    ctx.fillStyle = "#e7f5ff";
    ctx.font = "500 26px Prompt, sans-serif";
    ctx.fillText("Latency 8 ms · 42 vehicles", 24, 186);
    line(ctx, 24, 196, w - 48, 50, "#5ee7ff", 11);
  },
  chest: (ctx, w, h) => {
    gradient(ctx, w, h, "#1971c2", "#15aabf");
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.4, h * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1971c2";
    ctx.beginPath();
    ctx.arc(w * 0.42, h * 0.36, h * 0.04, 0, Math.PI * 2);
    ctx.arc(w * 0.58, h * 0.36, h * 0.04, 0, Math.PI * 2);
    ctx.fill();
    title(ctx, "Hello! May I help?", w * 0.1, h * 0.86, h * 0.1);
  },
  factory: (ctx, w, h) => {
    ctx.fillStyle = "#0b1f33";
    ctx.fillRect(0, 0, w, h);
    title(ctx, "PRODUCTION LINE", 24, 50, 38, "#ffa94d");
    bars(ctx, 24, 80, w * 0.45, h - 110, 10, "#ffa94d", 9);
    donut(ctx, w * 0.72, h * 0.55, h * 0.26, [[0.87, "#51cf66"], [0.13, "#233a52"]]);
    title(ctx, "OEE 87%", w * 0.62, h * 0.58, 30);
  },
  charge: (ctx, w, h) => {
    gradient(ctx, w, h, "#0b3d2e", "#0ca678");
    title(ctx, "⚡ 78%", 20, h * 0.55, h * 0.3);
    roundRect(ctx, 20, h * 0.7, w - 40, h * 0.14, 8, "rgba(255,255,255,0.25)");
    roundRect(ctx, 20, h * 0.7, (w - 40) * 0.78, h * 0.14, 8, "#fff");
  },
  icon_car: badge(["#74c0fc", "#1864ab"], (ctx, w, h) => {
    ctx.beginPath();
    ctx.moveTo(w * 0.24, h * 0.6);
    ctx.lineTo(w * 0.3, h * 0.44);
    ctx.lineTo(w * 0.42, h * 0.36);
    ctx.lineTo(w * 0.62, h * 0.36);
    ctx.lineTo(w * 0.72, h * 0.46);
    ctx.lineTo(w * 0.76, h * 0.6);
    ctx.closePath();
    ctx.fill();
    [0.36, 0.64].forEach((x) => {
      ctx.beginPath();
      ctx.arc(w * x, h * 0.62, w * 0.06, 0, Math.PI * 2);
      ctx.fill();
    });
  }),
  icon_arm: badge(["#ffc078", "#e8590c"], (ctx, w, h) => {
    ctx.fillRect(w * 0.3, h * 0.7, w * 0.3, h * 0.06);
    ctx.beginPath();
    ctx.moveTo(w * 0.42, h * 0.7);
    ctx.lineTo(w * 0.42, h * 0.5);
    ctx.lineTo(w * 0.62, h * 0.32);
    ctx.lineTo(w * 0.7, h * 0.44);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w * 0.42, h * 0.5, w * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }),
  icon_robot: badge(["#63e6be", "#087f5b"], (ctx, w, h) => {
    ctx.beginPath();
    ctx.roundRect(w * 0.32, h * 0.3, w * 0.36, h * 0.3, 18);
    ctx.fill();
    ctx.fillStyle = "#087f5b";
    ctx.beginPath();
    ctx.arc(w * 0.43, h * 0.45, w * 0.04, 0, Math.PI * 2);
    ctx.arc(w * 0.57, h * 0.45, w * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(w * 0.49, h * 0.2, w * 0.02, h * 0.1);
    ctx.fillRect(w * 0.38, h * 0.62, w * 0.24, h * 0.14);
  }),
  icon_shield: badge(["#ffb35e", "#f06a00"], (ctx, w, h) => {
    ctx.beginPath();
    ctx.moveTo(w / 2, h * 0.24);
    ctx.lineTo(w * 0.72, h * 0.33);
    ctx.quadraticCurveTo(w * 0.72, h * 0.64, w / 2, h * 0.78);
    ctx.quadraticCurveTo(w * 0.28, h * 0.64, w * 0.28, h * 0.33);
    ctx.closePath();
    ctx.fill();
  }),
};

const PICK = [
  ["screen_media", "media", 1024, 420],
  ["screen_totem", "totem", 360, 900],
  ["screen_parking", "parking", 512, 230],
  ["screen_bms", "bms", 640, 400],
  ["screen_monitor", "monitor", 256, 160],
  ["screen_ad", "ad", 360, 560],
  ["screen_face", "face", 256, 360],
  ["screen_vw", "dashboard", 512, 288],
  ["screen_meeting", "dashboard", 512, 288],
  ["screen_hsp_brand", "hsp_brand", 1024, 384],
  ["screen_hsp_data", "hsp_data", 1024, 460],
  ["screen_hsp_chart", "hsp_chart", 512, 300],
  ["screen_hsp_diag", "hsp_diag", 1024, 480],
  ["screen_hsp_scan", "hsp_scan", 512, 300],
  ["screen_xray", "xray", 256, 300],
  ["screen_hsp_care", "hsp_care", 1024, 460],
  ["screen_vitals", "vitals", 384, 256],
  ["screen_hsp_mgmt", "hsp_mgmt", 512, 300],
  ["screen_kiosk", "kiosk", 320, 520],
  ["screen_queue", "queue", 420, 240],
  ["screen_tele", "tele", 480, 320],
  ["screen_cafe", "cafe", 384, 480],
  ["screen_icon_cross", "icon_cross", 256, 256],
  ["screen_icon_heart", "icon_heart", 256, 256],
  ["screen_icon_calendar", "icon_calendar", 256, 256],
  ["screen_icon_chart", "icon_chart", 256, 256],
  ["screen_icon_pulse", "icon_pulse", 256, 256],
  ["screen_icon_shield", "icon_shield", 256, 256],
  ["screen_lrn_adaptive", "lrn_adaptive", 1024, 528],
  ["screen_lrn_wheel", "lrn_wheel", 512, 512],
  ["screen_lrn_ar", "lrn_ar", 512, 440],
  ["screen_tablet", "tablet", 256, 176],
  ["screen_laptop", "laptop", 256, 200],
  ["screen_imac", "imac", 384, 220],
  ["screen_lrn_lms", "lrn_lms", 768, 432],
  ["screen_lrn_exam", "lrn_exam", 256, 240],
  ["screen_lrn_cert", "lrn_cert", 768, 448],
  ["screen_lrn_iot", "lrn_iot", 300, 200],
  ["screen_icon_cloud", "icon_cloud", 256, 256],
  ["screen_icon_brain", "icon_brain", 256, 256],
  ["screen_icon_award", "icon_award", 256, 256],
  ["screen_icon_wifi", "icon_wifi", 256, 256],
  ["screen_scan", "scan", 400, 240],
  ["screen_volume", "volume", 480, 280],
  ["screen_route_small", "route_small", 256, 160],
  ["screen_route", "route", 1024, 260],
  ["screen_fleet", "fleet", 320, 240],
  ["screen_dock", "dock", 400, 160],
  ["screen_pos", "pos", 400, 300],
  ["screen_locker", "locker", 256, 420],
  ["screen_icon_scan", "icon_scan", 256, 256],
  ["screen_icon_box", "icon_box", 256, 256],
  ["screen_icon_route", "icon_route", 256, 256],
  ["screen_icon_truck", "icon_truck", 256, 256],
  ["screen_icon_cart", "icon_cart", 256, 256],
  ["screen_diag", "diag", 480, 300],
  ["screen_iot", "iot", 400, 300],
  ["screen_icon_cable", "icon_cable", 256, 256],
  ["screen_icon_plug", "icon_plug", 256, 256],
  ["screen_sec", "sec", 640, 300],
  ["screen_v2x", "v2x", 512, 256],
  ["screen_chest", "chest", 300, 240],
  ["screen_factory", "factory", 640, 210],
  ["screen_charge", "charge", 256, 180],
  ["screen_icon_car", "icon_car", 256, 256],
  ["screen_icon_arm", "icon_arm", 256, 256],
  ["screen_icon_robot", "icon_robot", 256, 256],
];

const cache = {};

export function screenMaterial(name) {
  if (!running) {
    running = true;
    requestAnimationFrame(tick);
  }
  const entry = PICK.find(([prefix]) => name.startsWith(prefix)) || ["", "dashboard", 512, 288];
  const key = entry[1];
  if (!cache[key] && key.startsWith("icon")) {
    // floating badges: round, see-through outside the disc, no scan sweep
    cache[key] = new THREE.MeshBasicMaterial({ map: canvas(entry[2], entry[3], DRAW[key]), transparent: true, alphaTest: 0.05, side: THREE.DoubleSide, toneMapped: false });
    cache[key].color.setScalar(1.4);
  }
  if (!cache[key]) {
    const map = canvas(entry[2], entry[3], DRAW[key]);
    cache[key] = new THREE.ShaderMaterial({
      toneMapped: false,
      side: THREE.DoubleSide,
      uniforms: { map: { value: map }, time: clock, gain: { value: key === "monitor" ? 1.2 : 1.8 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform sampler2D map; uniform float time; uniform float gain; varying vec2 vUv;
        void main(){
          vec3 c = texture2D(map, vUv).rgb;
          c = pow(c, vec3(2.2));
          float sweep = smoothstep(0.06, 0.0, abs(fract(vUv.x - vUv.y * 0.35 - time * 0.15) - 0.5));
          gl_FragColor = vec4(c * gain + vec3(0.25, 0.7, 1.0) * sweep * 0.35, 1.0);
        }`,
    });
  }
  return cache[key];
}
