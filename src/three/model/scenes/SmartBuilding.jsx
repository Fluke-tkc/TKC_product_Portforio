// Smart Building diorama modelled and light-baked in Blender
// (public/Blender/scripts/smart_building_v2.py -> bake_export.py -> process_lightmaps.py).
import { BakedModel } from "../baked";

const DIR = "/models/baked/smart_building";
const BASE = [44, 40]; // half size of the plinth: moving cars are cut off where they leave it

// Camera for each hotspot: an offset from its pin, or an absolute position (three.js axes, +z is the
// street front). Ground-level views stand in the plaza between the street trees (x = -40, -32 ... 16).
const views = {
  "renewable-energy": { offset: [16, 14, 22] },
  iot: { offset: [-14, 4, 24], drop: 4 },
  "building-automation": { offset: [16, 12, 20] },
  lighting: { offset: [12, 1, 17], drop: 1 },
  surveillance: { offset: [10, 2, 15], drop: 2 },
  "motion-sensors": { position: [4, 5.2, 21], target: [4, 4.4, 14.2] },
  "access-control": { position: [-4, 2.9, 23.2], target: [-8, 1.9, 10] },
  "smart-parking": { position: [72, 34, 42], target: [35, 0, 6] },
};

function SmartBuilding({ onAnchors }) {
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
  Component: SmartBuilding,
  baked: true,
  home: { position: [84, 74, 98], target: [-2, 10, 0] },
  maxDistance: 230,
  sky: ["#3f7cc4", "#e6ecf1", "#b4c3d3"],
};
