// Detailed cars in place of the blocky baked ones (tkc_lib car() / van(), tkc_logi box_truck()). public/models/vehicles.glb
// holds a sedan, hatchback, SUV, van, ambulance, box-truck cab and the driverless pod, shuttle and campus cart of the
// autonomous scene (tkc_auto robotaxi() / shuttle() / auto_cart()), built by public/Blender/scripts/tkc_cars.py: curved
// bodies with crisp window,
// lamp and door lines, a cabin behind see-through glass and AO in the vertex colours. At load time every baked car
// is swapped, so no scene needs a re-bake:
// - moving cars (drive extras), told apart by their size and materials, drop their meshes for the new model, with
//   wheels that roll, a driver, and lamps that the click flash in baked.jsx picks up;
// - parked cars, which the bake merged into the static meshes, are found by their glass cabin (car) or windscreen
//   (van, truck); their triangles are cut out of every static mesh inside the car's box and the new model is put in
//   its place. The old car's baked shadow stays under the new one (same footprint).
// A box truck only loses its cab and running gear: the old cargo box with its lettering stays. Hologram markers
// (holo: the V2X rings and diamond) stay with their vehicle.
// The new cars are lit by the scene's environment map (paint with a clear coat), not by the bake. Parked cars are
// merged per group of nearby cars, and a group far from the camera shows a ~2k-triangle stand-in instead.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { acceleratedRaycast, computeBoundsTree } from "three-mesh-bvh";
import { frame, islands } from "./vehicleGlass";

export const VEHICLES_URL = "/models/vehicles.glb";

const CAR_MATS = new Set(["carglass", "tyre", "silver", "led_white", "led_red", "darkgray"]);
const notPaint = (name) => name === "carglass" || name === "tyre" || name === "holo" || name.startsWith("led_"); // silver / darkgray can be paint too
const AMB_MATS = ["orange", "cross_red", "accent_blue", "led_blue"]; // the old ambulance's stripes, crosses and light bar
const POD_MATS = ["led_blue", "led_cyan"]; // the old robotaxi's eyes and lidar light
// where each kind's old triangles are cut, in car space (x forward, y up, z across), a little larger than the old
// vehicle: [x0, x1, top, half width, any]; any: every material inside goes, else only the vehicle's own
const ZONES = {
  car: [[-2.36, 2.36, 1.55, 1.0, false]],
  van: [[-2.72, 2.72, 2.42, 1.09, false]], // and ambulance
  pod: [[-2.1, 2.1, 2.05, 1.0, false]],
  truck: [[1.83, 4.5, 3.05, 1.3, true], [-4.6, 4.5, 1.03, 1.35, false]], // cab; wheels and chassis under the box
};
function zoneOf(kind, pts) {
  for (const z of ZONES[kind === "ambulance" ? "van" : kind]) {
    if (pts.every((p) => p.x > z[0] && p.x < z[1] && p.y > -0.03 && p.y < z[2] && Math.abs(p.z) < z[3])) return z;
  }
  return null;
}
const CARS = ["sedan", "hatch", "suv"];
const LOD_NEAR = 55; // metres from a group of parked cars' edge: nearer, the full cars show
const CHUNK = 18; // metres: parked cars are grouped (and switch detail) by this grid

// ---------- materials (two sets: parked, and moving ones cut off at the plinth edge)

const ENV = 1.9; // the stage's environment is dim (0.45); the paint and glass need more of it
function makeMaterials(clip) {
  const c = clip ? { clippingPlanes: clip } : {};
  const std = (color, roughness, metalness = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, vertexColors: true, envMapIntensity: ENV, ...c, ...extra });
  const coat = (color) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.3, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.06, vertexColors: true, envMapIntensity: ENV, ...c });
  return {
    paint: coat("#ffffff"),
    glass: new THREE.MeshPhysicalMaterial({ color: "#0d1823", roughness: 0.04, metalness: 0, transparent: true, opacity: 0.42, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 2.6, depthWrite: false, ...c }),
    trim: std("#1e2125", 0.6),
    black: std("#0c0d0f", 0.14),
    gap: new THREE.MeshBasicMaterial({ color: "#050506", ...c }),
    chrome: std("#e6eaf0", 0.12, 1),
    rim: std("#c3c8cf", 0.26, 0.9),
    disc: std("#74777c", 0.45, 0.9),
    caliper: std("#b3271d", 0.4),
    tyre: std("#202124", 0.88),
    interior: std("#ffffff", 0.85),
    people: std("#ffffff", 0.75),
    plate: std("#ffffff", 0.4),
    lens: new THREE.MeshPhysicalMaterial({ color: "#c7ced6", roughness: 0.08, metalness: 0.5, clearcoat: 1, vertexColors: true, envMapIntensity: ENV, ...c }),
    tail: new THREE.MeshPhysicalMaterial({ color: "#6a0f0e", roughness: 0.12, clearcoat: 1, vertexColors: true, envMapIntensity: ENV, ...c }),
    screen: new THREE.MeshBasicMaterial({ color: "#1d3c5c", ...c }),
    livery_orange: coat("#e8701c"),
    livery_red: coat("#c42020"),
    livery_blue: coat("#2a63c8"),
    // lamps: dim when parked; moving cars get their own glowing copies (see lamp())
    drl: new THREE.MeshBasicMaterial({ color: "#e9edf2", ...c }),
    tail_led: new THREE.MeshBasicMaterial({ color: "#8c1a14", ...c }),
    beacon_red: new THREE.MeshBasicMaterial({ color: "#d8302a", ...c }),
    beacon_blue: new THREE.MeshBasicMaterial({ color: "#2f63e0", ...c }),
    led_cyan: new THREE.MeshBasicMaterial({ color: "#5fd4ff", ...c }),
    lod: new THREE.MeshPhysicalMaterial({ roughness: 0.35, metalness: 0.1, clearcoat: 0.8, clearcoatRoughness: 0.1, vertexColors: true, envMapIntensity: ENV, ...c }),
  };
}
let parkedMats, movingMats, movingClip;
const GLOW = { drl: ["#ffffff", 2.4], tail_led: ["#ff3a2c", 2.4], beacon_red: ["#ff4a3d", 2.8], beacon_blue: ["#4d8cff", 2.8], led_cyan: ["#40b8ff", 3.2] };
function lamp(name, clip) {
  const [c, k] = GLOW[name];
  return new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), toneMapped: false, clippingPlanes: clip }); // own copy: the click flash recolours it
}
const paints = new Map();
function paintFor(color, clip) {
  const key = color.getHexString();
  if (!paints.has(key)) paints.set(key, Object.assign(movingMats.paint.clone(), { color: color.clone(), clippingPlanes: clip }));
  return paints.get(key);
}

// ---------- the model library: per variant, merged geometry by material (body, driver) and the wheels

// position, normal and colour only (white if missing), as plain floats, so every part merges with every other;
// alpha: keep the colour's 4th channel (the stand-in's paint mask)
function floatAttrs(g, alpha = false) {
  Object.keys(g.attributes).forEach((n) => ["position", "normal", "color"].includes(n) || g.deleteAttribute(n));
  if (!g.attributes.color) g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3).fill(1), 3));
  Object.entries(g.attributes).forEach(([n, a]) => {
    if (n === "color" && a.itemSize === 4 && !alpha) {
      const out = new Float32Array(a.count * 3);
      for (let i = 0; i < a.count; i++) [out[i * 3], out[i * 3 + 1], out[i * 3 + 2]] = [a.getX(i), a.getY(i), a.getZ(i)];
      return g.setAttribute(n, new THREE.BufferAttribute(out, 3));
    }
    if (a.array instanceof Float32Array && !a.normalized) return;
    const out = new Float32Array(a.count * a.itemSize);
    for (let i = 0; i < a.count; i++) for (let k = 0; k < a.itemSize; k++) out[i * a.itemSize + k] = a.getComponent(i, k);
    g.setAttribute(n, new THREE.BufferAttribute(out, a.itemSize));
  });
  return g;
}

function mergeByMat(groups) {
  const out = new Map();
  groups.forEach((list, name) => {
    const g = mergeGeometries(list.map((x) => floatAttrs(x)));
    computeBoundsTree.call(g); // moving cars can be clicked
    out.set(name, g);
  });
  return out;
}

const LIBS = new WeakMap();
function library(vehicles) {
  if (LIBS.has(vehicles)) return LIBS.get(vehicles);
  const lib = {};
  vehicles.scene.updateMatrixWorld(true);
  vehicles.scene.children.forEach((root) => {
    const toRoot = root.matrixWorld.clone().invert();
    const body = new Map();
    const driver = new Map();
    const wheels = [];
    let lod = null;
    root.children.forEach((child) => {
      if (child.name.endsWith("_lod")) {
        const list = [];
        child.traverse((m) => m.isMesh && list.push(floatAttrs(m.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(toRoot, m.matrixWorld)), true)));
        lod = list.length > 1 ? mergeGeometries(list) : list[0];
        return;
      }
      const wheel = child.userData.wheel;
      const into = wheel ? new Map() : child.name.endsWith("_driver") ? driver : body;
      const base = wheel ? child.matrixWorld.clone().invert() : toRoot; // wheel parts about their own axle
      child.traverse((m) => {
        if (!m.isMesh) return;
        const g = m.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(base, m.matrixWorld));
        if (!into.has(m.material.name)) into.set(m.material.name, []);
        into.get(m.material.name).push(g);
      });
      if (wheel) wheels.push({ at: child.position.clone(), r: wheel, parts: mergeByMat(into) });
    });
    lib[root.name] = { body: mergeByMat(body), driver: mergeByMat(driver), wheels, lod };
  });
  LIBS.set(vehicles, lib);
  return lib;
}

// ---------- finding the baked cars

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function moving(o) {
  for (let p = o; p; p = p.parent) if (p.userData?.kind === "move" || p.userData?.drive || p.userData?.walk) return true;
  return false;
}

// moving car or van: by size (car space: x length, y height, z width) and materials
const BB = new THREE.Box3();
function moverKind(o) {
  const inv = o.matrixWorld.clone().invert();
  const box = new THREE.Box3();
  const mats = new Map(); // name -> material, with the largest mesh's paint first
  let paint = null;
  let big = 0;
  o.traverse((m) => {
    if (!m.isMesh || m.material.name === "holo") return; // a V2X ring is wider than the vehicle
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
    BB.copy(m.geometry.boundingBox).applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld));
    box.union(BB);
    const name = m.material.name;
    mats.set(name, m.material);
    const v = BB.getSize(new THREE.Vector3());
    if (!notPaint(name) && v.x * v.y * v.z > big) {
      big = v.x * v.y * v.z;
      paint = m.material;
    }
  });
  const s = box.getSize(new THREE.Vector3());
  if (mats.has("fabric") && mats.has("led_pink") && s.x > 2.4 && s.x < 3.0) return { kind: "cart", paint: mats.get("robot_white")?.color };
  if (!mats.has("carglass") || !mats.has("tyre")) return null;
  if (mats.has("auto_blue") && s.x > 6.4 && s.x < 7.1) return { kind: "shuttle", paint: mats.get("robot_white")?.color };
  if (mats.has("led_cyan") && s.x > 3.8 && s.x < 4.3 && s.y > 1.8 && s.y < 2.15) return { kind: "pod", paint: paint?.color };
  if (s.x > 4.15 && s.x < 4.75 && s.y < 1.65 && s.z < 2.1) return { kind: "car", paint: paint?.color };
  if (s.x > 5.0 && s.x < 5.5 && s.y > 1.95 && s.y < 2.5) return { kind: mats.has("orange") ? "ambulance" : "van", paint: paint?.color };
  if (s.x > 8.3 && s.x < 9.0 && s.y > 3.4 && s.y < 4.0) return { kind: "truck", paint: mats.get("robot_white")?.color }; // white cab
  return null;
}

// mean offset along `axis` from the island's middle of its lowest (or highest) corners: tells front from back
function lean(pos, tris, f, axis, top) {
  const seen = new Set(tris);
  let y0 = Infinity;
  let y1 = -Infinity;
  seen.forEach((i) => {
    y0 = Math.min(y0, pos.getY(i));
    y1 = Math.max(y1, pos.getY(i));
  });
  let sum = 0;
  let n = 0;
  seen.forEach((i) => {
    const y = pos.getY(i);
    if (top ? y > y1 - 0.012 : y < y0 + 0.012) {
      sum += (pos.getX(i) - f.c.x) * axis.x + (pos.getZ(i) - f.c.z) * axis.z;
      n++;
    }
  });
  return n ? sum / n : 0;
}

const UP = new THREE.Vector3(0, 1, 0);
function carMatrix(base, fwd) {
  return new THREE.Matrix4().makeBasis(fwd, UP, fwd.clone().cross(UP)).setPosition(base);
}

// parked cars: from every glass island shaped like the old car cabin, van windscreen or truck windscreen pane. The
// old cabin's floor line dips 3 cm to the front; the windscreens' top edge sits behind the bottom edge (they lean back).
function findParked(root) {
  const glass = [];
  root.traverse((m) => m.isMesh && !moving(m) && m.material.name === "carglass" && glass.push(m));
  const out = [];
  glass.forEach((mesh) => {
    const pos = mesh.geometry.attributes.position;
    const nm = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
    islands(mesh.geometry).forEach((tris) => {
      const f = frame(pos, tris, false);
      let kind, axis, back, drop, s;
      if (f.L > 2.85 && f.L < 3.3 && f.W > 1.55 && f.W < 1.85 && f.H > 0.42 && f.H < 0.62) {
        [kind, axis, back, drop] = ["car", f.u, -0.5, 0.9];
        s = lean(pos, tris, f, axis, false) >= 0 ? 1 : -1;
      } else if (f.L > 1.9 && f.L < 2.2 && f.W > 1.25 && f.W < 1.6 && f.H > 0.65 && f.H < 0.95) {
        [kind, axis, back, drop] = ["van", f.left, 1.575, 1.38];
        s = lean(pos, tris, f, axis, true) <= 0 ? 1 : -1;
      } else if (f.L > 3.35 && f.L < 3.7 && f.W > 1.75 && f.W < 1.95 && f.H > 0.48 && f.H < 0.7) {
        [kind, axis, back, drop] = ["pod", f.u, -0.15, 1.08]; // robotaxi glass band: its top sits behind its middle
        s = lean(pos, tris, f, axis, true) <= 0 ? 1 : -1;
      } else if (f.L > 1.95 && f.L < 2.25 && f.W > 0.15 && f.W < 0.4 && f.H > 0.62 && f.H < 0.82) {
        [kind, axis, back, drop] = ["truck", f.left, 3.93, 1.897]; // a 2 cm pane tilted back 0.3 rad
        s = lean(pos, tris, f, axis, true) <= 0 ? 1 : -1;
      } else return;
      const fwd = axis.clone().multiplyScalar(s).applyMatrix3(nm).setY(0).normalize();
      const base = f.c.clone().addScaledVector(axis, -back * s).applyMatrix4(mesh.matrixWorld);
      base.y -= drop;
      out.push({ kind, base, fwd, m: carMatrix(base, fwd), node: topNode(mesh, root).name });
    });
  });
  return out;
}

function topNode(o, root) {
  while (o.parent && o.parent !== root) o = o.parent;
  return o;
}

// Cut the parked cars out of the static meshes; also learn each car's paint (the biggest other material in its box)
// and whether a van is an ambulance. Returns trimmed geometries by original geometry.
function carve(root, cars) {
  const cell = 6;
  const grid = new Map();
  cars.forEach((c, i) => {
    c.inv = c.m.clone().invert();
    c.areas = new Map();
    const p = c.base;
    for (let dx = -1; dx <= 1; dx++)
      for (let dz = -1; dz <= 1; dz++) {
        const k = `${Math.floor(p.x / cell) + dx},${Math.floor(p.z / cell) + dz}`;
        if (!grid.has(k)) grid.set(k, []);
        grid.get(k).push(i);
      }
  });
  const meshes = [];
  root.traverse((m) => m.isMesh && !moving(m) && meshes.push(m));
  const A = new THREE.Vector3();
  const B = new THREE.Vector3();
  const C = new THREE.Vector3();
  const L = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  // per mesh: world positions, and for each triangle the car whose box holds it (with its lowest point)
  const hits = meshes.map((m) => {
    const pos = m.geometry.attributes.position;
    const idx = m.geometry.index ? m.geometry.index.array : null;
    const n = idx ? idx.length : pos.count;
    const world = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) A.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld).toArray(world, i * 3);
    const found = [];
    for (let t = 0; t < n; t += 3) {
      const ia = idx ? idx[t] : t, ib = idx ? idx[t + 1] : t + 1, ic = idx ? idx[t + 2] : t + 2;
      A.fromArray(world, ia * 3);
      B.fromArray(world, ib * 3);
      C.fromArray(world, ic * 3);
      const k = `${Math.floor((A.x + B.x + C.x) / 3 / cell)},${Math.floor((A.z + B.z + C.z) / 3 / cell)}`;
      for (const ci of grid.get(k) || []) {
        const car = cars[ci];
        L[0].copy(A).applyMatrix4(car.inv);
        L[1].copy(B).applyMatrix4(car.inv);
        L[2].copy(C).applyMatrix4(car.inv);
        const zone = zoneOf(car.kind, L);
        if (!zone) continue;
        const low = Math.min(L[0].y, L[1].y, L[2].y);
        const side = Math.min(Math.abs(L[0].z), Math.abs(L[1].z), Math.abs(L[2].z));
        found.push(t, ci, low, side, zone[4] ? 1 : 0);
        if (low > 0.25 && !notPaint(m.material.name) && (car.kind !== "truck" || zone[4])) { // a truck's paint: its cab
          const area = B.clone().sub(A).cross(C.clone().sub(A)).length() / 2;
          car.areas.set(m.material.name, (car.areas.get(m.material.name) || 0) + area);
        }
        break;
      }
    }
    return found;
  });
  cars.forEach((car) => {
    if (car.kind === "van" && (car.areas.get("orange") || 0) > 0.2) car.kind = "ambulance";
    let best = 0;
    car.areas.forEach((a, name) => {
      if (a > best && !(car.kind === "ambulance" && AMB_MATS.includes(name))) [best, car.paintName] = [a, name];
    });
    car.valid = best > 6; // a body round the glass (not a booth window that happens to be van-windscreen sized)
  });
  const paintMat = new Map();
  meshes.forEach((m) => paintMat.set(m.material.name, m.material));
  cars.forEach((car) => (car.paint = paintMat.get(car.paintName)?.color || new THREE.Color("#d8dadd")));
  const trimmed = new Map();
  meshes.forEach((m, mi) => {
    const found = hits[mi];
    if (!found.length) return;
    const name = m.material.name;
    const drop = new Set();
    for (let i = 0; i < found.length; i += 5) {
      const [t, ci, low, side, any] = [found[i], found[i + 1], found[i + 2], found[i + 3], found[i + 4]];
      const car = cars[ci];
      if (!car.valid) continue;
      const mine = any || CAR_MATS.has(name) || (car.kind !== "truck" && name === car.paintName) || (car.kind === "ambulance" && AMB_MATS.includes(name)) || (car.kind === "pod" && POD_MATS.includes(name));
      const decal = (car.kind === "van" || car.kind === "ambulance") && side > 0.92 && low > 0.3; // lettering on a van's sides
      if ((mine || decal) && (low > 0.1 || (name === "tyre" && low > -0.03))) drop.add(t);
    }
    if (!drop.size) return;
    const idx = m.geometry.index ? m.geometry.index.array : null;
    const n = idx ? idx.length : m.geometry.attributes.position.count;
    const keep = [];
    for (let t = 0; t < n; t += 3) if (!drop.has(t)) keep.push(idx ? idx[t] : t, idx ? idx[t + 1] : t + 1, idx ? idx[t + 2] : t + 2);
    const g = new THREE.BufferGeometry();
    Object.entries(m.geometry.attributes).forEach(([k, a]) => g.setAttribute(k, a));
    g.setIndex(keep);
    trimmed.set(m.geometry, g);
  });
  return trimmed;
}

function variantOf(kind, key) {
  return kind === "car" ? CARS[hash(key) % CARS.length] : kind;
}

// parked cars of one group merged into one geometry per material (paint colour baked into the vertex colours),
// and their stand-ins into a single geometry
function mergeParked(lib, cars, toNode) {
  const groups = new Map();
  const add = (name, g) => {
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(g);
  };
  const M = new THREE.Matrix4();
  cars.forEach((car) => {
    const v = lib[car.variant];
    M.multiplyMatrices(toNode, car.m);
    v.body.forEach((g, name) => {
      const c = g.clone().applyMatrix4(M);
      if (name === "paint" && c.attributes.color) {
        const col = c.attributes.color;
        for (let i = 0; i < col.count; i++) col.setXYZ(i, col.getX(i) * car.paint.r, col.getY(i) * car.paint.g, col.getZ(i) * car.paint.b);
      }
      add(name, c);
    });
    v.wheels.forEach((w) => {
      const W = new THREE.Matrix4().multiplyMatrices(M, new THREE.Matrix4().makeTranslation(w.at.x, w.at.y, w.at.z));
      w.parts.forEach((g, name) => add(name, g.clone().applyMatrix4(W)));
    });
    if (v.lod) add("lod", standIn(v.lod, car.paint).applyMatrix4(M));
  });
  const out = new Map();
  groups.forEach((list, name) => out.set(name, mergeGeometries(list)));
  return out;
}

// a copy of a variant's stand-in in this car's paint (the colour's alpha marks the paint)
const WHITE = new THREE.Color(1, 1, 1);
function standIn(lod, paint) {
  const g = lod.clone();
  const c4 = g.attributes.color;
  const c3 = new Float32Array(c4.count * 3);
  for (let i = 0; i < c4.count; i++) {
    const k = c4.getW(i) > 0.5 ? paint : WHITE;
    [c3[i * 3], c3[i * 3 + 1], c3[i * 3 + 2]] = [c4.getX(i) * k.r, c4.getY(i) * k.g, c4.getZ(i) * k.b];
  }
  g.setAttribute("color", new THREE.BufferAttribute(c3, 3));
  return g;
}

// everything about a scene's cars that does not change between visits, worked out once per glTF
const PLANS = new WeakMap();
function plan(source, vehicles) {
  if (PLANS.has(source)) return PLANS.get(source);
  const lib = library(vehicles);
  source.updateMatrixWorld(true);
  let parked = findParked(source);
  const trimmed = carve(source, parked);
  parked = parked.filter((c) => c.valid);
  const groups = new Map();
  parked.forEach((car) => {
    car.variant = variantOf(car.kind, `${car.base.x.toFixed(1)},${car.base.z.toFixed(1)}`);
    const key = `${car.node}|${Math.floor(car.base.x / CHUNK)},${Math.floor(car.base.z / CHUNK)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(car);
  });
  const nodes = [];
  groups.forEach((cars) => {
    const name = cars[0].node;
    const node = source.getObjectByName(name);
    const centre = cars.reduce((c, car) => c.add(car.base), new THREE.Vector3()).divideScalar(cars.length);
    const radius = Math.max(...cars.map((car) => car.base.distanceTo(centre))) + 3;
    nodes.push({ name, centre, radius, meshes: mergeParked(lib, cars, node.matrixWorld.clone().invert()) });
  });
  const movers = new Map();
  source.traverse((o) => {
    if (!o.userData?.drive) return;
    const k = moverKind(o);
    if (k) movers.set(o.name, { ...k, variant: variantOf(k.kind, o.name) });
  });
  const p = { lib, trimmed, nodes, movers };
  PLANS.set(source, p);
  return p;
}

// a moving truck's own meshes without the cab and running gear (car space = the mover's space)
const TRIMMED = new WeakMap();
function trimMover(mesh, kind) {
  const src = mesh.geometry;
  if (TRIMMED.has(src)) return TRIMMED.get(src);
  const pos = src.attributes.position;
  const idx = src.index ? src.index.array : [...Array(pos.count).keys()];
  const name = mesh.material.name;
  const P = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const keep = [];
  for (let t = 0; t < idx.length; t += 3) {
    for (let k = 0; k < 3; k++) P[k].fromBufferAttribute(pos, idx[t + k]).applyMatrix4(mesh.matrix);
    const zone = zoneOf(kind, P);
    const low = Math.min(P[0].y, P[1].y, P[2].y);
    const cut = zone && (zone[4] || CAR_MATS.has(name)) && (low > 0.1 || name === "tyre");
    if (!cut) keep.push(idx[t], idx[t + 1], idx[t + 2]);
  }
  const g = new THREE.BufferGeometry();
  Object.entries(src.attributes).forEach(([k, a]) => g.setAttribute(k, a));
  g.setIndex(keep);
  TRIMMED.set(src, g);
  return g;
}

function carMesh(geometry, material) {
  const m = new THREE.Mesh(geometry, material);
  m.userData.car = true; // prepare() leaves it alone
  return m;
}

// Each frame: full cars near the camera, stand-ins for the rest (parked groups, and each moving car).
export function pickDetail(lods, camera) {
  lods.forEach((l) => {
    const near = camera.position.distanceTo(l.centre) - l.radius < LOD_NEAR;
    l.high.visible = near;
    if (l.low) l.low.visible = !near;
  });
}

// Swap the cars in `scene` (a clone of `source`, the cached glTF scene). Call before prepare() touches materials.
// Returns what pickDetail() switches.
export function swapCars(scene, source, vehicles, clip) {
  if (!vehicles) return [];
  const p = plan(source, vehicles);
  parkedMats ??= makeMaterials(null);
  if (!movingMats || movingClip !== clip) {
    [movingMats, movingClip] = [makeMaterials(clip), clip];
    paints.clear(); // cut off at this scene's plinth
  }
  const drivers = [];
  scene.traverse((o) => {
    if (o.isMesh && p.trimmed.has(o.geometry)) o.geometry = p.trimmed.get(o.geometry);
    if (o.userData?.drive && p.movers.has(o.name)) drivers.push(o);
  });
  const lods = p.nodes.map(({ name, centre, radius, meshes }) => {
    const node = scene.getObjectByName(name);
    const high = new THREE.Group();
    let low;
    meshes.forEach((g, mat) => {
      const m = carMesh(g, parkedMats[mat] || parkedMats.trim);
      m.raycast = () => {}; // parked cars never hide pins or take clicks
      if (mat === "lod") low = m;
      else high.add(m);
    });
    node.add(high);
    if (low) node.add(low);
    return { high, low, centre, radius };
  });
  drivers.forEach((o) => {
    const { kind, variant, paint } = p.movers.get(o.name);
    const v = p.lib[variant];
    if (kind === "truck") o.children.forEach((c) => c.isMesh && (c.geometry = trimMover(c, kind)));
    else [...o.children].forEach((c) => c.isMesh && c.material.name !== "holo" && o.remove(c)); // V2X markers stay
    if (o.isMesh) o.material = new THREE.MeshBasicMaterial({ visible: false });
    const mat = (name) => (GLOW[name] ? lamp(name, clip) : name === "paint" ? paintFor(paint || new THREE.Color("#d8dadd"), clip) : movingMats[name] || movingMats.trim);
    const part = (g, name) => {
      const m = carMesh(g, mat(name));
      m.raycast = acceleratedRaycast;
      return m;
    };
    const high = new THREE.Group();
    o.add(high);
    if (v.lod) {
      const lowGeo = standIn(v.lod, paint || WHITE);
      computeBoundsTree.call(lowGeo);
      const low = part(lowGeo, "lod");
      o.add(low);
      lods.push({ high, low, centre: o.position, radius: 3 });
    }
    v.body.forEach((g, name) => high.add(part(g, name)));
    v.driver.forEach((g, name) => high.add(part(g, name)));
    v.wheels.forEach((w) => {
      const wheel = new THREE.Group();
      wheel.position.copy(w.at);
      wheel.userData.wheel = w.r; // baked.jsx rolls it as the car moves
      w.parts.forEach((g, name) => wheel.add(part(g, name)));
      high.add(wheel);
    });
  });
  return lods;
}
