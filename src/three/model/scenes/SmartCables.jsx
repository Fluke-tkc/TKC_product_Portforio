// Smart Organized Communication Cables diorama modelled and light-baked in Blender
// (public/Blender/scripts/smart_cables.py -> bake_export.py -> process_lightmaps.py).
import { BakedModel } from "../baked";
import { CablesPanel, CablesReactions } from "./cablesDemos";

const DIR = "/models/baked/smart_cables";
const BASE = [40, 34]; // half size of the plinth: moving cars are cut off where they leave it

const SUN = [40, 0.62, -0.78]; // the bake sun (elevation, Blender xy direction), lights the normal maps

// Camera for each hotspot (three.js axes: x right, y up, +z towards the viewer).
const views = {
  "underground-cables": { position: [1, 4, 50], target: [-6.5, -0.5, 31], pin: [-11, 1, 32] }, // front section: cable ends right of the dock, the cross-section above them; label over the street
  "organize-cables": { position: [-6, 8, 36], target: [-1.2, -1.8, 14], pin: [-1, 1.5, 26] }, // down the smart tunnel and the tied bundles, clear of the dock; pin right of the tunnel, off the cable cross-section seen from underground-cables
};

// No explode: the underground demo shows each cable as a stepped cut-away (the user turned down the sliding explode).
function SmartCables({ onAnchors, activeId }) {
  return (
    <BakedModel
      url={`${DIR}.glb`}
      lightmaps={{ building: `${DIR}_building.webp`, site: `${DIR}_site.webp` }}
      sun={SUN}
      intensity={2}
      clip={BASE}
      views={views}
      onAnchors={onAnchors}
      activeId={activeId}
      reactions={CablesReactions}
    />
  );
}

export default {
  Component: SmartCables,
  baked: true,
  base: BASE,
  showroom: "cabling",
  Panel: CablesPanel,
  standTop: -6.1, // the cables plinth shows a 6 m soil section
  home: { position: [20, 33, 74], target: [-2, -2, 7] }, // down the boulevard, like the artwork
  maxDistance: 220,
  sky: ["#4a86c8", "#eef0e6", "#b3c4d6"],
};
