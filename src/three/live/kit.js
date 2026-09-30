// Building blocks for the code-built "live" dioramas (real-time light, no baking).
// Kit collects many primitives per material and merges them, so a whole diorama is a handful of draw calls.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const M4 = new THREE.Matrix4();
const Q = new THREE.Quaternion();
const E = new THREE.Euler();
const S = new THREE.Vector3();
const P = new THREE.Vector3();

const cache = new Map();
function proto(key, make) {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key);
}

// all parts are merged as plain position + normal triangles
function plain(geo) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  for (const name of Object.keys(g.attributes)) if (name !== "position" && name !== "normal") g.deleteAttribute(name);
  return g;
}

export class Kit {
  constructor() {
    this.bins = new Map();
  }

  add(mat, geo, pos, rot = [0, 0, 0], scale = [1, 1, 1], order = "XYZ") {
    E.set(rot[0], rot[1], rot[2], order);
    Q.setFromEuler(E);
    M4.compose(P.set(pos[0], pos[1], pos[2]), Q, S.set(scale[0], scale[1], scale[2]));
    const g = plain(geo).applyMatrix4(M4);
    if (!this.bins.has(mat)) this.bins.set(mat, []);
    this.bins.get(mat).push(g);
    return this;
  }

  // box standing on `at` (bottom centre); r > 0 rounds the edges
  box(mat, at, size, { r = 0, ry = 0 } = {}) {
    const [sx, sy, sz] = size;
    const pos = [at[0], at[1] + sy / 2, at[2]];
    if (r > 0) {
      const rr = Math.min(r, sx / 2, sy / 2, sz / 2);
      const key = `rb${sx.toFixed(2)}_${sy.toFixed(2)}_${sz.toFixed(2)}_${rr.toFixed(2)}`;
      return this.add(mat, proto(key, () => new RoundedBoxGeometry(sx, sy, sz, 2, rr)), pos, [0, ry, 0]);
    }
    return this.add(mat, proto("box", () => new THREE.BoxGeometry(1, 1, 1)), pos, [0, ry, 0], size);
  }

  // cylinder standing on `at`; axis "x" / "z" lays it down centred on `at` (ry turns it with its owner)
  cyl(mat, at, r, h, { seg = 16, r2, axis = "y", ry = 0 } = {}) {
    const key = `cy${seg}_${r2 === undefined ? 1 : (r2 / r).toFixed(3)}`;
    const geo = proto(key, () => new THREE.CylinderGeometry(r2 === undefined ? 1 : r2 / r, 1, 1, seg));
    if (axis === "y") return this.add(mat, geo, [at[0], at[1] + h / 2, at[2]], [0, ry, 0], [r, h, r]);
    return this.add(mat, geo, at, axis === "x" ? [0, ry, Math.PI / 2] : [Math.PI / 2, ry, 0], [r, h, r], "YXZ");
  }

  ico(mat, center, r, { detail = 0, scale = [1, 1, 1], rot = [0, 0, 0] } = {}) {
    const geo = proto(`ico${detail}`, () => new THREE.IcosahedronGeometry(1, detail));
    return this.add(mat, geo, center, rot, [r * scale[0], r * scale[1], r * scale[2]]);
  }

  // [{ key, geometry }] — one merged geometry per material key
  build() {
    return [...this.bins.entries()].map(([key, parts]) => {
      const geometry = mergeGeometries(parts, false);
      parts.forEach((p) => p.dispose());
      geometry.computeBoundingSphere();
      return { key, geometry };
    });
  }
}

// deterministic random
export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ---------------------------------------------------------------- low-poly props

export function tree(kit, [x, y, z], { h = 6, seed = 1, kind = "round" } = {}) {
  const r = rng(seed);
  kit.cyl("bark", [x, y, z], 0.22 * (h / 6), h * 0.45, { seg: 6, r2: 0.14 * (h / 6) });
  if (kind === "cone") {
    for (let k = 0; k < 3; k++) kit.cyl(k % 2 ? "leaf2" : "leaf1", [x, y + h * (0.3 + k * 0.2), z], (1.9 - k * 0.45) * (h / 6), h * 0.36, { seg: 7, r2: 0.05 });
    return kit;
  }
  const n = 3 + Math.floor(r() * 2);
  for (let k = 0; k < n; k++) {
    const a = r() * Math.PI * 2;
    const d = k ? 0.6 + r() * 0.7 : 0;
    const rr = (1.5 + r() * 0.7) * (h / 6) * (k ? 0.75 : 1);
    kit.ico(["leaf1", "leaf2", "leaf3"][k % 3], [x + Math.cos(a) * d * (h / 6), y + h * (0.66 + r() * 0.16), z + Math.sin(a) * d * (h / 6)], rr, { scale: [1, 0.85, 1], rot: [r(), r(), r()] });
  }
  return kit;
}

export function bush(kit, [x, y, z], s = 1, seed = 3) {
  const r = rng(seed);
  for (let k = 0; k < 3; k++) kit.ico(k % 2 ? "leaf2" : "leaf3", [x + (r() - 0.5) * s, y + 0.45 * s, z + (r() - 0.5) * s], (0.55 + r() * 0.25) * s, { scale: [1, 0.75, 1], rot: [r(), r(), r()] });
  return kit;
}

// seated / standing figure (for merged, static people); shirt colour key picked by seed
export const SHIRTS = ["shirtA", "shirtB", "shirtC", "shirtD"];
export function person(kit, [x, y, z], { seed = 0, ry = 0, sit = false } = {}) {
  const r = rng(seed + 7);
  const shirt = SHIRTS[Math.floor(r() * SHIRTS.length)];
  const legs = sit ? 0.45 : 0.85;
  if (!sit) kit.box("pants", [x, y, z], [0.34, legs, 0.24], { r: 0.08, ry });
  else kit.box("pants", [x + Math.sin(ry) * 0.2, y + 0.45, z + Math.cos(ry) * 0.2], [0.34, 0.16, 0.5], { r: 0.07, ry });
  kit.box(shirt, [x, y + legs, z], [0.44, 0.62, 0.28], { r: 0.12, ry });
  kit.ico("skin", [x, y + legs + 0.8, z], 0.15, { detail: 1 });
  return kit;
}

export function car(kit, [x, y, z], { ry = 0, paint = "carWhite" } = {}) {
  const c = Math.cos(ry);
  const s = Math.sin(ry);
  const at = (dx, dy, dz) => [x + c * dx + s * dz, y + dy, z - s * dx + c * dz];
  kit.box(paint, at(0, 0.3, 0), [4.2, 0.75, 1.8], { r: 0.3, ry });
  kit.box("carGlass", at(-0.2, 0.95, 0), [2.3, 0.62, 1.64], { r: 0.25, ry });
  for (const dx of [-1.35, 1.35]) for (const dz of [-0.82, 0.82]) kit.cyl("tyre", at(dx, 0.36, dz), 0.36, 0.26, { seg: 12, axis: "z", ry });
  return kit;
}
