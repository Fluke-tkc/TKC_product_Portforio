// The room a baked diorama is displayed in: a dark stand under the plinth, a warm floor, tall windows full of
// daylight and big potted plants around it (the "model on a table" look of the reference sites).
// It is real-time lit; the baked diorama itself is unlit, so these lights never touch it.
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { Kit, tree } from "../live/kit";

const COLORS = {
  floor: ["#b99e80", 0.75], rug: ["#3a3f47", 0.95], wall: ["#e9e4db", 0.92], slats: ["#8c6546", 0.7], frame: ["#2c3139", 0.45],
  stand: ["#2b2f36", 0.55], trim: ["#454c57", 0.4], pot: ["#30343b", 0.6], bark: ["#7a5a3e", 0.9],
  leaf1: ["#6fb24f", 0.8], leaf2: ["#4f9a40", 0.8], leaf3: ["#8cc660", 0.8],
};
// per-location looks (scene.showroom): colour overrides and the room light
const THEMES = {
  hospital: {
    colors: { floor: ["#dfe3e6", 0.55], rug: ["#5d8f98", 0.9], wall: ["#f4f7f8", 0.9], slats: ["#bfd8dc", 0.6], frame: ["#9fb1bd", 0.4], stand: ["#2f5561", 0.55], trim: ["#4a7a88", 0.4], pot: ["#eef2f4", 0.5] },
    sky: "#f3f9ff", ground: "#8b99a3", sun: "#ffffff",
  },
  school: {
    colors: { floor: ["#d9b98c", 0.7], rug: ["#5b4a8a", 0.9], wall: ["#f7f1e6", 0.9], slats: ["#e6a15a", 0.65], frame: ["#6d5a8e", 0.45], stand: ["#3b335e", 0.55], trim: ["#5b4a8a", 0.4], pot: ["#f2e8da", 0.55] },
    sky: "#fff3e0", ground: "#8a7768", sun: "#fff0d8",
  },
};

// base: diorama half size [x, z]; reach: how far the camera may pull back (the walls stay beyond it)
export function Showroom({ base, reach = 230, top = -2.1, theme }) {
  const look = THEMES[theme];
  const { meshes, mats, panes } = useMemo(() => {
    const [bx, bz] = base;
    const floorY = top - 14;
    const R = reach + 90;
    const H = R * 0.62;
    const k = new Kit();
    k.box("floor", [0, floorY - 1, 0], [R * 2.4, 1, R * 2.4]);
    k.box("rug", [0, floorY, 0], [bx * 2 + 70, 0.1, bz * 2 + 60]);
    // the stand
    k.box("stand", [0, floorY, 0], [bx * 2 + 6, top - floorY, bz * 2 + 6], { r: 1.4 });
    k.box("trim", [0, top - 0.35, 0], [bx * 2 + 6.3, 0.3, bz * 2 + 6.3], { r: 0.12 });
    // walls: windows north (-z) and west (-x), timber slats east, plain south
    const win = R * 0.55;
    const sill = floorY + 6;
    const head = floorY + H - 22;
    const solid = (x, z, w, d, y0 = floorY, h = H) => k.box("wall", [x, y0, z], [w, h, d]);
    solid(-(R + win) / 2, -R, R - win, 2);
    solid((R + win) / 2, -R, R - win, 2);
    solid(0, -R, win * 2, 2, floorY, sill - floorY);
    solid(0, -R, win * 2, 2, head, floorY + H - head);
    solid(-R, -(R + win) / 2, 2, R - win);
    solid(-R, (R + win) / 2, 2, R - win);
    solid(-R, 0, 2, win * 2, floorY, sill - floorY);
    solid(-R, 0, 2, win * 2, head, floorY + H - head);
    solid(R, 0, 2, R * 2);
    solid(0, R, R * 2, 2);
    for (let i = 0; i < 34; i++) k.box("slats", [R - 1.5, floorY, -R + 20 + i * ((2 * R - 40) / 33)], [1.4, H - 30, 4]);
    for (let i = 0; i <= 6; i++) {
      k.box("frame", [-win + (i * win) / 3, sill, -R + 1.2], [2.6, head - sill, 2.6]);
      k.box("frame", [-R + 1.2, sill, -win + (i * win) / 3], [2.6, head - sill, 2.6]);
    }
    for (let j = 0; j <= 3; j++) {
      k.box("frame", [0, sill + (j * (head - sill)) / 3 - 1.3, -R + 1.2], [win * 2, 2.6, 2.6]);
      k.box("frame", [-R + 1.2, sill + (j * (head - sill)) / 3 - 1.3, 0], [2.6, 2.6, win * 2]);
    }
    // plants round the stand, big enough to frame the model like a showroom
    const ring = [[1.35, 0.9, 46, 11], [-1.4, -1.0, 54, 12], [-1.2, 1.25, 40, 13], [1.3, -1.2, 50, 14], [2.6, 1.9, 60, 15], [-2.7, 0.2, 58, 16]];
    for (const [fx, fz, h, s] of ring) {
      const x = fx * (bx + 18);
      const z = fz * (bz + 18);
      k.cyl("pot", [x, floorY, z], 6.5, 10, { seg: 10, r2: 7.8 });
      tree(k, [x, floorY + 10, z], { h, seed: s });
    }
    const mats = {};
    for (const [key, [c, r]] of Object.entries({ ...COLORS, ...look?.colors })) mats[key] = new THREE.MeshStandardMaterial({ color: c, roughness: r, flatShading: key.startsWith("leaf") });
    const pane = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.85, 1.9, 1.95), toneMapped: false });
    const panes = [
      { geo: new THREE.PlaneGeometry(win * 2, head - sill), pos: [0, (sill + head) / 2, -R - 1.5], rot: [0, 0, 0] },
      { geo: new THREE.PlaneGeometry(win * 2, head - sill), pos: [-R - 1.5, (sill + head) / 2, 0], rot: [0, Math.PI / 2, 0] },
    ];
    return { meshes: k.build(), mats: { ...mats, pane }, panes };
  }, [base, reach, top, look]);
  useEffect(
    () => () => {
      meshes.forEach((m) => m.geometry.dispose());
      panes.forEach((p) => p.geo.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [meshes, mats, panes]
  );
  return (
    <group>
      <hemisphereLight args={[look?.sky ?? "#fff3e2", look?.ground ?? "#8a7a66", 1.05]} />
      <directionalLight position={[-160, 220, -120]} intensity={1.7} color={look?.sun ?? "#fff1dc"} />
      {meshes.map(({ key, geometry }) => (
        <mesh key={key} geometry={geometry} material={mats[key]} raycast={() => {}} />
      ))}
      {panes.map((p, i) => (
        <mesh key={i} geometry={p.geo} material={mats.pane} position={p.pos} rotation={p.rot} raycast={() => {}} />
      ))}
    </group>
  );
}
