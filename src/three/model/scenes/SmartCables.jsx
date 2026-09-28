// Smart Organized Communication Cables diorama modelled and light-baked in Blender
// (public/Blender/scripts/smart_cables.py -> bake_export.py -> process_lightmaps.py).
import { BakedModel } from "../baked";

const DIR = "/models/baked/smart_cables";
const BASE = [40, 34]; // half size of the plinth: moving cars are cut off where they leave it

// Camera for each hotspot (three.js axes: x right, y up, +z towards the viewer).
const views = {
  "underground-cables": { position: [-1, 3.5, 44], target: [-4.5, -2.4, 31] }, // front section + armored / duct channel
  "organize-cables": { position: [-2.5, 6.5, 27.5], target: [2.5, -2.2, 12] }, // smart tunnel + tied bundles
};

function SmartCables({ onAnchors }) {
  return (
    <BakedModel
      url={`${DIR}.glb`}
      lightmaps={{ building: `${DIR}_building.webp`, site: `${DIR}_site.webp` }}
      intensity={2}
      clip={BASE}
      views={views}
      onAnchors={onAnchors}
    />
  );
}

export default {
  Component: SmartCables,
  baked: true,
  home: { position: [20, 33, 74], target: [-2, -2, 7] }, // down the boulevard, like the artwork
  maxDistance: 220,
  sky: ["#4a86c8", "#eef0e6", "#b3c4d6"],
};
