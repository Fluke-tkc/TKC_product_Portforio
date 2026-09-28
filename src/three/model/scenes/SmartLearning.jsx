// Smart Learning diorama modelled and light-baked in Blender
// (public/Blender/scripts/smart_learning.py -> bake_export.py -> process_lightmaps.py).
import { BakedModel } from "../baked";

const DIR = "/models/baked/smart_learning";
const BASE = [42, 32]; // half size of the plinth: moving vehicles are cut off where they leave it

// Camera for each hotspot (three.js axes: x right, y up, +z towards the street).
const views = {
  "ai-learning": { position: [1, 4.6, -3], target: [-7.6, 3.4, -15] }, // under the ring light
  "iot-classrooms": { position: [10, 11, 6], target: [-2, 6, -5] },
  "cloud-lms": { position: [-2, 7, 9], target: [-12.2, 2.4, -0.6] },
  assessment: { position: [17, 7.5, 10], target: [8.2, 1.2, 2.6] },
};

function SmartLearning({ onAnchors }) {
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
  Component: SmartLearning,
  baked: true,
  home: { position: [74, 58, 80], target: [-2, 2, -3] },
  maxDistance: 220,
  sky: ["#4d6fc0", "#f2dcc4", "#aab6d6"], // soft sunset: warm horizon, calm blue below the model
};
