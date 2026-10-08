// Smart Logistics diorama modelled and light-baked in Blender
// (public/Blender/scripts/smart_logistics.py -> bake_export.py -> process_lightmaps.py).
import { BakedModel } from "../baked";
import { LogisticsPanel, LogisticsReactions } from "./logisticsDemos";

const DIR = "/models/baked/smart_logistics";
const V = "?v=3"; // bump after every re-bake so open tabs and caches fetch the new model
const BASE = [44, 33]; // half size of the plinth: moving trucks are cut off where they leave it

const SUN = [38, 0.62, -0.78]; // the bake sun (elevation, Blender xy direction), lights the normal maps

// Camera for each hotspot (three.js axes: x right, y up, +z towards the street).
const views = {
  "smart-scan": { position: [-8, 12, 13], target: [-7.5, 1.4, 0] }, // between the front columns: tunnel mid-view, packing station a1 behind it
  "route-optimization": { position: [-1, 7.7, -4], target: [-1, 7.0, -17.5], pin: [-1, 9.25, -19.5] }, // the route wall fills the view above the dock; label between the page subtitle and the map
  "cargo-volume": { position: [-9, 8.3, -11], target: [8, 3.2, -9.5] }, // under the trusses, facing the dock wall: gantry, fill sensors of docks 2-4
  "transfer-delivery": { position: [50, 30, 14], target: [18, 1, 1], pin: [22, 2, 0] }, // from the east: docked trucks, EV vans and the yard; label in the yard
  pos: { position: [-14, 14, 27], target: [-25, 1.5, 12.5] }, // tills, the member, the lockers and the POS showcase in frame
};

// No exploded view: the hub is already a cut-away and each system (belt, gantry, route wall, docks, shop) is on show.
function SmartLogistics({ onAnchors, activeId }) {
  return (
    <BakedModel
      url={`${DIR}.glb${V}`}
      lightmaps={{ building: `${DIR}_building.webp${V}`, site: `${DIR}_site.webp${V}` }}
      sun={SUN}
      intensity={2}
      clip={BASE}
      views={views}
      onAnchors={onAnchors}
      activeId={activeId}
      reactions={LogisticsReactions}
    />
  );
}

export default {
  Component: SmartLogistics,
  baked: true,
  base: BASE,
  showroom: "warehouse",
  Panel: LogisticsPanel,
  home: { position: [74, 60, 84], target: [-4, 2, -3] },
  maxDistance: 230,
  sky: ["#4a7fc4", "#e3edf5", "#aebfd2"],
};
