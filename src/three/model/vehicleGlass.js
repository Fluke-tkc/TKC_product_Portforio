// See-through vehicle glass, like the 03 bus. The baked cars have a solid dark glass cabin with nothing inside, so at
// load time each glass volume (carglass island) that has free space behind it becomes clear glass with a floor, seat
// rows with headrests and, in moving vehicles, a driver (right-hand drive) and some passengers. Thin panes on solid
// bodies (truck windscreens, vending fronts, the bus door) and glass bands wrapped round solid bodies (vans, pods,
// shuttles: a sideways ray from the middle hits their body) stay as they were.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const SEAT = new THREE.Color("#2e3238");
const FLOOR = new THREE.Color("#17191c");
const SKIN = ["#e0b49a", "#b9805f", "#7a5440"].map((c) => new THREE.Color(c));
const SHIRT = ["#3d6fb6", "#d8d8d8", "#c0504d", "#4f9a6a", "#2b2f36", "#e0a440"].map((c) => new THREE.Color(c));

// triangles grouped into islands by shared (welded) corners
function islands(geometry) {
  const pos = geometry.attributes.position;
  const index = geometry.index ? geometry.index.array : [...Array(pos.count).keys()];
  const weld = new Map();
  const root = [];
  const key = (i) => `${Math.round(pos.getX(i) * 100)},${Math.round(pos.getY(i) * 100)},${Math.round(pos.getZ(i) * 100)}`;
  const id = new Int32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    const k = key(i);
    if (!weld.has(k)) weld.set(k, root.push(weld.size) - 1);
    id[i] = weld.get(k);
  }
  const find = (a) => (root[a] === a ? a : (root[a] = find(root[a])));
  for (let t = 0; t < index.length; t += 3) {
    const a = find(id[index[t]]);
    root[find(id[index[t + 1]])] = a;
    root[find(id[index[t + 2]])] = a;
  }
  const groups = new Map();
  for (let t = 0; t < index.length; t += 3) {
    const g = find(id[index[t]]);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(index[t], index[t + 1], index[t + 2]);
  }
  return [...groups.values()];
}

// footprint frame of an island: centre, long axis u (forward +x when known), extents
function frame(pos, tris, forwardX) {
  const seen = new Set(tris);
  let n = 0, mx = 0, mz = 0, y0 = Infinity, y1 = -Infinity;
  seen.forEach((i) => {
    mx += pos.getX(i);
    mz += pos.getZ(i);
    y0 = Math.min(y0, pos.getY(i));
    y1 = Math.max(y1, pos.getY(i));
    n++;
  });
  mx /= n;
  mz /= n;
  let cxx = 0, czz = 0, cxz = 0;
  seen.forEach((i) => {
    const dx = pos.getX(i) - mx, dz = pos.getZ(i) - mz;
    cxx += dx * dx;
    czz += dz * dz;
    cxz += dx * dz;
  });
  const a = forwardX ? 0 : 0.5 * Math.atan2(2 * cxz, cxx - czz);
  const u = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
  const left = new THREE.Vector3(u.z, 0, -u.x);
  let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
  seen.forEach((i) => {
    const dx = pos.getX(i) - mx, dz = pos.getZ(i) - mz;
    const pu = dx * u.x + dz * u.z, pv = dx * left.x + dz * left.z;
    u0 = Math.min(u0, pu);
    u1 = Math.max(u1, pu);
    v0 = Math.min(v0, pv);
    v1 = Math.max(v1, pv);
  });
  const c = new THREE.Vector3(mx, y0, mz).addScaledVector(u, (u0 + u1) / 2).addScaledVector(left, (v0 + v1) / 2);
  return { c, u, left, L: u1 - u0, W: v1 - v0, H: y1 - y0 };
}

const M = new THREE.Matrix4();
const Q = new THREE.Quaternion();
const Y = new THREE.Vector3(0, 1, 0);
function piece(geo, f, along, across, up, color, out) {
  const g = geo.clone();
  const p = f.c.clone().addScaledVector(f.u, along).addScaledVector(f.left, across);
  p.y += up;
  g.applyMatrix4(M.compose(p, Q.setFromAxisAngle(Y, Math.atan2(-f.u.z, f.u.x)), new THREE.Vector3(1, 1, 1)));
  const col = new Float32Array(g.attributes.position.count * 3);
  for (let i = 0; i < col.length; i += 3) color.toArray(col, i);
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  out.push(g.index ? g.toNonIndexed() : g);
}

// floor, seat rows with headrests and (people) a driver and passengers inside one cabin
function furnish(f, people, seed, out) {
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const box = (x, y, z) => new THREE.BoxGeometry(x, y, z);
  piece(box(f.L * 0.92, 0.02, f.W * 0.9), f, 0, 0, 0.01, FLOOR, out);
  const rows = Math.max(1, Math.round(f.L / 1.3));
  const seats = f.W > 1 ? [-0.25, 0.25] : [0];
  const hb = Math.min(0.5, f.H * 0.72); // seat back height above the cabin floor
  for (let r = 0; r < rows; r++) {
    const at = -f.L / 2 + ((r + 0.5) * f.L) / rows;
    for (const s of seats) {
      const v = s * f.W;
      const w = seats.length > 1 ? f.W * 0.36 : f.W * 0.6;
      piece(box(0.1, hb + 0.12, w), f, at - (people ? 0.12 : 0), v, (hb - 0.12) / 2, SEAT, out);
      piece(box(0.08, 0.12, w * 0.5), f, at - (people ? 0.12 : 0), v, hb + 0.06, SEAT, out);
      const driver = people && r === rows - 1 && s === seats[0]; // front row, right-hand side
      if (driver || (people && rnd() < 0.35)) {
        piece(box(0.22, 0.42, 0.36), f, at, v, hb - 0.3, SHIRT[Math.floor(rnd() * SHIRT.length)], out);
        piece(new THREE.SphereGeometry(0.1, 10, 8), f, at + 0.02, v, hb + 0.02, SKIN[Math.floor(rnd() * SKIN.length)], out);
      }
    }
  }
}

const RAY = new THREE.Raycaster();
const P = new THREE.Vector3();
const D = new THREE.Vector3();

// list: [{ mesh, mover }] of carglass meshes; clear(mover) gives the see-through glass material to use
export function glazeVehicles(root, list, clear, clip) {
  root.updateMatrixWorld(true);
  list.forEach(({ mesh, mover }) => {
    const geo = mesh.geometry;
    const pos = geo.attributes.position;
    const keep = [];
    const glaze = [];
    const parts = [];
    const nmat = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
    islands(geo).forEach((tris, k) => {
      const f = frame(pos, tris, mover);
      let free = f.L >= 1 && f.W >= 0.6 && f.H >= 0.3;
      if (free) {
        // a body inside the glass (vans, pods, shuttles) shows up on a ray from each side in towards the middle
        // (from outside, so it meets the front of the body's faces; raycasts skip back faces)
        for (const s of [1, -1]) {
          P.copy(f.c).addScaledVector(f.left, s * (f.W / 2 + 0.3)).setY(f.c.y + f.H / 2).applyMatrix4(mesh.matrixWorld);
          D.copy(f.left).multiplyScalar(-s).applyMatrix3(nmat).normalize();
          RAY.set(P, D);
          RAY.far = f.W / 2 + 0.15; // stops short of the middle
          if (RAY.intersectObject(root, true).some((h) => h.object !== mesh)) free = false;
        }
      }
      if (!free) return keep.push(...tris);
      glaze.push(...tris);
      furnish(f, mover, 1 + k * 7919 + Math.floor(Math.abs(f.c.x * 13 + f.c.z * 7)), parts);
    });
    if (!glaze.length) return;
    const share = (idx) => {
      const g = new THREE.BufferGeometry();
      Object.entries(geo.attributes).forEach(([n, a]) => g.setAttribute(n, a));
      g.setIndex(idx);
      return g;
    };
    const glass = new THREE.Mesh(share(glaze), clear(mover));
    glass.renderOrder = 2;
    glass.raycast = () => {};
    const inside = new THREE.Mesh(mergeGeometries(parts), new THREE.MeshBasicMaterial({ vertexColors: true, clippingPlanes: mover ? clip : null }));
    inside.raycast = () => {};
    mesh.add(glass, inside);
    if (keep.length) mesh.geometry = share(keep);
    else mesh.material = new THREE.MeshBasicMaterial({ visible: false });
  });
}
