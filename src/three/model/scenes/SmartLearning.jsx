// Smart Learning diorama modelled and light-baked in Blender
// (public/Blender/scripts/smart_learning.py -> bake_export.py -> process_lightmaps.py).
import { BakedModel } from "../baked";
import { LearningPanel, LearningReactions } from "./learningDemos";

const DIR = "/models/baked/smart_learning";
const V = "?v=4"; // bump after every re-bake so open tabs and caches fetch the new model
const BASE = [42, 32]; // half size of the plinth: moving vehicles are cut off where they leave it

// Camera for each hotspot (three.js axes: x right, y up, +z towards the street). The hall is lifted 7.2 m onto
// the Learning Commons (learningNetworks HALL_Z) and now has a glass roof with a diagrid over joists at y 14.6, so the
// hall cameras stay under the joists. The diagrid hides pins just below it from the overview, so those pins float
// above the roof and drop into the room while their hotspot is open (focusPin).
const views = {
  "ai-learning": { position: [8, 14, -3], target: [-6.6, 8, -11.8], pin: [-7.6, 16.6, -15.2], focusPin: [-7.6, 10.2, -12.5] }, // over the class from the side: every desk, the wall and the tutor in frame
  "iot-classrooms": { position: [9, 13, 5], target: [-2, 9.5, -5], focusPin: [-4.5, 10.8, -5.3] }, // under the pendant lights (13.3), which would cross the shot
  "cloud-lms": { position: [-2, 14.2, 9], target: [-12.2, 9.6, -0.6], pin: [-12.2, 16.6, -0.6], focusPin: [-12.2, 11.5, -0.6] },
  assessment: { position: [17, 14.7, 10], target: [8.2, 8.4, 2.6] },
};

// No exploded view: the hall shows through its glass roof and front, and what matters here (people, data, devices) is on show.
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
  home: { position: [76, 66, 88], target: [-2, 9, -3] }, // high enough for the innovation tower
  maxDistance: 220,
  sky: ["#4d6fc0", "#f2dcc4", "#aab6d6"], // soft sunset: warm horizon, calm blue below the model
};
