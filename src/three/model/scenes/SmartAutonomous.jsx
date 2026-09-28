// Autonomous diorama modelled and light-baked in Blender
// (public/Blender/scripts/smart_autonomous.py -> bake_export.py -> process_lightmaps.py).
import { BakedModel } from "../baked";

const DIR = "/models/baked/smart_autonomous";
const BASE = [44, 33]; // half size of the plinth: through traffic is cut off where it leaves it

// Camera for each hotspot (three.js axes: x right, y up, +z towards the viewer).
const views = {
  "security-systems": { position: [-6, 18, 46], target: [-22, 2, 25] },
  vehicles: { position: [24, 16, 32], target: [6, 1, 6] },
  "industrial-robot": { position: [-12, 17, 8], target: [-28, 1.5, -13] },
  "service-robot": { position: [32, 15, 46], target: [20, 1.5, 25] },
};

function SmartAutonomous({ onAnchors }) {
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
  Component: SmartAutonomous,
  baked: true,
  home: { position: [72, 58, 82], target: [-2, 2, -2] },
  maxDistance: 230,
  sky: ["#4a7fc4", "#f1e6d6", "#aebfd2"], // warm horizon like the artwork's sunrise
};
