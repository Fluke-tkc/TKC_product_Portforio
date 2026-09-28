// Smart Hospital diorama modelled and light-baked in Blender
// (public/Blender/scripts/smart_hospital.py -> bake_export.py -> process_lightmaps.py).
import { BakedModel } from "../baked";

const DIR = "/models/baked/smart_hospital";
const BASE = [40, 31]; // half size of the plinth: moving cars are cut off where they leave it

// Camera for each hotspot (three.js axes: x right, y up, +z towards the street).
const views = {
  "data-analytics": { position: [-6, 15.5, 2], target: [-20, 7.2, -16] },
  "smart-diagnostics": { position: [6, 15.5, 2], target: [-5, 7.2, -16] },
  "patient-care": { position: [19, 15.5, 2], target: [10, 7.2, -16] },
  "safety-convenience": { position: [-13, 4.5, -1.5], target: [-27, 2, 0.5] },
  "hospital-management": { position: [8, 11, 14], target: [-3, 2.5, -1] },
};

function SmartHospital({ onAnchors }) {
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
  Component: SmartHospital,
  baked: true,
  home: { position: [62, 50, 66], target: [-4, 2, -3] },
  maxDistance: 220,
  sky: ["#4a7fc4", "#e3edf5", "#aebfd2"],
};
