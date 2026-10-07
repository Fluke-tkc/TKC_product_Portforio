// Smart Building diorama modelled and light-baked in Blender
// (public/Blender/scripts/smart_building_v2.py -> bake_export.py -> process_lightmaps.py).
import { BakedModel } from "../baked";
import { BuildingPanel, BuildingReactions } from "./buildingSystems";

const DIR = "/models/baked/smart_building";
const V = "?v=5"; // bump after every re-bake so open tabs and caches fetch the new model
const BASE = [44, 40]; // half size of the plinth: moving cars are cut off where they leave it

// Camera for each hotspot: an offset from its pin, or an absolute position (three.js axes, +z is the
// street front). Ground-level views stand in the plaza between the street trees (x = -40, -32 ... 16).
const views = {
  "renewable-energy": { offset: [16, 14, 22] },
  iot: { offset: [-14, 4, 24], drop: 4 },
  "building-automation": { offset: [16, 12, 20] },
  lighting: { offset: [12, 1, 17], drop: 1 },
  surveillance: { offset: [10, 2, 15], drop: 2 },
  "motion-sensors": { position: [4, 4.2, 26], target: [4, 1.8, 13.6] },
  "access-control": { position: [-4, 2.9, 23.2], target: [-8, 1.9, 10] },
  "smart-parking": { position: [72, 34, 42], target: [35, 0, 6] },
};

// No exploded view here: the systems sit on the outside of the building, so a click zooms in and the
// selected system demonstrates itself (BuildingReactions) instead.
function SmartBuilding({ onAnchors, activeId }) {
  return (
    <BakedModel
      url={`${DIR}.glb${V}`}
      lightmaps={{ building: `${DIR}_building.webp${V}`, site: `${DIR}_site.webp${V}` }}
      intensity={2}
      clip={BASE}
      views={views}
      onAnchors={onAnchors}
      activeId={activeId}
      reactions={BuildingReactions}
    />
  );
}

export default {
  Component: SmartBuilding,
  Panel: BuildingPanel,
  baked: true,
  base: BASE,
  showroom: "room",
  home: { position: [84, 74, 98], target: [-2, 10, 0] },
  maxDistance: 230,
  sky: ["#3f7cc4", "#e6ecf1", "#b4c3d3"],
};
