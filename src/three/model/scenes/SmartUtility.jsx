// Smart Utility diorama modelled and light-baked in Blender
// (public/Blender/scripts/smart_utility.py -> bake_export.py -> process_lightmaps.py).
import { BakedModel } from "../baked";

const DIR = "/models/baked/smart_utility";
const V = "?v=1"; // bump after every re-bake so open tabs and caches fetch the new model
const BASE = [44, 33]; // half size of the plinth: through traffic is cut off where it leaves it

// Camera for each hotspot (three.js axes: x right, y up, +z towards the street).
const views = {
  "energy-storage": { position: [-14, 19, 30], target: [-33, 1.5, 5], focusPin: [-31, 5.6, 2] }, // the battery yard from the front right
  // from the aisle, between two street trees and under the canopy edge: the cars and chargers, not the PV roof
  "ev-integration": { position: [-6, 3.6, 21], target: [-7, 1, 9.5], focusPin: [-5, 2.4, 10.5] },
  "dr-ems": { position: [-3, 6, 13], target: [-5, 2, -4], focusPin: [-5, 4.5, -3] }, // under the roof overhang, through the front glass into the control hall
  // overview pins over the outer houses so the homes, the meters and the farm pins do not stack up
  microgrid: { position: [42, 20, 38], target: [36, 3, 13], pin: [36.5, 11.5, 12], focusPin: [40.5, 5.2, 14] }, // the prosumer row and the community battery
  ami: { position: [26, 13, 15], target: [27, 3, -3], pin: [21, 10.5, -4.6], focusPin: [27, 5, 2.5] }, // over the first row onto the meters along the lane
  "renewable-energy": { position: [50, 26, 14], target: [26, 13, -18], focusPin: [24, 8, -16] }, // far and high enough for the turbine rotors over the solar farm
};

function SmartUtility({ onAnchors, activeId }) {
  return (
    <BakedModel
      url={`${DIR}.glb${V}`}
      lightmaps={{ building: `${DIR}_building.webp${V}`, homes: `${DIR}_homes.webp${V}`, site: `${DIR}_site.webp${V}`, grid: `${DIR}_grid.webp${V}` }}
      intensity={2}
      clip={BASE}
      views={views}
      onAnchors={onAnchors}
      activeId={activeId}
    />
  );
}

export default {
  Component: SmartUtility,
  baked: true,
  base: BASE,
  home: { position: [66, 60, 92], target: [0, 2, -2] },
  maxDistance: 240,
  sky: ["#4a7fc4", "#f1e6d6", "#aebfd2"], // warm sunrise horizon like the artwork
};
