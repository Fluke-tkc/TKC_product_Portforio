import * as THREE from "three";

const W = 600;
const H = 800;
const R = 36;

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Break a title into at most three lines. Thai has no spaces between words, so split on the
// word boundaries Intl.Segmenter finds (per-character as a last resort).
function wordUnits(text) {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    return Array.from(new Intl.Segmenter("th", { granularity: "word" }).segment(text), (s) => s.segment);
  }
  return /\s/.test(text) ? text.split(/(\s+)/) : Array.from(text);
}

function wrap(ctx, text, maxWidth) {
  // explicit line breaks come first; each part is then wrapped to width
  if (text.includes("\n")) return text.split("\n").flatMap((part) => wrap(ctx, part, maxWidth)).slice(0, 3);
  const units = wordUnits(text);
  const lines = [];
  let line = "";
  for (const unit of units) {
    const next = line + unit;
    if (ctx.measureText(next.trim()).width > maxWidth && line.trim()) {
      lines.push(line.trim());
      line = unit.trimStart();
    } else {
      line = next;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines.slice(0, 3);
}

let fontsReady;
const ensureFonts = () =>
  (fontsReady ||= Promise.all([document.fonts.load('600 52px "Prompt"'), document.fonts.load('400 24px "Prompt"')]).catch(() => {}));

export async function createCardTexture({ image, index, title, cta, badge }) {
  await ensureFonts();
  const img = await loadImage(image);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  roundRect(ctx, 0, 0, W, H, R);
  ctx.save();
  ctx.clip();

  // cover-fit the photo
  const s = Math.max(W / img.width, H / img.height);
  ctx.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s);
  if (badge) {
    ctx.fillStyle = "rgba(4, 21, 45, 0.45)";
    ctx.fillRect(0, 0, W, H);
  }

  const shade = ctx.createLinearGradient(0, H * 0.38, 0, H);
  shade.addColorStop(0, "rgba(4, 21, 45, 0)");
  shade.addColorStop(0.55, "rgba(4, 21, 45, 0.78)");
  shade.addColorStop(1, "rgba(4, 21, 45, 0.97)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, W, H);

  ctx.font = '600 50px "Prompt", sans-serif';
  const lines = wrap(ctx, title, W - 88);
  const lineH = 60;
  const top = H - 150 - (lines.length - 1) * lineH;

  ctx.fillStyle = "#5ee7ff";
  ctx.font = '600 26px "Prompt", sans-serif';
  ctx.fillText(String(index).padStart(2, "0"), 44, top - 66);
  ctx.fillRect(92, top - 76, 60, 3);

  ctx.fillStyle = "#ffffff";
  ctx.font = '600 50px "Prompt", sans-serif';
  lines.forEach((l, i) => ctx.fillText(l, 44, top + i * lineH));

  ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
  ctx.font = '400 24px "Prompt", sans-serif';
  ctx.fillText(cta, 44, H - 58);

  if (badge) {
    ctx.font = '600 22px "Prompt", sans-serif';
    const bw = ctx.measureText(badge).width + 40;
    roundRect(ctx, 40, 40, bw, 46, 23);
    ctx.fillStyle = "#ffb547";
    ctx.fill();
    ctx.fillStyle = "#04152d";
    ctx.fillText(badge, 60, 71);
  }
  ctx.restore();

  // hairline frame
  roundRect(ctx, 1.5, 1.5, W - 3, H - 3, R);
  ctx.strokeStyle = "rgba(191, 239, 255, 0.55)";
  ctx.lineWidth = 3;
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function createGlowTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(94, 231, 255, 0.9)");
  g.addColorStop(0.35, "rgba(94, 231, 255, 0.35)");
  g.addColorStop(1, "rgba(94, 231, 255, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createBackTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 300;
  canvas.height = 400;
  const ctx = canvas.getContext("2d");
  roundRect(ctx, 1, 1, 298, 398, 18);
  const g = ctx.createLinearGradient(0, 0, 300, 400);
  g.addColorStop(0, "#19376d");
  g.addColorStop(1, "#0b2447");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "rgba(191, 239, 255, 0.35)";
  ctx.lineWidth = 2;
  ctx.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
