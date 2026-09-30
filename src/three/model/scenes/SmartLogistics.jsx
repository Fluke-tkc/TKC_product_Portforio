// Smart Logistics diorama modelled and light-baked in Blender
// (public/Blender/scripts/smart_logistics.py -> bake_export.py -> process_lightmaps.py).
import { BakedModel } from "../baked";

const DIR = "/models/baked/smart_logistics";
const BASE = [44, 33]; // half size of the plinth: moving trucks are cut off where they leave it

// Camera for each hotspot (three.js axes: x right, y up, +z towards the street).
const views = {
  "smart-scan": { position: [4, 9, 8], target: [-5, 2.2, -1] },
  "route-optimization": { position: [-1, 7.7, 0], target: [-1, 6.5, -17.5] },
  "cargo-volume": { position: [-4, 10, 5], target: [5.2, 1.8, -7.5] },
  "transfer-delivery": { position: [32, 12, 8], target: [12, 2, -7.5] },
  pos: { position: [-15, 13, 23], target: [-22, 1.5, 12.5] },
};

function SmartLogistics({ onAnchors }) {
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
  Component: SmartLogistics,
  baked: true,
  base: BASE,
  home: { position: [74, 60, 84], target: [-4, 2, -3] },
  maxDistance: 230,
  sky: ["#4a7fc4", "#e3edf5", "#aebfd2"],
};
