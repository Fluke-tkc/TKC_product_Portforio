// Smart Learning diorama modelled and light-baked in Blender
// (public/Blender/scripts/smart_learning.py -> bake_export.py -> process_lightmaps.py).
import { BakedModel } from "../baked";
import { LearningPanel, LearningReactions } from "./learningDemos";

const DIR = "/models/baked/smart_learning";
const V = "?v=2"; // bump after every re-bake so open tabs and caches fetch the new model
const BASE = [42, 32]; // half size of the plinth: moving vehicles are cut off where they leave it

// Camera for each hotspot (three.js axes: x right, y up, +z towards the street).
const views = {
  "ai-learning": { position: [9, 12, -3], target: [-6.6, 0.8, -11.8] }, // over the class from the side: every desk, the wall and the tutor in frame
  "iot-classrooms": { position: [10, 11, 6], target: [-2, 6, -5] },
  "cloud-lms": { position: [-2, 7, 9], target: [-12.2, 2.4, -0.6] },
  assessment: { position: [17, 7.5, 10], target: [8.2, 1.2, 2.6] },
};

// No exploded view: the hall is already a cut-away and what matters here (people, data, devices) is on show.
function SmartLearning({ onAnchors, activeId }) {
  return (
    <BakedModel
      url={`${DIR}.glb${V}`}
      lightmaps={{ building: `${DIR}_building.webp${V}`, site: `${DIR}_site.webp${V}`, tower: `${DIR}_tower.webp${V}` }}
      intensity={2}
      clip={BASE}
      views={views}
      onAnchors={onAnchors}
      activeId={activeId}
      reactions={LearningReactions}
    />
  );
}

export default {
  Component: SmartLearning,
  baked: true,
  base: BASE,
  showroom: "school",
  Panel: LearningPanel,
  home: { position: [74, 58, 80], target: [-2, 2, -3] },
  maxDistance: 220,
  sky: ["#4d6fc0", "#f2dcc4", "#aab6d6"], // soft sunset: warm horizon, calm blue below the model
};
