// Themed showrooms for the baked dioramas (scene.showroom): each scene sits on its stand inside a closed room like
// 01's, but with its own architecture and fittings (a healing atrium, a library, a warehouse, a telecom cable hall, a robotics
// lab, a SOC, an energy gallery, a round sky lounge). The walls keep the world small, so it stays light to render.
// Static parts are merged per material (Kit); procedural shaders paint the fine detail (tiles, planks, books, screens,
// LEDs, a glowing floor grid, a sky with drifting clouds) at no geometry cost. Room scale: about 30 units to a metre.
// It is real-time lit; the baked diorama itself is unlit, so these lights never touch it.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Kit, rng, tree } from "../live/kit";

const TAU = Math.PI * 2;
const BOX = new THREE.BoxGeometry(1, 1, 1);
const OPEN = new THREE.CylinderGeometry(1, 1, 1, 64, 1, true);
const TIME = { value: 0 }; // shared by every animated shader

// ---------- materials ----------

// [colour, roughness, metalness, { fx, ...fx options, double }]; rooms add or override keys
const BASE = {
  stand: ["#2b2f36", 0.55], trim: ["#454c57", 0.4], pot: ["#30343b", 0.6],
  bark: ["#7a5a3e", 0.9], leaf1: ["#6fb24f", 0.8], leaf2: ["#4f9a40", 0.8], leaf3: ["#8cc660", 0.8],
  metal: ["#9aa3ad", 0.45, 0.5], dark: ["#2c3139", 0.6], white: ["#f3f5f7", 0.5], paint: ["#f4f4ee", 0.6], yellow: ["#f2b632", 0.6],
};
// glowing (unlit) keys: [colour, strength, { blink }]
const GLOW = { beacon: ["#ff3040", 3, { blink: true }] };

const NOISE = `
float hh(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hh(i), hh(i + vec2(1.0, 0.0)), u.x), mix(hh(i + vec2(0.0, 1.0)), hh(i + vec2(1.0, 1.0)), u.x), u.y);
}
float h3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float vn3(vec3 p) {
  vec3 i = floor(p); vec3 f = fract(p); vec3 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(h3(i), h3(i + vec3(1.0, 0.0, 0.0)), u.x), mix(h3(i + vec3(0.0, 1.0, 0.0)), h3(i + vec3(1.0, 1.0, 0.0)), u.x), u.y),
    mix(mix(h3(i + vec3(0.0, 0.0, 1.0)), h3(i + vec3(1.0, 0.0, 1.0)), u.x), mix(h3(i + vec3(0.0, 1.0, 1.0)), h3(i + vec3(1.0, 1.0, 1.0)), u.x), u.y),
    u.z);
}`;
// the coordinate along a wall face (x for north / south faces, z for east / west ones)
const ALONG = "vec3 an = abs(vWN); float along = an.x > an.z ? vWP.z : vWP.x; float wallFace = step(an.y, 0.5);";

// procedural detail in world units: decl / color / surface / emissive snippets
const FX = {
  // soft patches of colour (moss, concrete, epoxy)
  ground: {
    u: (o) => ({ uScale: { value: o.scale || 1 } }),
    decl: "uniform float uScale;",
    color: `
      vec2 gp = vWP.xz + vWP.y * vec2(0.7, 0.3);
      float n = vn(gp * 0.018 * uScale) * 0.55 + vn(gp * 0.11 * uScale) * 0.3 + vn(gp * 0.7 * uScale) * 0.15;
      diffuseColor.rgb *= 0.82 + 0.34 * n;`,
  },
  // tiles, planks (size in units; odd rows offset half a tile) with dark joints
  tiles: {
    u: (o) => ({ uSize: { value: new THREE.Vector2(...(o.size || [18, 18])) } }),
    decl: "uniform vec2 uSize;",
    color: `
      vec2 q = vWP.xz / uSize; q.x += step(1.0, mod(floor(q.y), 2.0)) * 0.5;
      vec2 tf = fract(q);
      float joint = max(step(tf.x, 0.6 / uSize.x), step(tf.y, 0.6 / uSize.y));
      diffuseColor.rgb *= (1.0 - 0.22 * joint) * (0.92 + 0.12 * hh(floor(q)));`,
  },
  // corrugated / panelled walls
  ribs: {
    u: (o) => ({ uSpace: { value: o.space || 4 } }),
    decl: "uniform float uSpace;",
    color: `${ALONG}
      diffuseColor.rgb *= mix(1.0, 0.84 + 0.2 * step(0.5, fract(along / uSpace)), wallFace);`,
  },
  // still water with slow ripples
  water: {
    color: `
      float w = sin(vWP.x * 0.08 + uTime * 0.8) * sin(vWP.z * 0.06 - uTime * 0.6) + 0.6 * sin((vWP.x - vWP.z) * 0.23 + uTime * 1.6);
      diffuseColor.rgb *= 0.86 + 0.14 * w;
      diffuseColor.rgb += vec3(0.16) * smoothstep(1.2, 1.55, w);`,
  },
  // shelves of books in every colour (shelf: row height, book: spine width)
  books: {
    u: (o) => ({ uShelf: { value: o.shelf || 24 }, uBook: { value: o.book || 2.6 } }),
    decl: "uniform float uShelf; uniform float uBook;",
    color: `${ALONG}
      float row = floor((vWP.y - uBase) / uShelf);
      float fy = fract((vWP.y - uBase) / uShelf);
      float bu = along / uBook + hh(vec2(row, 1.0)) * 9.0;
      float bi = floor(bu);
      float br = hh(vec2(bi, row));
      float top = 0.55 + 0.32 * br;
      float isBook = wallFace * step(0.1, fy) * step(fy, top) * step(0.07, fract(bu)) * step(0.06, hh(vec2(bi, row + 7.0)));
      vec3 col = vec3(0.56, 0.18, 0.15);
      col = mix(col, vec3(0.15, 0.3, 0.5), step(0.22, br));
      col = mix(col, vec3(0.2, 0.42, 0.3), step(0.44, br));
      col = mix(col, vec3(0.78, 0.62, 0.33), step(0.64, br));
      col = mix(col, vec3(0.42, 0.24, 0.46), step(0.8, br));
      col = mix(col, vec3(0.9, 0.87, 0.8), step(0.92, br));
      float back = wallFace * (1.0 - step(fy, 0.1)) * (1.0 - isBook);
      diffuseColor.rgb = mix(diffuseColor.rgb * (1.0 - 0.55 * back), col * (0.75 + 0.35 * hh(vec2(bi, row + 3.0))), isBook);`,
  },
  // a wall of live screens: bar charts, line charts, maps and the odd red alert (cell: one screen)
  screen: {
    u: (o) => ({ uCell: { value: new THREE.Vector2(...(o.cell || [60, 40])) }, uGlowColor: { value: new THREE.Color(o.glow || "#4fc3ff").multiplyScalar(o.k || 1.2) } }),
    decl: "uniform vec2 uCell; uniform vec3 uGlowColor;",
    color: `${ALONG}
      vec2 sp = vec2(along, vWP.y - uBase) / uCell;
      vec2 sid = floor(sp);
      vec2 sf = fract(sp);
      float kind = hh(sid);
      float bezel = step(0.03, sf.x) * step(sf.x, 0.97) * step(0.05, sf.y) * step(sf.y, 0.95);
      float bars = step(sf.y, 0.12 + 0.75 * hh(vec2(floor(sf.x * 14.0), sid.x + sid.y * 7.0 + floor(uTime * 0.6 + kind * 5.0)))) * step(0.3, fract(sf.x * 14.0));
      float trace = 1.0 - smoothstep(0.0, 0.035, abs(sf.y - 0.5 - 0.22 * sin(sf.x * 11.0 + uTime * 1.3 + kind * 6.0)));
      float fine = 1.0 - smoothstep(0.01, 0.04, max(fwidth(sf.x), fwidth(sf.y)));
      float lines = (step(0.94, fract(sf.x * 8.0)) + step(0.93, fract(sf.y * 6.0))) * fine;
      float dots = step(0.975, hh(floor(sf * 36.0) + sid + floor(uTime * 0.8))) * fine;
      float content = kind < 0.4 ? bars : (kind < 0.75 ? trace + lines * 0.2 : lines * 0.3 + dots);
      float sweep = smoothstep(0.96, 1.0, fract(sf.y - uTime * 0.15 + kind));
      fxGlow = wallFace * bezel * (0.16 + content * 0.85 + sweep * 0.3);
      fxCol = mix(uGlowColor, vec3(2.2, 0.55, 0.6), step(0.9, hh(sid + 4.0)));
      diffuseColor.rgb *= 0.2;`,
    emissive: "totalEmissiveRadiance += fxCol * fxGlow;",
  },
  // server-rack fronts: rows of blinking LEDs
  led: {
    u: (o) => ({ uGlowColor: { value: new THREE.Color(o.glow || "#51ffb0").multiplyScalar(o.k || 2) } }),
    decl: "uniform vec3 uGlowColor;",
    color: `${ALONG}
      vec2 lg = vec2(along / 1.6, (vWP.y - uBase) / 1.4);
      float lr = hh(floor(lg));
      float on = step(0.55, fract(lr * 13.0 + uTime * (0.3 + lr)));
      vec2 lw = fwidth(lg);
      float near = 1.0 - smoothstep(0.25, 0.6, max(lw.x, lw.y)); // dots under ~2 px shimmer: fade to their mean
      fxGlow = wallFace * mix(0.08, step(length(fract(lg) - 0.5), 0.2) * on * step(0.3, lr), near);
      fxCol = mix(uGlowColor, uGlowColor.bgr, step(0.85, hh(floor(lg) + 5.0)));`,
    emissive: "totalEmissiveRadiance += fxCol * fxGlow;",
  },
  // the SOC floor: a glowing grid with rings rolling out from the model
  grid: {
    u: (o) => ({ uCell: { value: o.cell || 30 }, uGlowColor: { value: new THREE.Color(o.glow || "#1fb6ff").multiplyScalar(o.k || 1.1) } }),
    decl: "uniform float uCell; uniform vec3 uGlowColor;",
    color: `
      vec2 gc = abs(fract(vWP.xz / uCell + 0.5) - 0.5) * uCell;
      float gl = 1.0 - smoothstep(0.15, 0.6, min(gc.x, gc.y));
      float ring = smoothstep(0.93, 1.0, fract(length(vWP.xz) / 70.0 - uTime * 0.12));
      fxGlow = gl * (0.4 + 0.8 * ring) + ring * 0.08;
      diffuseColor.rgb *= 0.85 + 0.3 * vn(vWP.xz * 0.02);`,
    emissive: "totalEmissiveRadiance += uGlowColor * fxGlow;",
  },
  // a panoramic window: blue sky with puffy clouds drifting past (from / span: the band's bottom and height above the floor)
  sky: {
    u: (o) => ({ uFrom: { value: o.from || 0 }, uSpan: { value: o.span || 100 } }),
    decl: "uniform float uFrom; uniform float uSpan;",
    color: `
      vec3 sp = vec3(vWP.x, (vWP.y - uBase) * 1.6, vWP.z) * 0.016 + vec3(uTime * 0.02, 0.0, uTime * 0.013);
      float cn = vn3(sp) * 0.55 + vn3(sp * 2.1 + 3.1) * 0.3 + vn3(sp * 4.3 + 7.7) * 0.15;
      float cl = smoothstep(0.54, 0.76, cn);
      float kh = clamp((vWP.y - uBase - uFrom) / uSpan, 0.0, 1.0);
      vec3 sky = mix(vec3(0.56, 0.77, 1.0), vec3(0.2, 0.46, 0.92), kh);
      fxCol = mix(sky, vec3(1.0), cl * 0.9) * (0.92 + 0.08 * cn);
      diffuseColor.rgb *= 0.0;`,
    emissive: "totalEmissiveRadiance += fxCol;",
  },
};

function patch(material, opts, base) {
  const def = FX[opts.fx];
  material.customProgramCacheKey = () => `tkc-room-${opts.fx}`;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, { uTime: TIME, uBase: { value: base } }, def.u ? def.u(opts) : {});
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWP;\nvarying vec3 vWN;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvWN = normalize(mat3(modelMatrix) * objectNormal);");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nvarying vec3 vWP;\nvarying vec3 vWN;\nuniform float uTime;\nuniform float uBase;\n${def.decl || ""}\n${NOISE}`)
      .replace("void main() {", "void main() {\n  float fxGlow = 0.0; vec3 fxCol = vec3(0.0);")
      .replace("#include <color_fragment>", `#include <color_fragment>\n${def.color || ""}`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>\n${def.emissive || ""}`);
  };
}

// one material per key, made on demand; blinking glows are collected for the frame loop
function palette(colors, glows, base) {
  const cache = {};
  const blink = [];
  const get = (key) => {
    if (cache[key]) return cache[key];
    if (glows[key]) {
      const [c, k, o = {}] = glows[key];
      const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), toneMapped: false });
      if (o.blink) blink.push([m, m.color.clone()]);
      return (cache[key] = m);
    }
    const spec = colors[key];
    if (!spec) throw new Error(`rooms: no colour for "${key}"`);
    const [c, r, m = 0, o = {}] = spec;
    const mat = new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, flatShading: /^(leaf|bush)/.test(key) });
    if (o.fx) patch(mat, o, base);
    if (o.double) mat.side = THREE.DoubleSide;
    return (cache[key] = mat);
  };
  return { get, blink, all: () => Object.values(cache) };
}

// ---------- room parts ----------

// a slab against side N / S / W / E: from a0 to a1 along the wall, y0 to y1 high, d from the centre, t thick
const SIDE = { N: (a, d) => [a, -d], S: (a, d) => [a, d], W: (a, d) => [-d, a], E: (a, d) => [d, a] };
function panel(k, mat, s, a0, a1, y0, y1, d, t = 2) {
  const [x, z] = SIDE[s]((a0 + a1) / 2, d);
  const ns = s === "N" || s === "S";
  k.box(mat, [x, y0, z], ns ? [a1 - a0, y1 - y0, t] : [t, y1 - y0, a1 - a0]);
}
// the four walls, all in one material
function walls(k, mat, c) {
  for (const s of ["N", "S", "W", "E"]) panel(k, mat, s, -c.R, c.R, c.y, c.y + c.H, c.R);
}
// a glowing window on a wall's inner face with mullions (cols x rows)
function windowOn(k, c, s, a0, a1, y0, y1, { pane = "pane", frame = "mull", cols = 6, rows = 2, d = c.R - 1.4 } = {}) {
  panel(k, pane, s, a0, a1, y0, y1, d, 0.4);
  for (let i = 0; i <= cols; i++) {
    const a = a0 + ((a1 - a0) * i) / cols;
    panel(k, frame, s, a - 1.6, a + 1.6, y0, y1, d - 0.6, 2);
  }
  for (let j = 0; j <= rows; j++) {
    const yy = y0 + ((y1 - y0) * j) / rows;
    panel(k, frame, s, a0 - 1.6, a1 + 1.6, yy - 1.6, yy + 1.6, d - 0.6, 2);
  }
}
function frame(k, mat, hx, hz, w, y, h, [cx, cz] = [0, 0]) {
  k.box(mat, [cx, y, cz - hz], [hx * 2 + w, h, w]);
  k.box(mat, [cx, y, cz + hz], [hx * 2 + w, h, w]);
  k.box(mat, [cx - hx, y, cz], [w, h, hz * 2 - w]);
  k.box(mat, [cx + hx, y, cz], [w, h, hz * 2 - w]);
}
const frameAt = (x, z, ry) => {
  const c = Math.cos(ry);
  const s = Math.sin(ry);
  return (dx, dz) => [x + c * dx + s * dz, z - s * dx + c * dz];
};
// a big potted plant like 01's
function potted(k, [x, y, z], h, seed, pot = "pot") {
  k.cyl(pot, [x, y, z], 6.5, 10, { seg: 10, r2: 7.8 });
  tree(k, [x, y + 10, z], { h, seed });
}
// a chair facing ry (seat, back, legs)
function chair(k, [x, y, z], ry, seat = "seat", legs = "dark") {
  const p = frameAt(x, z, ry);
  k.box(seat, [x, y + 13, z], [14, 2.5, 14], { ry, r: 0.8 });
  const [bx, bz] = p(0, -6.5);
  k.box(seat, [bx, y + 15, bz], [14, 14, 2], { ry, r: 0.8 });
  for (const [dx, dz] of [[-6, -6], [6, -6], [-6, 6], [6, 6]]) {
    const [lx, lz] = p(dx, dz);
    k.box(legs, [lx, y, lz], [1, 13, 1]);
  }
}
function table(k, [x, y, z], [w, d], ry, top = "wood", legs = "dark", h = 22) {
  const p = frameAt(x, z, ry);
  k.box(top, [x, y + h, z], [w, 2, d], { ry });
  for (const [dx, dz] of [[-w / 2 + 3, -d / 2 + 3], [w / 2 - 3, -d / 2 + 3], [-w / 2 + 3, d / 2 - 3], [w / 2 - 3, d / 2 - 3]]) {
    const [lx, lz] = p(dx, dz);
    k.box(legs, [lx, y, lz], [1.6, h, 1.6]);
  }
}
// placements round the stand on an ellipse, skipping the home camera's corner (+x, +z) for anything tall
const around = (c, n, scale, a0 = 0) =>
  Array.from({ length: n }, (_, i) => {
    const a = a0 + (i / n) * TAU;
    return [Math.cos(a) * (c.bx + scale), Math.sin(a) * (c.bz + scale), a];
  });
const homeSide = (x, z) => x > 20 && z > 20;

// ---------- rooms ----------

const ROOMS = {
  // 02 hospital: a bright healing atrium: terrazzo, a still pool round the plinth, a glass north wall,
  // a living green west wall, white planters and lounge seats, a curved reception desk
  atrium: {
    colors: {
      stand: ["#2f5561", 0.55], trim: ["#4a7a88", 0.4],
      floor: ["#e7ebeb", 0.45, 0, { fx: "tiles", size: [18, 18] }], inset: ["#d3e9e3", 0.7], rim: ["#f7f8f8", 0.5], pool: ["#8fcfdc", 0.06, 0.25, { fx: "water" }],
      wall: ["#f4f6f6", 0.9], band: ["#86c4b9", 0.6], mull: ["#ffffff", 0.4], moss: ["#5b9a4c", 0.95, 0, { fx: "ground", scale: 5 }],
      planter: ["#fbfbfb", 0.45], seat: ["#f4f6f6", 0.6], cushion: ["#8cc7bd", 0.8], desk: ["#ffffff", 0.35], deskTop: ["#86c4b9", 0.5],
      leaf1: ["#7cbf62", 0.8], leaf2: ["#5ea84e", 0.8], leaf3: ["#9fd47a", 0.8], bush: ["#4f9443", 0.85], bush2: ["#6fb257", 0.85],
    },
    glow: { pane: ["#f2f8ff", 1.9], cove: ["#d6f6ff", 1.5] },
    hemi: ["#f3f9ff", "#9aa6ac"], sun: "#ffffff",
    build(k, c) {
      const r = rng(21);
      k.box("inset", [0, c.y, 0], [c.bx * 2 + 160, 0.1, c.bz * 2 + 140]);
      const px = c.bx + 3 + 16;
      const pz = c.bz + 3 + 16;
      k.box("pool", [0, c.y, 0], [px * 2, 0.6, pz * 2]);
      frame(k, "rim", px + 2.5, pz + 2.5, 5, c.y, 1.6);
      walls(k, "wall", c);
      windowOn(k, c, "N", -c.R * 0.82, c.R * 0.82, c.y + 6, c.y + c.H * 0.8, { cols: 10, rows: 3 });
      panel(k, "moss", "W", -c.R * 0.72, c.R * 0.72, c.y + 8, c.y + c.H * 0.72, c.R - 2.5, 3);
      for (let i = 0; i < 260; i++) k.ico(r() < 0.5 ? "bush" : "bush2", [-c.R + 5, c.y + 12 + r() * (c.H * 0.7 - 16), (r() - 0.5) * c.R * 1.4], 4 + r() * 5, { scale: [0.6, 1, 1] });
      for (const s of ["E", "S"]) {
        panel(k, "band", s, -c.R, c.R, c.y + 42, c.y + 50, c.R - 1.2, 1);
        panel(k, "cove", s, -c.R, c.R, c.y + c.H - 6, c.y + c.H - 4, c.R - 1.2, 1);
      }
      // white planters with small trees and lounge seats round the pool
      around(c, 8, 62, 0.2).forEach(([x, z, a], i) => {
        if (i % 2 === 0) {
          k.cyl("planter", [x, c.y, z], 11, 14, { seg: 20 });
          tree(k, [x, c.y + 14, z], { h: homeSide(x, z) ? 22 : 34, seed: i + 4 });
        } else {
          const ry = Math.PI / 2 - a;
          k.box("seat", [x, c.y, z], [44, 10, 18], { ry, r: 2 });
          k.box("cushion", [x, c.y + 10, z], [42, 3, 16], { ry, r: 1.2 });
        }
      });
      // reception desk curving in front of the green wall
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * 0.75 + (i / 8) * Math.PI * 0.5;
        const [x, z] = [-c.R + 120 + Math.cos(a) * 70, Math.sin(a) * 70];
        k.box("desk", [x, c.y, z], [10, 30, 26], { ry: -a });
        k.box("deskTop", [x, c.y + 30, z], [11, 2, 30], { ry: -a });
      }
    },
  },

  // 03 learning: a library hall: oak planks, a green rug, bookshelves along the north wall, arched windows west,
  // panelled walls, reading tables with green lamps, a globe, a chalkboard
  library: {
    colors: {
      stand: ["#3b335e", 0.55], trim: ["#5b4a8a", 0.4],
      floor: ["#b98b5f", 0.7, 0, { fx: "tiles", size: [54, 9] }], rug: ["#2f5a46", 0.95], rugEdge: ["#c9a24a", 0.7],
      wall: ["#efe4d0", 0.9], panelW: ["#8a5d3b", 0.7, 0, { fx: "ribs", space: 24 }], shelf: ["#5e3d26", 0.7, 0, { fx: "books", shelf: 26, book: 2.8 }],
      wood: ["#7a5032", 0.7], mull: ["#5e3d26", 0.6], seat: ["#7a3b2e", 0.8], lampShade: ["#2f6b4f", 0.5],
      board: ["#2d4a3a", 0.9], globe: ["#3f7fb5", 0.5], brass: ["#c9a24a", 0.35, 0.6],
    },
    glow: { pane: ["#fff3dc", 1.8], lampLight: ["#ffe2a8", 2.6] },
    hemi: ["#fff1dc", "#8a6d55"], sun: "#ffe2bb",
    build(k, c) {
      k.box("rug", [0, c.y, 0], [c.bx * 2 + 130, 0.1, c.bz * 2 + 110]);
      frame(k, "rugEdge", c.bx + 60, c.bz + 50, 3, c.y + 0.1, 0.05);
      walls(k, "wall", c);
      // north: shelves wall to wall, uprights and a ladder
      panel(k, "shelf", "N", -c.R * 0.92, c.R * 0.92, c.y, c.y + c.H * 0.72, c.R - 6, 10);
      for (let x = -c.R * 0.92; x <= c.R * 0.92; x += 52) panel(k, "wood", "N", x - 2, x + 2, c.y, c.y + c.H * 0.72, c.R - 12, 3);
      panel(k, "wood", "N", -c.R * 0.92, c.R * 0.92, c.y + c.H * 0.72, c.y + c.H * 0.72 + 6, c.R - 8, 14);
      for (const s of [-1, 1]) k.add("wood", BOX, [60 + s * 9, c.y + 60, -c.R + 28], [-0.25, 0, 0], [2.4, 125, 2.4]);
      for (let j = 0; j < 10; j++) k.box("wood", [60, c.y + 6 + j * 12, -c.R + 28 - 3 + j * 1.5], [18, 1.6, 1.6]);
      // west: three tall arched windows between shelf bays
      for (const zc of [-c.R * 0.55, 0, c.R * 0.55]) {
        const hw = 30;
        windowOn(k, c, "W", zc - hw, zc + hw, c.y + 30, c.y + c.H * 0.58, { cols: 3, rows: 4 });
        k.add("pane", new THREE.CircleGeometry(hw, 24, 0, Math.PI), [-c.R + 1.4, c.y + c.H * 0.58, zc], [0, Math.PI / 2, 0]);
        k.add("mull", new THREE.TorusGeometry(hw, 1.6, 4, 24, Math.PI), [-c.R + 0.8, c.y + c.H * 0.58, zc], [0, Math.PI / 2, 0]);
      }
      for (const zc of [-c.R * 0.28, c.R * 0.28]) panel(k, "shelf", "W", zc - 26, zc + 26, c.y, c.y + c.H * 0.5, c.R - 6, 10);
      for (const s of ["E", "S"]) {
        panel(k, "panelW", s, -c.R, c.R, c.y, c.y + 46, c.R - 1.5, 2);
        panel(k, "wood", s, -c.R, c.R, c.y + 46, c.y + 49, c.R - 2, 4);
      }
      panel(k, "wood", "S", -110, 110, c.y + 46, c.y + 130, c.R - 2.2, 4);
      panel(k, "board", "S", -104, 104, c.y + 52, c.y + 124, c.R - 4.4, 1);
      // reading tables with green lamps and chairs, a globe by the windows
      around(c, 6, 92, 0.5).forEach(([x, z, a], i) => {
        if (homeSide(x, z)) return;
        const ry = Math.PI / 2 - a;
        table(k, [x, c.y, z], [70, 34], ry, "wood", "wood");
        for (const t of [-20, 20]) {
          const [lx, lz] = frameAt(x, z, ry)(t, 0);
          k.cyl("brass", [lx, c.y + 24, lz], 0.6, 9, { seg: 6 });
          k.cyl("lampShade", [lx, c.y + 32, lz], 2, 3.4, { seg: 10, r2: 4.5 });
          k.box("lampLight", [lx, c.y + 31.8, lz], [5, 0.3, 5]);
        }
        for (const [dx, dz, f] of [[-18, -26, 0], [18, -26, 0], [-18, 26, Math.PI], [18, 26, Math.PI]]) {
          const [cx, cz] = frameAt(x, z, ry)(dx, dz);
          chair(k, [cx, c.y, cz], ry + f, "seat", "wood");
        }
        if (i === 3) potted(k, [x * 1.9, c.y, z * 1.9], 50, 7);
      });
      k.cyl("wood", [-c.R + 70, c.y, c.R * 0.3], 8, 3, { seg: 12 });
      k.cyl("brass", [-c.R + 70, c.y, c.R * 0.3], 1.2, 26, { seg: 8 });
      k.ico("globe", [-c.R + 70, c.y + 36, c.R * 0.3], 11, { detail: 2 });
      k.add("brass", new THREE.TorusGeometry(12.5, 0.6, 6, 32), [-c.R + 70, c.y + 36, c.R * 0.3], [0, 0, 0.4]);
      potted(k, [-c.R + 40, c.y, -c.R + 40], 56, 3);
    },
  },

  // 04 logistics: a warehouse: polished concrete with lane markings, pallet racking along two walls, roll-up doors,
  // a clerestory, a forklift, pallets, bollards and a conveyor
  warehouse: {
    colors: {
      stand: ["#27374a", 0.55], trim: ["#f2b632", 0.4],
      floor: ["#c4c7ca", 0.6, 0, { fx: "tiles", size: [60, 60] }], wall: ["#d6dadf", 0.6, 0.2, { fx: "ribs", space: 4 }], door: ["#7e8a96", 0.6, 0.2, { fx: "ribs", space: 2 }],
      rackU: ["#2f5fa8", 0.5, 0.3], rackB: ["#e8862f", 0.5, 0.3], pallet: ["#b08a5a", 0.9], box: ["#c49a6c", 0.85], wrap: ["#e9edf1", 0.4], bin: ["#3f7fc1", 0.6],
      forklift: ["#f2b632", 0.5], mull: ["#4a5563", 0.5], belt: ["#3a3f48", 0.8], hatch: ["#2b2f36", 0.8],
    },
    glow: { pane: ["#eef6ff", 1.8], bayLight: ["#fffaf0", 2.4] },
    hemi: ["#eef3fa", "#7d8894"], sun: "#ffffff",
    build(k, c) {
      const r = rng(41);
      // floor markings: walkway frames, hatched zone, arrows
      frame(k, "yellow", c.bx + 18, c.bz + 16, 1.6, c.y, 0.06);
      frame(k, "yellow", c.bx + 110, c.bz + 95, 2.4, c.y, 0.06);
      for (let i = 0; i < 9; i++) k.add("yellow", BOX, [-c.bx - 70 + i * 9, c.y + 0.05, c.bz + 60], [0, 0.7, 0], [3, 0.1, 30]);
      for (const x of [-80, 0, 80]) k.add("paint", new THREE.ConeGeometry(6, 14, 3), [x, c.y + 0.1, -(c.bz + 55)], [-Math.PI / 2, 0, 0], [1, 1, 0.05]);
      walls(k, "wall", c);
      windowOn(k, c, "N", -c.R * 0.9, c.R * 0.9, c.y + c.H * 0.74, c.y + c.H * 0.86, { cols: 14, rows: 1 });
      for (const zc of [-c.R * 0.35, c.R * 0.35]) {
        panel(k, "door", "E", zc - 40, zc + 40, c.y, c.y + 110, c.R - 1.4, 1);
        panel(k, "yellow", "E", zc - 44, zc - 40, c.y, c.y + 114, c.R - 1.6, 1.4);
        panel(k, "yellow", "E", zc + 40, zc + 44, c.y, c.y + 114, c.R - 1.6, 1.4);
      }
      // pallet racking on the north and west walls: uprights, beams, pallets of boxes, wrapped loads and bins
      for (const s of ["N", "W"]) {
        const d = c.R - 26;
        for (let a = -c.R * 0.86; a <= c.R * 0.86; a += 84) {
          for (const off of [-20, 20]) panel(k, "rackU", s, a - 2, a + 2, c.y, c.y + 160, d + off, 4);
          if (a + 84 > c.R * 0.86) continue;
          for (const yl of [4, 44, 84, 124]) {
            for (const off of [-20, 20]) panel(k, "rackB", s, a + 2, a + 82, c.y + yl + 30, c.y + yl + 34, d + off, 2);
            for (const t of [22, 62]) {
              const [x, z] = SIDE[s](a + t, d);
              k.box("pallet", [x, c.y + yl, z], s === "N" ? [34, 3, 36] : [36, 3, 34]);
              const kind = r();
              const h = 14 + r() * 12;
              if (kind < 0.55) {
                for (const [bx, bz] of [[-8, -8], [8, -8], [-8, 8], [8, 8]]) k.box("box", [x + bx, c.y + yl + 3, z + bz], [15, h, 15]);
              } else if (kind < 0.8) k.box("wrap", [x, c.y + yl + 3, z], [32, h + 4, 32], { r: 1.5 });
              else for (const bx of [-9, 9]) k.box("bin", [x + (s === "N" ? bx : 0), c.y + yl + 3, z + (s === "N" ? 0 : bx)], s === "N" ? [16, 14, 30] : [30, 14, 16]);
            }
          }
        }
      }
      // a forklift with a load, pallet stacks, bollards round the plinth, a conveyor
      const [fx0, fz0] = [-c.bx - 110, -c.bz - 40];
      k.box("forklift", [fx0, c.y + 4, fz0], [44, 20, 28], { r: 3 });
      for (const dx of [-8, 8]) for (const dz of [-12, 12]) k.box("dark", [fx0 + dx, c.y + 24, fz0 + dz], [1.6, 22, 1.6]);
      k.box("dark", [fx0, c.y + 46, fz0], [20, 2, 27]);
      k.box("dark", [fx0 + 24, c.y, fz0], [2, 60, 22]);
      for (const dz of [-7, 7]) k.box("metal", [fx0 + 38, c.y + 2, fz0 + dz], [28, 1.4, 4]);
      k.box("wrap", [fx0 + 38, c.y + 3.4, fz0], [26, 22, 26], { r: 1.5 });
      for (const dx of [-14, 14]) for (const dz of [-15, 15]) k.cyl("dark", [fx0 + dx, c.y + 6, fz0 + dz], 6, 4, { seg: 12, axis: "z" });
      for (const [x, z] of [[c.bx + 60, -c.bz - 55], [-c.bx - 60, c.bz + 40]]) {
        for (let s = 0; s < 4; s++) k.box("pallet", [x, c.y + s * 3.2, z], [34, 3, 36]);
        for (const [bx, bz] of [[-8, -8], [8, -8], [-8, 8]]) k.box("box", [x + bx, c.y + 12.8, z + bz], [15, 14, 15]);
      }
      for (let x = -c.bx - 16; x <= c.bx + 16; x += 22) for (const s of [-1, 1]) k.cyl("yellow", [x, c.y, s * (c.bz + 22)], 2.2, 12, { seg: 10 });
      k.box("belt", [-c.R + 80, c.y + 18, 0], [16, 3, c.R * 1.1]);
      for (let z = -c.R * 0.55; z < c.R * 0.55; z += 24) {
        k.box("metal", [-c.R + 80, c.y, z], [14, 18, 2]);
        if (r() < 0.6) k.box("box", [-c.R + 80, c.y + 21, z + 8], [12, 10, 12]);
      }
      for (const [x, z] of [[-c.R * 0.5, -c.R * 0.5], [c.R * 0.5, -c.R * 0.5], [-c.R * 0.5, c.R * 0.5]]) k.cyl("bayLight", [x, c.y + c.H * 0.9, z], 12, 2, { seg: 20 });
    },
  },

  // 05 cables: a bright telecom cable hall: a raised access floor with an open trench round the plinth showing the
  // ducts and cables below, a wall of patch racks with rows of coloured cords, ladder trays of neat cable runs,
  // big cable drums, green street cabinets, and a giant cable cross-section on a plinth
  cabling: {
    colors: {
      stand: ["#232833", 0.5], trim: ["#38d9ff", 0.4],
      floor: ["#3a3f47", 0.8], raised: ["#d9dde2", 0.5, 0.05, { fx: "tiles", size: [20, 20] }], edge: ["#9aa3ad", 0.35, 0.6],
      wall: ["#eef1f4", 0.9], band: ["#2f6fb5", 0.5], tray: ["#b9c0c8", 0.35, 0.6], rackF: ["#2c3139", 0.5, 0.3],
      ports: ["#3a404a", 0.5, 0.3, { fx: "led", glow: "#5effa8", k: 1.6 }], manager: ["#1f2329", 0.6],
      cableO: ["#f08a24", 0.55], cableB: ["#2f7de0", 0.55], cableY: ["#f2c230", 0.55], cableG: ["#3eaa5c", 0.55], cableK: ["#2a2e35", 0.6], cableR: ["#d64545", 0.55], cableP: ["#9b6be0", 0.55], cableW: ["#f4f6f8", 0.55],
      duct: ["#e4782f", 0.6], duct2: ["#9aa3ad", 0.5], drum: ["#b0844f", 0.85], drumCore: ["#2c3139", 0.6],
      cabinet: ["#4f8a5a", 0.5, 0.2], cabinetIn: ["#1f2329", 0.6], pedestal: ["#f4f6f8", 0.4], filler: ["#f4f6f8", 0.7], cover: ["#5b6169", 0.5, 0.5, { fx: "tiles", size: [2, 2] }],
    },
    glow: { fiber: ["#38d9ff", 2.2], strip: ["#e9f6ff", 1.8] },
    hemi: ["#f4f8ff", "#8d96a3"], sun: "#ffffff",
    build(k, c) {
      const r = rng(51);
      const f = c.y + 6; // top of the raised floor
      const cols = ["cableO", "cableB", "cableY", "cableG", "cableK", "cableR", "cableP", "cableW"];
      // raised floor round an open trench: ducts and cable runs in the trench, a lit fibre down its middle
      const [ix, iz] = [c.bx + 3, c.bz + 3];
      const [ox, oz] = [ix + 34, iz + 34];
      const F = c.R * 1.2;
      frame(k, "raised", ix + 6, iz + 6, 12, c.y, 6);
      k.box("raised", [0, c.y, -(oz + F) / 2], [F * 2, 6, F - oz]);
      k.box("raised", [0, c.y, (oz + F) / 2], [F * 2, 6, F - oz]);
      k.box("raised", [-(ox + F) / 2, c.y, 0], [F - ox, 6, oz * 2]);
      k.box("raised", [(ox + F) / 2, c.y, 0], [F - ox, 6, oz * 2]);
      for (const [hx, hz] of [[ix + 12, iz + 12], [ox, oz]]) frame(k, "edge", hx, hz, 1.4, f - 0.2, 0.5);
      const mx = (ix + 12 + ox) / 2;
      const mz = (iz + 12 + oz) / 2;
      for (let n = 0; n < 6; n++) {
        const o = -8 + n * 3.2;
        const mat = n < 2 ? (n ? "duct2" : "duct") : cols[n];
        const rad = n < 2 ? 2.2 : 1.3;
        k.cyl(mat, [0, c.y + rad, -(mz + o)], rad, (mx + o) * 2, { seg: 10, axis: "x" });
        k.cyl(mat, [0, c.y + rad, mz + o], rad, (mx + o) * 2, { seg: 10, axis: "x" });
        k.cyl(mat, [-(mx + o), c.y + rad, 0], rad, (mz + o) * 2, { seg: 10, axis: "z" });
        k.cyl(mat, [mx + o, c.y + rad, 0], rad, (mz + o) * 2, { seg: 10, axis: "z" });
      }
      frame(k, "fiber", mx + 10, mz + 10, 0.8, c.y + 0.2, 0.3);
      walls(k, "wall", c);
      for (const s of ["N", "S", "W", "E"]) panel(k, "band", s, -c.R, c.R, f + 34, f + 40, c.R - 1.2, 1);
      // north: a row of patch racks, each row of ports trailing coloured cords into cable managers
      for (let i = -3; i <= 3; i++) {
        const a = i * 66;
        panel(k, "rackF", "N", a - 30, a + 30, f, f + 150, c.R - 22, 30);
        for (let row = 0; row < 11; row++) {
          const y = f + 14 + row * 12;
          panel(k, "ports", "N", a - 26, a + 26, y, y + 5, c.R - 37.5, 1);
          panel(k, "manager", "N", a - 27, a + 27, y - 4, y - 2, c.R - 38, 3);
          for (let t = -25; t <= 25; t += 2.6) {
            const L = 3 + r() * 6;
            k.box(cols[Math.floor(r() * cols.length)], [a + t, y - L + 1, -(c.R - 39.5)], [0.7, L, 0.7]);
          }
        }
        for (const t of [-31, 31]) panel(k, cols[(i + 7) % cols.length], "N", a + t - 2, a + t + 2, f, f + 150, c.R - 40, 4);
      }
      panel(k, "strip", "N", -c.R * 0.75, c.R * 0.75, f + 160, f + 163, c.R - 3, 1);
      // west: three ladder trays of neat cable runs, risers dropping into the trench
      for (const [j, yl] of [70, 105, 140].entries()) {
        const d = c.R - 14;
        panel(k, "tray", "W", -c.R * 0.92, c.R * 0.92, f + yl, f + yl + 1.2, d, 20);
        for (const off of [-10, 10]) panel(k, "tray", "W", -c.R * 0.92, c.R * 0.92, f + yl, f + yl + 5, d + off, 1);
        for (let a = -c.R * 0.92; a < c.R * 0.92; a += 30) panel(k, "tray", "W", a, a + 1.6, f + yl, f + yl + 1.6, d, 20);
        for (let n = 0; n < 5; n++) k.cyl(cols[(n + j * 2) % cols.length], [-(d - 7 + n * 3.4), f + yl + 3.2, 0], 1.6, c.R * 1.84, { seg: 10, axis: "z" });
      }
      for (const zc of [-c.R * 0.9, c.R * 0.9]) {
        panel(k, "tray", "W", zc - 10, zc + 10, f, f + 140, c.R - 14, 1.2);
        for (let n = 0; n < 4; n++) k.cyl(cols[n * 2], [-(c.R - 9 - n * 3.4), f, zc], 1.6, 145, { seg: 10 });
      }
      // east: green street cabinets, doors open on their cords; south: a fibre splice bench
      for (const zc of [-c.R * 0.45, 0, c.R * 0.45]) {
        const x = c.R - 24;
        k.box("cabinet", [x, f, zc], [30, 70, 46]);
        k.box("cabinetIn", [x - 15.2, f + 6, zc], [0.6, 58, 38]);
        k.add("cabinet", BOX, [x - 23, f + 35, zc - 31], [0, 0.9, 0], [1.4, 64, 22]);
        for (let t = -16; t <= 16; t += 2.4) {
          const L = 8 + r() * 30;
          k.box(cols[Math.floor(r() * cols.length)], [x - 15.8, f + 64 - L, zc + t], [0.8, L, 0.8]);
        }
        k.ico("beacon", [x, f + 72, zc], 1.4);
      }
      table(k, [0, f, c.R - 40], [120, 34], 0, "pedestal", "rackF", 26);
      for (let i = 0; i < 6; i++) k.cyl(cols[i], [-50 + i * 20, f + 28, c.R - 40], 4, 3, { seg: 14 });
      // big cable drums on the raised floor, manhole covers
      around(c, 7, 92, 0.35).forEach(([x, z, a], i) => {
        if (homeSide(x, z)) return;
        const R = 20 + (i % 3) * 4;
        const ry = Math.PI / 2 - a;
        const p = frameAt(x, z, ry);
        for (const t of [-11, 11]) {
          const [fx0, fz0] = p(t, 0);
          k.cyl("drum", [fx0, f + R, fz0], R, 2.6, { seg: 24, axis: "x", ry });
        }
        k.cyl(cols[i % 4], [x, f + R, z], R * 0.72, 19.6, { seg: 20, axis: "x", ry });
        k.cyl("drumCore", [x, f + R, z], 2.6, 26, { seg: 8, axis: "x", ry });
        for (let w = -8; w <= 8; w += 4) {
          const [wx, wz] = p(w, 0);
          k.cyl(cols[(i + 4) % cols.length], [wx, f + R + R * 0.72 - 0.4, wz], 0.9, 0.4, { seg: 6 });
        }
      });
      for (const [x, z] of [[-ox - 40, oz + 30], [ox + 30, -oz - 40]]) k.cyl("cover", [x, f, z], 12, 0.4, { seg: 24 });
      // a giant cable cross-section: jacket, filler, coloured fibre tubes round a steel strength member
      const [sx, sz] = [-ox - 70, -oz - 40];
      k.box("pedestal", [sx, f, sz], [44, 26, 46]);
      const sy = f + 26 + 18;
      k.cyl("cableK", [sx, sy, sz], 17, 52, { seg: 32, axis: "z" });
      k.cyl("filler", [sx, sy, sz], 14.5, 52.4, { seg: 32, axis: "z" });
      for (let n = 0; n < 6; n++) {
        const a = (n / 6) * TAU;
        k.cyl(cols[n], [sx + Math.cos(a) * 8, sy + Math.sin(a) * 8, sz], 3.4, 53, { seg: 16, axis: "z" });
      }
      k.cyl("tray", [sx, sy, sz], 2.2, 53.2, { seg: 12, axis: "z" });
    },
  },

  // 06 autonomous: a robotics lab: glossy epoxy with a painted test loop and fiducials, a glass partition north,
  // an LED video wall west, robot arms on pedestals, AGVs on chargers, a drone pad, lidar tripods
  lab: {
    colors: {
      floor: ["#d5d9dd", 0.3, 0.05, { fx: "ground", scale: 0.6 }], lane: ["#545a63", 0.8], wall: ["#f2f4f6", 0.85], mull: ["#2c3139", 0.4],
      video: ["#0d1626", 0.5, 0.2, { fx: "screen", cell: [56, 36], glow: "#5ab8ff" }], arm: ["#f08a24", 0.45, 0.2], armW: ["#eef1f4", 0.45], pedestal: ["#3a3f48", 0.5, 0.3],
      agv: ["#eef1f4", 0.4], agvStripe: ["#2f6fd0", 0.5], pad: ["#2c3139", 0.6], tripod: ["#2c3139", 0.5], lidar: ["#1d2026", 0.3, 0.5], fence: ["#f2b632", 0.6], mesh: ["#9aa3ad", 0.5, 0.4, { fx: "ribs", space: 1.2 }],
    },
    glow: { pane: ["#e9f4ff", 1.7], led: ["#4fb0ff", 2], dock: ["#5ee7ff", 2], qr: ["#ffffff", 0.9] },
    hemi: ["#f1f6ff", "#8a96a4"], sun: "#ffffff",
    build(k, c) {
      const r = rng(61);
      // painted test loop round the plinth, centre dashes, yellow edges and fiducial markers
      const hx = c.bx + 34;
      const hz = c.bz + 30;
      frame(k, "lane", hx, hz, 22, c.y, 0.08);
      for (const e of [-11, 11]) frame(k, "yellow", hx + e, hz + e, 1, c.y + 0.08, 0.04);
      for (let x = -hx + 6; x < hx; x += 14) for (const s of [-1, 1]) k.box("paint", [x, c.y + 0.09, s * hz], [7, 0.03, 0.8]);
      for (let z = -hz + 6; z < hz; z += 14) for (const s of [-1, 1]) k.box("paint", [s * hx, c.y + 0.09, z], [0.8, 0.03, 7]);
      for (let i = 0; i < 24; i++) {
        const [x, z] = [(r() - 0.5) * c.R * 1.4, (r() - 0.5) * c.R * 1.4];
        if (Math.abs(x) < hx + 20 && Math.abs(z) < hz + 20) continue;
        k.box("dark", [x, c.y, z], [10, 0.06, 10]);
        k.box("qr", [x, c.y + 0.07, z], [6, 0.02, 6]);
      }
      walls(k, "wall", c);
      windowOn(k, c, "N", -c.R * 0.88, c.R * 0.88, c.y + 4, c.y + c.H * 0.7, { cols: 9, rows: 2 });
      panel(k, "yellow", "N", -c.R * 0.88, c.R * 0.88, c.y + 30, c.y + 33, c.R - 2.4, 1);
      panel(k, "video", "W", -c.R * 0.72, c.R * 0.72, c.y + 28, c.y + c.H * 0.66, c.R - 3, 3);
      panel(k, "mull", "W", -c.R * 0.74, c.R * 0.74, c.y + 24, c.y + 28, c.R - 3.5, 5);
      for (const s of ["E", "S"]) panel(k, "led", s, -c.R, c.R, c.y + 36, c.y + 38, c.R - 1.2, 1);
      // robot arms on pedestals (one in a fenced cell)
      around(c, 6, 120, 0.3).forEach(([x, z, a], i) => {
        if (homeSide(x, z) || i % 2) return;
        const ry = r() * TAU;
        const p = frameAt(x, z, ry);
        k.cyl("pedestal", [x, c.y, z], 9, 16, { seg: 16 });
        k.cyl("arm", [x, c.y + 16, z], 7, 6, { seg: 16 });
        const lean = 0.5 + r() * 0.4;
        const [ux, uz] = p(Math.sin(lean) * 16, 0);
        k.add("arm", BOX, [ux, c.y + 22 + Math.cos(lean) * 16, uz], [0, ry, -lean], [6, 34, 6]);
        const [ex, ez] = p(Math.sin(lean) * 32, 0);
        k.ico("armW", [ex, c.y + 22 + Math.cos(lean) * 32, ez], 4.4, { detail: 1 });
        const [fx, fz] = p(Math.sin(lean) * 32 + 12, 0);
        k.add("armW", BOX, [fx, c.y + 22 + Math.cos(lean) * 32 - 4, fz], [0, ry, 1.2], [5, 26, 5]);
        if (i === 0) {
          frame(k, "fence", 30, 30, 1, c.y, 24, [x, z]);
          frame(k, "mesh", 30, 30, 0.4, c.y + 2, 20, [x, z]);
        }
      });
      // AGVs on their chargers along the east side, a drone pad and lidar tripods
      for (let i = 0; i < 5; i++) {
        const z = -c.R * 0.5 + i * 44;
        const x = c.R - 50;
        k.box("dock", [x + 18, c.y, z], [3, 10, 18]);
        k.box("agv", [x, c.y + 2, z], [30, 8, 22], { r: 3 });
        k.box("agvStripe", [x, c.y + 5, z], [30.4, 1.6, 22.4]);
        for (const [dx, dz] of [[-10, -11], [10, -11], [-10, 11], [10, 11]]) k.cyl("dark", [x + dx, c.y + 2, z + dz], 2, 1.2, { seg: 10, axis: "z" });
      }
      k.cyl("pad", [-c.R * 0.45, c.y, c.R * 0.45], 26, 0.2, { seg: 32 });
      k.box("yellow", [-c.R * 0.45, c.y + 0.2, c.R * 0.45], [4, 0.05, 22]);
      k.box("yellow", [-c.R * 0.45, c.y + 0.2, c.R * 0.45], [16, 0.05, 4]);
      for (const [x, z] of [[-c.bx - 40, -c.bz - 30], [c.bx + 40, -c.bz - 30], [-c.bx - 40, c.bz + 30]]) {
        for (let t = 0; t < 3; t++) {
          const a = (t / 3) * TAU;
          k.add("tripod", BOX, [x + Math.cos(a) * 5, c.y + 12, z + Math.sin(a) * 5], [Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35], [1.2, 26, 1.2]);
        }
        k.cyl("lidar", [x, c.y + 24, z], 3.2, 4, { seg: 16 });
      }
    },
  },

  // 07 cyber: a security operations centre: a dark floor with a glowing grid, a video wall north, server racks west,
  // operator desks with screens facing the wall, cyan edge lights, rotating rings round the plinth
  soc: {
    colors: {
      stand: ["#0e1a33", 0.4, 0.3], trim: ["#35e0ff", 0.3],
      floor: ["#0d1628", 0.35, 0.4, { fx: "grid", cell: 30 }], wall: ["#121c30", 0.6, 0.3],
      video: ["#0a1222", 0.5, 0.2, { fx: "screen", cell: [64, 42], glow: "#4fc3ff" }], monitor: ["#0a1222", 0.5, 0.2, { fx: "screen", cell: [26, 16], glow: "#6fd3ff" }],
      rack: ["#101b33", 0.4, 0.5, { fx: "led" }], rackTop: ["#1a2b4f", 0.4, 0.4], desk: ["#1c2840", 0.5, 0.3], seat: ["#24314d", 0.7],
    },
    glow: { edge: ["#35e0ff", 1.8], ringA: ["#35e0ff", 1.6], ringB: ["#8f6bff", 1.6], aisle: ["#2f7dff", 1.4] },
    hemi: ["#5a7fd0", "#0a1428"], sun: "#9fc3ff",
    build(k, c, fx) {
      frame(k, "edge", c.bx + 9, c.bz + 9, 0.8, c.y, 0.1);
      walls(k, "wall", c);
      panel(k, "video", "N", -c.R * 0.8, c.R * 0.8, c.y + 22, c.y + c.H * 0.72, c.R - 3, 3);
      for (const s of ["E", "S", "N"]) for (const yl of [2, c.H * 0.78]) panel(k, "edge", s, -c.R, c.R, c.y + yl, c.y + yl + 1.6, c.R - 1.2, 1);
      // server racks along the west wall with a lit cold aisle
      for (let z = -c.R * 0.86; z < c.R * 0.86; z += 38) {
        k.box("rack", [-c.R + 26, c.y, z + 18], [34, 120, 36]);
        k.box("rackTop", [-c.R + 26, c.y + 120, z + 18], [36, 3, 37]);
      }
      panel(k, "aisle", "W", -c.R * 0.86, c.R * 0.86, c.y, c.y + 0.2, c.R - 52, 10);
      // two rows of operator desks, two screens each, facing the video wall
      for (const [row, zc] of [[0, -c.R * 0.48], [1, -c.R * 0.66]]) {
        for (let x = -c.R * 0.5 + row * 30; x <= c.R * 0.5; x += 62) {
          table(k, [x, c.y, zc], [56, 26], 0, "desk", "desk", 24);
          for (const dx of [-13, 13]) {
            k.box("monitor", [x + dx, c.y + 27, zc - 8], [24, 15, 1.6]);
            k.box("dark", [x + dx, c.y + 26, zc - 7], [2, 3, 2]);
          }
          chair(k, [x, c.y, zc + 22], Math.PI, "seat", "dark");
        }
      }
      // rotating dashed rings round the plinth
      for (const [rad, mat, speed] of [[Math.max(c.bx, c.bz) + 36, "ringA", 0.12], [Math.max(c.bx, c.bz) + 50, "ringB", -0.08]]) {
        const g = new Kit();
        for (let q = 0; q < 4; q++) g.add(mat, new THREE.TorusGeometry(1, 0.01, 4, 40, TAU / 5), [0, 0, 0], [Math.PI / 2, 0, (q * TAU) / 4], [rad, rad, rad]);
        fx.groups.push({ kit: g, at: [0, c.y + 0.4, 0], speed });
      }
    },
  },

  // 09 utility: an energy gallery: stone floor with a glowing grid map round the plinth, a window band under solar
  // cladding north, a live grid display west, oak slat walls, model wind turbines turning, battery cabinets
  energy: {
    colors: {
      floor: ["#dcd6ca", 0.6, 0, { fx: "tiles", size: [36, 36] }], map: ["#2e3b46", 0.7], wall: ["#e6e9e1", 0.9], slat: ["#c79a64", 0.7, 0, { fx: "ribs", space: 6 }],
      solar: ["#22355a", 0.25, 0.5, { fx: "tiles", size: [30, 18] }], mull: ["#3a3f48", 0.5], display: ["#0e1824", 0.6], tower: ["#f3f5f7", 0.45], plinth: ["#3a3f48", 0.5],
      battery: ["#eef1f4", 0.4, 0.2, { fx: "led", glow: "#5effa8" }], panelS: ["#26385a", 0.25, 0.5],
    },
    glow: { pane: ["#fff3dc", 1.8], net: ["#4fe3a8", 1.8], netB: ["#4fb8ff", 1.8], bar: ["#ffd24f", 1.8] },
    hemi: ["#fff1df", "#8a8a76"], sun: "#ffe2b8",
    build(k, c, fx) {
      const r = rng(91);
      // the grid map inlaid in the floor: nodes joined by glowing lines
      const mx = c.bx + 70;
      const mz = c.bz + 60;
      k.box("map", [0, c.y, 0], [mx * 2, 0.1, mz * 2]);
      let [px, pz] = [-mx + 10, -mz + 10];
      for (let i = 0; i < 40; i++) {
        const [nx, nz] = [(r() - 0.5) * mx * 1.9, (r() - 0.5) * mz * 1.9];
        if (Math.abs(nx) < c.bx + 6 && Math.abs(nz) < c.bz + 6) continue;
        const mat = i % 3 ? "net" : "netB";
        k.box(mat, [(px + nx) / 2, c.y + 0.1, pz], [Math.abs(nx - px) + 0.8, 0.05, 0.8]);
        k.box(mat, [nx, c.y + 0.1, (pz + nz) / 2], [0.8, 0.05, Math.abs(nz - pz) + 0.8]);
        k.box(mat, [nx, c.y + 0.1, nz], [3.4, 0.08, 3.4]);
        [px, pz] = [nx, nz];
      }
      walls(k, "wall", c);
      windowOn(k, c, "N", -c.R * 0.86, c.R * 0.86, c.y + 30, c.y + 92, { cols: 12, rows: 1 });
      panel(k, "solar", "N", -c.R * 0.86, c.R * 0.86, c.y + 100, c.y + c.H * 0.86, c.R - 1.4, 1);
      panel(k, "display", "W", -c.R * 0.7, c.R * 0.7, c.y + 24, c.y + c.H * 0.66, c.R - 2, 2);
      const top = c.y + c.H * 0.66;
      for (let i = 0; i < 9; i++) {
        const z = -c.R * 0.62 + i * c.R * 0.155;
        panel(k, i % 2 ? "net" : "netB", "W", z, z + 1.2, c.y + 40, top - 14, c.R - 3.2, 0.6);
        panel(k, "net", "W", -c.R * 0.62, c.R * 0.62, c.y + 40 + i * 10, c.y + 41.2 + i * 10, c.R - 3.2, 0.6);
        panel(k, "bar", "W", z + 4, z + 14, c.y + 30, c.y + 34 + r() * 50, c.R - 3.4, 0.6);
      }
      for (const s of ["E", "S"]) panel(k, "slat", s, -c.R, c.R, c.y, c.y + c.H * 0.6, c.R - 1.4, 2);
      // model wind turbines turning on round plinths, battery cabinets, a solar display, plants
      around(c, 8, 150, 0.25).forEach(([x, z], i) => {
        if (homeSide(x, z) || i % 2) return;
        const h = 80;
        k.cyl("plinth", [x, c.y, z], 12, 6, { seg: 20 });
        k.cyl("tower", [x, c.y + 6, z], 2, h, { seg: 12, r2: 1.1 });
        k.box("tower", [x, c.y + 6 + h - 2, z], [4, 4, 9], { ry: 0.5 });
        fx.rotors.push({ at: [x + Math.sin(0.5) * 5, c.y + 6 + h, z + Math.cos(0.5) * 5], ry: 0.5, L: 30, speed: 0.8 + i * 0.1, phase: i });
      });
      for (let i = 0; i < 6; i++) k.box("battery", [c.R - 30, c.y, -c.R * 0.5 + i * 34], [26, 70, 30]);
      for (const [x, z] of [[c.bx + 80, -c.bz - 70], [-c.bx - 80, c.bz + 70]]) {
        for (const dx of [-12, 12]) k.box("dark", [x + dx, c.y, z], [1.4, 16, 1.4]);
        k.add("panelS", BOX, [x, c.y + 18, z], [-0.5, 0, 0], [40, 1.2, 24]);
      }
      potted(k, [-c.R + 50, c.y, -c.R + 50], 56, 5);
      potted(k, [c.R - 50, c.y, -c.R + 50], 48, 9);
    },
  },

  // 10 cloud: a round white sky lounge: glossy floor with LED rings, a panoramic band of sky with drifting clouds,
  // cove light, server pods, lounge seats, cloud puffs floating in the room, a slow halo round the plinth
  lounge: {
    colors: {
      stand: ["#e9eef6", 0.5], trim: ["#7fd6ff", 0.3],
      floor: ["#f1f4f8", 0.16, 0.1], wallIn: ["#f6f8fb", 0.85, 0, { double: true }], sky: ["#000000", 1, 0, { fx: "sky", from: 34, span: 120, double: true }],
      pod: ["#f4f7fb", 0.35], podCore: ["#6f95c9", 0.2, 0.4], pouf: ["#dbe7f5", 0.7], pouf2: ["#8fb8e8", 0.7], cloud: ["#ffffff", 1],
    },
    glow: { ledRing: ["#7fe3ff", 1.3], cove: ["#dff6ff", 1.6], podLight: ["#c8f4ff", 1.5] },
    hemi: ["#ffffff", "#b9c8de"], sun: "#ffffff",
    round: true,
    build(k, c, fx) {
      const r = rng(101);
      for (const rad of [Math.max(c.bx, c.bz) + 36, Math.max(c.bx, c.bz) + 80, c.R * 0.7]) {
        k.add("ledRing", new THREE.TorusGeometry(rad, 1.5, 4, 128), [0, c.y + 0.1, 0], [Math.PI / 2, 0, 0]);
      }
      k.add("wallIn", OPEN, [0, c.y + c.H / 2, 0], [0, 0, 0], [c.R, c.H, c.R]);
      k.add("sky", OPEN, [0, c.y + 34 + 60, 0], [0, 0, 0], [c.R - 1.5, 120, c.R - 1.5]);
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * TAU;
        k.box("wallIn", [Math.cos(a) * (c.R - 3), c.y + 34, Math.sin(a) * (c.R - 3)], [3, 120, 3], { ry: -a });
      }
      k.add("cove", new THREE.TorusGeometry(c.R - 2, 1.2, 4, 96), [0, c.y + 34 + 124, 0], [Math.PI / 2, 0, 0]);
      k.add("cove", new THREE.TorusGeometry(c.R - 2, 1.2, 4, 96), [0, c.y + 30, 0], [Math.PI / 2, 0, 0]);
      // server pods: white base and cap round a glassy core with vertical light strips
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + 0.5;
        const [x, z] = [Math.cos(a) * c.R * 0.72, Math.sin(a) * c.R * 0.72];
        if (homeSide(x, z)) continue;
        k.cyl("pod", [x, c.y, z], 22, 6, { seg: 32 });
        k.cyl("podCore", [x, c.y + 6, z], 17, 70, { seg: 32 });
        for (let s = 0; s < 12; s++) {
          const b = (s / 12) * TAU;
          k.box("podLight", [x + Math.cos(b) * 17.2, c.y + 10, z + Math.sin(b) * 17.2], [1.4, 62, 1.4], { ry: -b });
        }
        k.cyl("pod", [x, c.y + 76, z], 22, 6, { seg: 32 });
      }
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU + 0.2;
        const d = Math.max(c.bx, c.bz) + 60 + (i % 2) * 14;
        const [x, z] = [Math.cos(a) * d, Math.sin(a) * d];
        k.cyl(i % 3 ? "pouf" : "pouf2", [x, c.y, z], 8, 9, { seg: 16 });
      }
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + 0.3;
        const d = c.R * 0.82;
        const [x, y, z] = [Math.cos(a) * d, c.y + c.H * 0.62 + r() * 20, Math.sin(a) * d];
        for (let j = 0; j < 5; j++) k.ico("cloud", [x + (r() - 0.5) * 30, y + r() * 6, z + (r() - 0.5) * 30], 9 + r() * 7, { detail: 2, scale: [1, 0.55, 1] });
      }
      const halo = new Kit();
      for (let q = 0; q < 3; q++) halo.add("ledRing", new THREE.TorusGeometry(1, 0.012, 4, 40, TAU / 4.5), [0, 0, 0], [Math.PI / 2, 0, (q * TAU) / 3], [Math.max(c.bx, c.bz) + 22, Math.max(c.bx, c.bz) + 22, Math.max(c.bx, c.bz) + 22]);
      fx.groups.push({ kit: halo, at: [0, c.y + 0.6, 0], speed: 0.1 });
    },
  },
};

// ---------- moving parts ----------

const POS = new THREE.Vector3();
const M4 = new THREE.Matrix4();
const Q = new THREE.Quaternion();
const EUL = new THREE.Euler();
const SCL = new THREE.Vector3();

// three-bladed rotors turning on their hubs (blades in the local xy plane, facing +z, then turned by ry)
function Rotors({ list }) {
  const mesh = useMemo(() => {
    const k = new Kit();
    k.ico("white", [0, 0, 0], 0.06, { detail: 1 });
    for (let b = 0; b < 3; b++) {
      const a = (b * TAU) / 3;
      k.add("white", BOX, [Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0], [0, 0, a - Math.PI / 2], [0.06, 1, 0.02]);
    }
    const [{ geometry }] = k.build();
    const m = new THREE.InstancedMesh(geometry, new THREE.MeshStandardMaterial({ color: "#f3f5f7", roughness: 0.5 }), list.length);
    m.frustumCulled = false;
    m.raycast = () => {};
    return m;
  }, [list]);
  useEffect(
    () => () => {
      mesh.geometry.dispose();
      mesh.material.dispose();
      mesh.dispose();
    },
    [mesh]
  );
  useFrame(({ clock }) => {
    list.forEach((o, i) => {
      Q.setFromEuler(EUL.set(0, o.ry, clock.elapsedTime * o.speed + o.phase, "YXZ"));
      M4.compose(POS.set(...o.at), Q, SCL.set(o.L, o.L, o.L));
      mesh.setMatrixAt(i, M4);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  return <primitive object={mesh} />;
}

// a merged group turning slowly about y (rings, halos)
function Spin({ g, meshes, mat }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * g.speed;
  });
  return (
    <group position={g.at} ref={ref}>
      {meshes.map(({ key, geometry }) => (
        <mesh key={key} geometry={geometry} material={mat(key)} raycast={() => {}} />
      ))}
    </group>
  );
}

// base: diorama half size [x, z]; reach: how far the camera may pull back (the walls stay beyond it); theme: which room
export function ThemedRoom({ base, reach = 230, top = -2.1, theme }) {
  const room = ROOMS[theme] || ROOMS.atrium;
  const built = useMemo(() => {
    const [bx, bz] = base;
    const y = top - 14;
    const R = reach + 90;
    const k = new Kit();
    const fx = { rotors: [], groups: [] };
    if (room.round) k.cyl("floor", [0, y - 1, 0], R + 4, 1, { seg: 96 });
    else k.box("floor", [0, y - 1, 0], [R * 2.4, 1, R * 2.4]);
    k.box("stand", [0, y, 0], [bx * 2 + 6, top - y, bz * 2 + 6], { r: 1.4 });
    k.box("trim", [0, top - 0.35, 0], [bx * 2 + 6.3, 0.3, bz * 2 + 6.3], { r: 0.12 });
    room.build(k, { y, top, bx, bz, reach, R, H: R * 0.62 }, fx);
    const pal = palette({ ...BASE, ...room.colors }, { ...GLOW, ...room.glow }, y);
    return { meshes: k.build(), groups: fx.groups.map((g) => ({ g, meshes: g.kit.build() })), rotors: fx.rotors, pal };
  }, [base, reach, top, room]);
  useEffect(
    () => () => {
      built.meshes.forEach((m) => m.geometry.dispose());
      built.groups.forEach(({ meshes }) => meshes.forEach((m) => m.geometry.dispose()));
      built.pal.all().forEach((m) => m.dispose());
    },
    [built]
  );
  useFrame(({ clock }) => {
    TIME.value = clock.elapsedTime;
    const on = Math.sin(clock.elapsedTime * 3) > 0.2;
    built.pal.blink.forEach(([m, c]) => m.color.copy(c).multiplyScalar(on ? 1 : 0.12));
  });
  const { meshes, groups, rotors, pal } = built;
  return (
    <group>
      <hemisphereLight args={[room.hemi[0], room.hemi[1], 1.05]} />
      <directionalLight position={[-160, 220, -120]} intensity={1.7} color={room.sun} />
      {meshes.map(({ key, geometry }) => (
        <mesh key={key} geometry={geometry} material={pal.get(key)} raycast={() => {}} />
      ))}
      {groups.map(({ g, meshes: gm }, i) => (
        <Spin key={i} g={g} meshes={gm} mat={pal.get} />
      ))}
      {rotors.length > 0 && <Rotors list={rotors} />}
    </group>
  );
}
