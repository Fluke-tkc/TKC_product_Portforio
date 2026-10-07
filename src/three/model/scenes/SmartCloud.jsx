// Smart Cloud Services diorama ("TKC Cloud Nexus") modelled and light-baked in Blender
// (public/Blender/scripts/smart_cloud.py -> bake_export.py -> process_lightmaps_bpy.py).
import { BakedModel } from "../baked";
import { CloudPanel, CloudReactions } from "./cloudDemos";

const DIR = "/models/baked/smart_cloud";
const V = "?v=5"; // bump after every re-bake so open tabs and caches fetch the new model
const BASE = [44, 33]; // half size of the plinth: through traffic is cut off where it leaves it

// Camera for each hotspot (three.js axes: x right, y up, +z towards the street). The campus is a hub and its
// spokes: the AI Nexus tower in the middle, the sky ring at 7.8 m with skybridges to the data centre (left),
// Big Data (right) and the crescent contact centre (back).
const views = {
  "data-center": { position: [-20, 20, 14], target: [-32, 2, -6], focusPin: [-30, 8.5, 1] }, // through the glass roof onto the rack aisles
  "big-data": { position: [44, 26, 30], target: [27, 9, -2], focusPin: [24, 14, -2] }, // the roof terrace of giant charts, the lake, the silo
  "ai-services": { position: [28, 34, 48], target: [0, 26, -4], pin: [8, 31, -4], focusPin: [6, 26, -4] }, // the tower, its icon orbit and the brain in the sphere; overview pin beside the sphere, not over the title
  "security-compliance": { position: [-18, 18, 38], target: [-34, 3, 12], focusPin: [-34, 6.5, 12] }, // the pavilion at the gate, from the street
  erp: { position: [16, 26, 4], target: [32, 10, -22], pin: [31, 22, -20], focusPin: [31, 9, -20] }, // the ERP board and tower over the Big Data roof; overview pin on the tower face (the roof plant hid it)
  "call-center": { position: [14, 16, -8], target: [0, 6, -26], focusPin: [0, 9.5, -25] }, // from the sky ring onto the crescent's glass floors
  blockchain: { position: [24, 22, 36], target: [34, 7, 13] }, // the lab and the chained cubes over it, between the street trees
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
      reactions={CloudReactions}
    />
  );
}

export default {
  Component: SmartCloud,
  baked: true,
  base: BASE,
  showroom: "lounge",
  Panel: CloudPanel,
  home: { position: [66, 64, 92], target: [0, 8, -4] }, // high enough for the sphere on the Nexus tower
  maxDistance: 240,
  sky: ["#2f4f8f", "#dfe9f7", "#a9bdd8"],
};
