// Smart Cloud Services diorama modelled and light-baked in Blender
// (public/Blender/scripts/smart_cloud.py -> bake_export.py -> process_lightmaps_bpy.py).
import { BakedModel } from "../baked";

const DIR = "/models/baked/smart_cloud";
const V = "?v=1"; // bump after every re-bake so open tabs and caches fetch the new model
const BASE = [44, 33]; // half size of the plinth: through traffic is cut off where it leaves it

// Camera for each hotspot (three.js axes: x right, y up, +z towards the street).
const views = {
  "data-center": { position: [-22, 16, 14], target: [-29, 1.5, -4] }, // through the glass roof onto the rack aisles
  "big-data": { position: [34, 14, 18], target: [27, 5, -4] }, // the data lake, the charts and the silo
  "ai-services": { position: [8, 14, 22], target: [0, 9, -2] }, // the hub, its GPU ring and the brain under the dome
  "security-compliance": { position: [-26, 9, 30], target: [-35, 2, 14] }, // the gatehouse centre from the street
  erp: { position: [40, 22, 2], target: [26, 10, -22] }, // the ERP tower and its warehouse
  "call-center": { position: [10, 12, -8], target: [0, 5, -21] }, // past the hub onto the agents' glass floors
  blockchain: { position: [36, 10, 30], target: [32, 5, 14] }, // the lab and the chained cubes over it
};

function SmartCloud({ onAnchors, activeId }) {
  return (
    <BakedModel
      url={`${DIR}.glb${V}`}
      lightmaps={{ building: `${DIR}_building.webp${V}`, campus: `${DIR}_campus.webp${V}`, tower: `${DIR}_tower.webp${V}`, site: `${DIR}_site.webp${V}` }}
      intensity={2}
      clip={BASE}
      views={views}
      onAnchors={onAnchors}
      activeId={activeId}
    />
  );
}

export default {
  Component: SmartCloud,
  baked: true,
  base: BASE,
  home: { position: [66, 60, 92], target: [0, 4, -2] },
  maxDistance: 240,
  sky: ["#2f4f8f", "#dfe9f7", "#a9bdd8"],
};
