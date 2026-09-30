// Materials and static geometry of the live Smart Building diorama (three.js axes: x east, y up, +z south / viewer).
import * as THREE from "three";
import { Kit, bush, car, person, rng, tree } from "../kit";

// ---------------------------------------------------------------- layout
export const B = { x0: -15, x1: 9, z0: -12, z1: 3.5 }; // building footprint
export const LOBBY = 4.8;
export const FH = 3.8;
export const NF = 4; // office floors above the lobby
export const ROOF = LOBBY + NF * FH;
export const BASE = { x: 32, z: 24 }; // half size of the diorama base
export const STAND_Y = -9; // room floor
export const floorY = (k) => (k === 0 ? 0 : LOBBY + (k - 1) * FH);
export const floorH = (k) => (k === 0 ? LOBBY : FH);
// parking: two rows of eight bays either side of an aisle, cars nose-in
export const BAY_Z = Array.from({ length: 8 }, (_, i) => -18.2 + i * 2.6);
// car long axis along x; aisle side = +x for the west row, -x for the east row (cars slide in from there)
export const BAYS = [...BAY_Z.map((z) => ({ x: 15.6, z, ry: Math.PI, aisle: 1 })), ...BAY_Z.map((z) => ({ x: 27, z, ry: 0, aisle: -1 }))];

// ---------------------------------------------------------------- materials
const STD = {
  stand: ["#2b2f36", 0.55], standTrim: ["#434a55", 0.45], floor: ["#b89c7c", 0.7], wall: ["#e7e2d9", 0.92], slats: ["#8a6243", 0.7],
  frameDark: ["#2c3139", 0.45], pot: ["#ebe8e2", 0.6], potDark: ["#30343b", 0.6],
  base: ["#d8d4cb", 0.85], grass: ["#7db85b", 0.95], lawn: ["#6aa84c", 0.95], paving: ["#e5e0d5", 0.8], asphalt: ["#4a4f58", 0.9], paint: ["#f3f3ee", 0.6], soil: ["#7a5c43", 1],
  slab: ["#f4f3ef", 0.55], frame: ["#39404a", 0.4], core: ["#cdd2d8", 0.7], floorIn: ["#d9cebf", 0.8], terrazzo: ["#eeeae3", 0.45], canopy: ["#f7f7f4", 0.5],
  desk: ["#f2eee7", 0.6], wood: ["#b3845a", 0.6], chair: ["#2f3540", 0.7], monitor: ["#1b1f25", 0.4], sofa: ["#e0764f", 0.85],
  bark: ["#7a5a3e", 0.9], pants: ["#2c3955", 0.9], skin: ["#e0b08a", 0.7],
  shirtA: ["#f1f1f1", 0.9], shirtB: ["#3d84c6", 0.9], shirtC: ["#e2734f", 0.9], shirtD: ["#4fae8a", 0.9],
  carWhite: ["#f0f0ee", 0.3], carBlue: ["#3b6fb6", 0.3], carRed: ["#c9503f", 0.3], carGrey: ["#8c96a3", 0.3], carGlass: ["#1d2a38", 0.15], tyre: ["#1c1d20", 0.8],
  accent: ["#1f5fd6", 0.4], orange: ["#ff8a3d", 0.5], chiller: ["#dfe3e8", 0.5], bess: ["#eef1f4", 0.5], fence: ["#8d96a1", 0.5],
};
const FLAT = new Set(["leaf1", "leaf2", "leaf3"]);
const LEAVES = { leaf1: "#71b451", leaf2: "#4f9a40", leaf3: "#8fc862" };

export function makeMaterials() {
  const m = {};
  for (const [k, [c, r]] of Object.entries(STD)) m[k] = new THREE.MeshStandardMaterial({ color: c, roughness: r });
  for (const [k, c] of Object.entries(LEAVES)) m[k] = new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, flatShading: FLAT.has(k) });
  m.metal = new THREE.MeshStandardMaterial({ color: "#a5adb7", roughness: 0.3, metalness: 0.7 });
  m.solar = new THREE.MeshStandardMaterial({ color: "#1c3a73", roughness: 0.18, metalness: 0.4 });
  m.glass = new THREE.MeshStandardMaterial({ color: "#a9cfea", roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 1.6 });
  m.water = new THREE.MeshStandardMaterial({ color: "#5aa6d6", roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.85 });
  // emissive parts driven by the simulation (intensity set every frame)
  const glow = (c, i = 0) => new THREE.MeshStandardMaterial({ color: "#20242b", emissive: c, emissiveIntensity: i, roughness: 0.5, toneMapped: false });
  m.ceilLight = glow("#fff1d6");
  m.lampHead = glow("#ffd59c");
  m.screen = glow("#58a8ff", 1.4);
  m.ledGreen = glow("#4dff8c", 2.2);
  m.ledCyan = glow("#5ee7ff", 2.4);
  m.ledRed = glow("#ff5a4d", 2.2);
  m.sign = glow("#ffffff", 0);
  m.ceilNight = glow("#fff1d6");
  m.facadeLed = glow("#7fe8ff");
  m.windowPane = new THREE.MeshBasicMaterial({ color: "#eaf4ff", toneMapped: false });
  // warm light filling the storeys after dark (lit floors and a glow just inside the glass)
  m.floorIn.emissive.set("#ffd9a8");
  m.terrazzo.emissive.set("#ffd9a8");
  m.interiorGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.72, 0.42), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false });
  return m;
}

export function disposeAll(mats, builds) {
  Object.values(mats).forEach((x) => x.dispose());
  builds.flat().forEach((b) => b.geometry.dispose());
}

// ---------------------------------------------------------------- room around the display stand

export function buildRoom() {
  const k = new Kit();
  // floor, walls with a big window on the north and west sides, wooden slat wall on the east
  k.box("floor", [0, STAND_Y - 1, 0], [520, 1, 460]);
  const H = 150;
  const wall = (x0, z0, x1, z1) => k.box("wall", [(x0 + x1) / 2, STAND_Y, (z0 + z1) / 2], [Math.max(2, x1 - x0), H, Math.max(2, z1 - z0)]);
  // north wall z = -160 with a window x -120..120, y -2..118
  wall(-260, -162, -120, -160);
  wall(120, -162, 260, -160);
  k.box("wall", [0, STAND_Y, -161], [240, 7, 2]);
  k.box("wall", [0, 118, -161], [240, H - 127, 2]);
  // west wall x = -200 with a window z -110..90
  wall(-202, -160, -200, -110);
  wall(-202, 90, -200, 230);
  k.box("wall", [-201, STAND_Y, -10], [2, 7, 200]);
  k.box("wall", [-201, 118, -10], [2, H - 127, 200]);
  wall(200, -160, 202, 230); // east
  wall(-200, 228, 200, 230); // south
  for (let i = 0; i < 26; i++) k.box("slats", [199, STAND_Y, -140 + i * 7], [1.2, H - 20, 3.2]);
  // window frames
  for (let i = 0; i <= 6; i++) k.box("frameDark", [-120 + i * 40, -2, -159.5], [2.2, 120, 2.4]);
  for (let j = 0; j <= 3; j++) k.box("frameDark", [0, -2 + j * 40, -159.5], [242, 2.2, 2.4]);
  for (let i = 0; i <= 5; i++) k.box("frameDark", [-199.5, -2, -110 + i * 40], [2.4, 120, 2.2]);
  for (let j = 0; j <= 3; j++) k.box("frameDark", [-199.5, -2 + j * 40, -10], [2.4, 2.2, 202]);
  // potted plants framing the stand
  for (const [x, z, h, s] of [[64, 44, 34, 11], [-70, -46, 40, 12], [-62, 52, 28, 13], [70, -54, 36, 14], [150, 120, 44, 15], [-150, 60, 40, 16]]) {
    k.cyl("potDark", [x, STAND_Y, z], 4.2, 7, { seg: 10, r2: 5 });
    tree(k, [x, STAND_Y + 7, z], { h, seed: s });
  }
  // the display stand under the diorama base, with a trim line and control plaques on the front
  k.box("stand", [0, STAND_Y, 0], [BASE.x * 2 + 8, -1.4 - STAND_Y, BASE.z * 2 + 8], { r: 1.2 });
  k.box("standTrim", [0, -1.6, 0], [BASE.x * 2 + 8.2, 0.25, BASE.z * 2 + 8.2], { r: 0.1 });
  return k.build();
}

// ---------------------------------------------------------------- site (base, roads, car park, garden)

export function buildSite() {
  const k = new Kit();
  const r = rng(40);
  k.box("base", [0, -1.4, 0], [BASE.x * 2, 1.4, BASE.z * 2], { r: 0.5 });
  const plate = (mat, x0, z0, x1, z1, h = 0.12) => k.box(mat, [(x0 + x1) / 2, 0, (z0 + z1) / 2], [x1 - x0, h, z1 - z0]);
  plate("asphalt", -BASE.x, 15.5, BASE.x, BASE.z - 0.6);
  plate("paving", -BASE.x, 11.5, BASE.x, 15.5, 0.26);
  plate("paving", -17, 3.5, 11.2, 11.5, 0.22);
  plate("grass", -BASE.x + 0.4, -BASE.z + 0.4, -17, 11.5, 0.18);
  plate("grass", -17, -BASE.z + 0.4, 11.2, -12.5, 0.18);
  plate("asphalt", 11.2, -21, BASE.x - 0.6, 11.5, 0.16);
  plate("paving", -17, -12.5, 11.2, 3.5, 0.2); // under the building
  // road markings, zebra into the plaza, car-park lines and wheel stops
  for (let i = 0; i < 11; i++) k.box("paint", [-29 + i * 6, 0.12, 19.6], [2.6, 0.02, 0.18]);
  for (let i = 0; i < 6; i++) k.box("paint", [-3.2, 0.12, 16.2 + i * 1.2], [3.2, 0.02, 0.55]);
  for (const x of [13, 18.2, 24.4, 29.6]) for (let i = 0; i <= 8; i++) k.box("paint", [x < 20 ? 15.6 : 27, 0.16, -19.5 + i * 2.6], [5.2, 0.02, 0.12]);
  BAYS.forEach((b) => k.box("paving", [b.x - b.aisle * 2.2, 0.16, b.z], [0.25, 0.14, 1.6]));
  for (let i = 0; i < 6; i++) k.box("paint", [21.3, 0.16, -16 + i * 4], [0.18, 0.02, 2]);
  // garden: lawn, trees, pond, paths, benches
  plate("lawn", -30, -21, -19, 9, 0.22);
  plate("paving", -26.6, -21, -25.2, 9, 0.26);
  plate("water", -30.5, 1, -27.4, 8, 0.24);
  for (const [x, z, h, s, kind] of [[-29, -19, 7, 1], [-21.5, -18.5, 8, 2], [-29.5, -11, 6.5, 3, "cone"], [-21, -9.5, 7.5, 4], [-22, 0.5, 6.5, 5], [-21, 7, 6, 6, "cone"], [-8, -20.5, 7, 7], [0, -21, 6, 8, "cone"], [7.5, -19.5, 7.5, 9], [-15.5, -20, 6.5, 10]]) tree(k, [x, 0.2, z], { h, seed: s, kind });
  for (const x of [-26, -14, -6, 2, 10, 30]) tree(k, [x, 0.26, 12.8], { h: 6.5, seed: 30 + x, kind: "round" });
  for (let i = 0; i < 12; i++) bush(k, [-15 + i * 2.1, 0.22, 4.4], 0.9, 60 + i);
  for (let i = 0; i < 9; i++) bush(k, [-16.2, 0.2, -11 + i * 1.8], 0.8, 80 + i);
  for (const [x, z, ry] of [[-24, -5, Math.PI / 2], [-24, 3, Math.PI / 2], [-10, 9.8, 0], [4, 9.8, 0]]) {
    k.box("wood", [x, 0.6, z], [1.8, 0.1, 0.55], { r: 0.04, ry });
    for (const d of [-0.7, 0.7]) k.box("frame", [x + (ry ? 0 : d), 0.22, z + (ry ? d : 0)], [ry ? 0.5 : 0.08, 0.4, ry ? 0.08 : 0.5]);
  }
  // street lights along the footway (heads glow at night)
  for (const x of [-28, -18, -8, 6, 16, 26]) {
    k.cyl("frame", [x, 0.26, 14.6], 0.1, 5.4, { seg: 8 });
    k.box("frame", [x, 5.55, 15.3], [0.2, 0.14, 1.6]);
  }
  // energy yard: battery storage container, inverters, transformer behind a fence
  k.box("bess", [-24.8, 0.22, -15.5], [6, 2.6, 2.5], { r: 0.1 });
  k.box("accent", [-24.8, 2.3, -14.23], [6.02, 0.3, 0.02]);
  for (let i = 0; i < 3; i++) k.box("chiller", [-29.4 + i * 0.9, 0.22, -12.4], [0.7, 1.4, 0.5], { r: 0.05 });
  k.box("chiller", [-29.6, 0.22, -4], [2.2, 2, 1.8], { r: 0.1 });
  for (let i = 0; i < 8; i++) k.box("fence", [-31 + i * 0.7, 0.22, -1.8], [0.05, 1.6, 0.05]);
  // parking: EV chargers at the end of the east row, guidance sign post, barrier post
  for (let i = 0; i < 4; i++) k.box("slab", [29.9, 0.16, -18.2 + i * 2.6], [0.4, 1.5, 0.5], { r: 0.06 });
  k.cyl("frame", [19, 0.16, 12.9], 0.1, 3.2, { seg: 8 });
  k.box("frame", [23.9, 0.16, 10.2], [0.4, 1.1, 0.4], { r: 0.05 });
  // plaza: bollards, bike rack, flag of planters
  for (let i = 0; i < 8; i++) k.cyl("frame", [-15 + i * 3.4, 0.26, 11.2], 0.14, 0.9, { seg: 8 });
  for (let i = 0; i < 5; i++) k.box("metal", [-19.8, 0.22, 5 + i * 0.7], [1.2, 0.7, 0.05]);
  // parked-by-hand scooter and a van on the service yard behind
  car(k, [-2, 0.2, -18], { paint: "carWhite", ry: 0.1 });
  for (let i = 0; i < 4; i++) person(k, [-26 + r() * 2, 0.26, -6 + i * 3], { seed: 90 + i, ry: r() * 6 });
  return k.build();
}

// ---------------------------------------------------------------- building

// Static shell and fit-out of one storey, in the storey's own frame (y = 0 at its floor).
export function buildStorey(k, idx, seed) {
  const r = rng(seed);
  const h = floorH(idx);
  const { x0, x1, z0, z1 } = B;
  const k2 = k;
  k2.box("slab", [(x0 + x1) / 2, 0, (z0 + z1) / 2], [x1 - x0 + 0.5, 0.35, z1 - z0 + 0.5]);
  k2.box(idx === 0 ? "terrazzo" : "floorIn", [(x0 + x1) / 2, 0.35, (z0 + z1) / 2], [x1 - x0 - 0.4, 0.03, z1 - z0 - 0.4]);
  k2.box("core", [-2, 0.35, -8], [6.4, h - 0.35, 5.6]);
  k2.box("frame", [-3.2, 0.38, -5.18], [1.1, 2.4, 0.05]);
  k2.box("frame", [-1.8, 0.38, -5.18], [1.1, 2.4, 0.05]);
  // mullions round the curtain wall; the corner columns carry the slabs
  const perim = [];
  for (let x = x0; x <= x1 + 0.01; x += 1.6) perim.push([x, z1], [x, z0]);
  for (let z = z0 + 1.55; z < z1 - 0.05; z += 1.55) perim.push([x0, z], [x1, z]);
  perim.forEach(([x, z]) => k2.box("frame", [x, 0.35, z], [0.12, h - 0.35, 0.12]));
  for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) k2.box("slab", [x, 0.35, z], [0.5, h - 0.35, 0.5]);
  k2.box("frame", [(x0 + x1) / 2, h - 0.12, z1], [x1 - x0, 0.12, 0.14]);
  k2.box("frame", [(x0 + x1) / 2, h - 0.12, z0], [x1 - x0, 0.12, 0.14]);
  // ceiling light panels and IoT sensor discs
  const lights = [];
  for (let x = x0 + 1.6; x < x1 - 1; x += 3.2) for (let z = z0 + 1.6; z < z1 - 1; z += 3.1) if (!(x > -5.4 && x < 1.4 && z > -11 && z < -5)) lights.push([x, z]);
  // curtain wall (the lobby leaves the entrance open for the sliding doors)
  const gh = h - 0.5;
  const mx = (x0 + x1) / 2;
  const mz = (z0 + z1) / 2;
  if (idx === 0) {
    k2.box("glass", [(x0 - 4.5) / 2, 0.35, z1], [-4.5 - x0, gh, 0.05]);
    k2.box("glass", [(x1 - 1.5) / 2, 0.35, z1], [x1 + 1.5, gh, 0.05]);
  } else k2.box("glass", [mx, 0.35, z1], [x1 - x0, gh, 0.05]);
  k2.box("glass", [mx, 0.35, z0], [x1 - x0, gh, 0.05]);
  k2.box("glass", [x0, 0.35, mz], [0.05, gh, z1 - z0]);
  k2.box("glass", [x1, 0.35, mz], [0.05, gh, z1 - z0]);
  // every fourth panel (and the whole lobby) stays on after dark for security
  lights.forEach(([x, z], i) => k2.box(idx === 0 || i % 4 === 0 ? "ceilNight" : "ceilLight", [x, h - 0.1, z], [1.3, 0.05, 0.55]));
  k2.box("interiorGlow", [mx, 0.4, z1 - 0.25], [x1 - x0 - 0.6, h - 0.7, 0.02]);
  k2.box("interiorGlow", [mx, 0.4, z0 + 0.25], [x1 - x0 - 0.6, h - 0.7, 0.02]);
  k2.box("interiorGlow", [x0 + 0.25, 0.4, mz], [0.02, h - 0.7, z1 - z0 - 0.6]);
  k2.box("interiorGlow", [x1 - 0.25, 0.4, mz], [0.02, h - 0.7, z1 - z0 - 0.6]);
  // LED line along the slab edge: the facade lighting that comes on at dusk
  if (idx > 0) {
    k2.box("facadeLed", [mx, 0.12, z1 + 0.27], [x1 - x0 + 0.5, 0.07, 0.03]);
    k2.box("facadeLed", [x0 - 0.27, 0.12, mz], [0.03, 0.07, z1 - z0 + 0.5]);
    k2.box("facadeLed", [x1 + 0.27, 0.12, mz], [0.03, 0.07, z1 - z0 + 0.5]);
  }
  if (idx === 0) {
    lobby(k2, r);
    return { lights, seats: [] };
  }
  // desks: two back-to-back benches across the front zone, a cluster east and west of the core
  const seats = [];
  const bench = (x, z, face) => {
    k2.box("desk", [x, 0.72 + 0.35, z], [1.5, 0.05, 0.75], { r: 0.02 });
    k2.box("frame", [x, 0.35, z], [0.06, 0.72, 0.6]);
    k2.box("monitor", [x, 1.12 + 0.35, z - face * 0.22], [0.62, 0.38, 0.04]);
    k2.box("chair", [x, 0.35 + 0.42, z + face * 0.75], [0.52, 0.1, 0.5], { r: 0.05 });
    k2.box("chair", [x, 0.35 + 0.52, z + face * 1.0], [0.5, 0.55, 0.08], { r: 0.04 });
    seats.push({ x, z: z + face * 0.72, ry: face > 0 ? Math.PI : 0, t: r() });
  };
  for (let x = x0 + 1.8; x < x1 - 1.5; x += 1.9) {
    if (idx === 1 && x > 3.2) continue; // BMS room on level 1
    bench(x, 0.9, 1);
    bench(x, 0.1, -1);
    if (x < -5.8 || x > 2.2) {
      bench(x, -3.1, 1);
      bench(x, -3.9, -1);
    }
  }
  for (let x = x0 + 1.8; x < -6; x += 1.9) {
    bench(x, -8.4, 1);
    bench(x, -9.2, -1);
  }
  // meeting room east of the core
  k2.box("wood", [5.4, 0.35 + 0.72, -8.4], [3.6, 0.06, 1.5], { r: 0.1 });
  k2.box("frame", [5.4, 0.35, -8.4], [0.3, 0.72, 0.3]);
  for (const [dx, dz] of [[-1.1, -1.1], [0, -1.1], [1.1, -1.1], [-1.1, 1.1], [0, 1.1], [1.1, 1.1]]) k2.box("chair", [5.4 + dx, 0.35 + 0.42, -8.4 + dz], [0.5, 0.5, 0.5], { r: 0.08 });
  k2.box("glass", [3.2, 0.35, -8.3], [0.05, h - 0.5, 6.2]);
  k2.box("glass", [5.8, 0.35, -5.2], [5.2, h - 0.5, 0.05]);
  // plants on every floor
  for (const [x, z] of [[x0 + 0.8, z1 - 0.8], [x1 - 0.8, z0 + 0.8], [-6, -5.6]]) {
    k2.cyl("pot", [x, 0.35, z], 0.3, 0.5, { seg: 8 });
    k2.ico("leaf1", [x, 0.35 + 1.0, z], 0.5, { scale: [1, 1.3, 1], rot: [r(), r(), r()] });
  }
  return { lights, seats };
}

function lobby(k, r) {
  // reception, lounge, access gates line, security desk
  k.box("desk", [-7.5, 0.38, -2.4], [3.4, 1.05, 0.8], { r: 0.2 });
  k.box("wood", [-7.5, 1.43, -2.4], [3.5, 0.06, 0.9], { r: 0.03 });
  for (const [x, z] of [[-12.2, 1.2], [-12.2, -1.6]]) {
    k.box("sofa", [x, 0.38, z], [2.2, 0.45, 0.9], { r: 0.2 });
    k.box("sofa", [x, 0.38, z - 0.45], [2.2, 0.9, 0.25], { r: 0.1 });
  }
  k.cyl("wood", [-12.2, 0.38, -0.2], 0.5, 0.45, { seg: 16 });
  person(k, [-7.6, 0.38, -3.4], { seed: 3 });
  person(k, [-12.8, 0.38, 1.3], { seed: 4, sit: true, ry: Math.PI });
  person(k, [2.6, 0.38, 1.6], { seed: 6, ry: 0.4 });
  person(k, [6.6, 0.38, -2.0], { seed: 8, ry: -2.4 });
  k.box("desk", [7.2, 0.38, -9.5], [1.4, 1.05, 2.4], { r: 0.15 });
  for (let i = 0; i < 4; i++) k.box("monitor", [7.2, 1.43, -10.4 + i * 0.6], [0.4, 0.3, 0.05]);
  for (let i = 0; i < 3; i++) {
    k.cyl("pot", [-14.2 + i * 0.1, 0.38, -6 - i * 2.5], 0.35, 0.6, { seg: 8 });
    k.ico("leaf2", [-14.2 + i * 0.1, 1.5, -6 - i * 2.5], 0.6, { scale: [1, 1.4, 1], rot: [r(), r(), r()] });
  }
}

// Access gates, entrance doors and canopy (their own group for the access-control hotspot)
export function buildAccess() {
  const k = new Kit();
  for (const x of [-5.6, -4.2, -2.8, -1.4, 0]) {
    k.box("slab", [x, 0.38, -0.4], [0.28, 1.05, 1.3], { r: 0.08 });
    k.box("glass", [x + 0.7, 0.9, -0.4], [0.02, 0.6, 1.1]);
  }
  return k.build();
}

export function buildCanopy() {
  const k = new Kit();
  k.box("canopy", [-3, 4.2, 5.6], [9, 0.34, 4.6], { r: 0.1 });
  for (const x of [-7, 1]) k.cyl("slab", [x, 0.22, 7.4], 0.18, 4, { seg: 12 });
  k.box("glass", [-3, 0.38, B.z1], [2.8, 3.2, 0.06]);
  k.box("frame", [-3, 3.58, B.z1], [3.0, 0.12, 0.16]);
  return k.build();
}

export function buildRoof() {
  const k = new Kit();
  const { x0, x1, z0, z1 } = B;
  k.box("slab", [(x0 + x1) / 2, 0, (z0 + z1) / 2], [x1 - x0 + 0.5, 0.45, z1 - z0 + 0.5]);
  for (const [x, z, w, d] of [[(x0 + x1) / 2, z1 + 0.1, x1 - x0 + 0.5, 0.3], [(x0 + x1) / 2, z0 - 0.1, x1 - x0 + 0.5, 0.3], [x0 - 0.1, (z0 + z1) / 2, 0.3, z1 - z0 + 0.5], [x1 + 0.1, (z0 + z1) / 2, 0.3, z1 - z0 + 0.5]]) k.box("slab", [x, 0.45, z], [w, 0.9, d]);
  k.box("accent", [(x0 + x1) / 2, 1.2, z1 + 0.26], [x1 - x0 + 0.5, 0.16, 0.02]);
  k.box("core", [-2, 0.45, -8], [6.4, 2.4, 5.6]);
  return k.build();
}

export function buildSolar() {
  const k = new Kit();
  for (let row = 0; row < 5; row++) {
    for (let i = 0; i < 8; i++) {
      const x = B.x0 + 1.4 + i * 1.95;
      const z = B.z0 + 1.2 + row * 2.3;
      if (x > -5.6 && x < 1.6 && z < -4.6) continue; // stair core
      k.add("solar", new THREE.BoxGeometry(1.85, 0.06, 1.7), [x, 1.05, z], [-0.26, 0, 0]);
      k.cyl("metal", [x, 0.45, z + 0.5], 0.04, 0.4, { seg: 6 });
      k.cyl("metal", [x, 0.45, z - 0.5], 0.04, 0.8, { seg: 6 });
    }
  }
  return k.build();
}

export function buildChillers() {
  const k = new Kit();
  for (const z of [-10.5, -6.8]) {
    k.box("chiller", [6, 0.45, z], [4.2, 1.6, 2.8], { r: 0.15 });
    k.box("frame", [6, 2.05, z], [4.3, 0.1, 2.9]);
  }
  k.box("metal", [3.4, 0.45, -8.6], [0.9, 0.9, 0.9], { r: 0.1 });
  return k.build();
}

export function buildCar(paint) {
  return car(new Kit(), [0, 0, 0], { paint }).build();
}
