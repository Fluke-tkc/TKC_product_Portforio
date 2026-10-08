// Autonomous diorama modelled and light-baked in Blender
// (public/Blender/scripts/smart_autonomous.py -> bake_export.py -> process_lightmaps.py).
import { BakedModel } from "../baked";
import { AutonomousPanel, AutonomousReactions } from "./autonomousDemos";

const DIR = "/models/baked/smart_autonomous";
const V = "?v=4"; // bump after every re-bake so open tabs and caches fetch the new model
const BASE = [44, 33]; // half size of the plinth: through traffic is cut off where it leaves it

const SUN = [36, 0.62, -0.78]; // the bake sun (elevation, Blender xy direction), lights the normal maps

// Camera for each hotspot (three.js axes: x right, y up, +z towards the viewer).
const views = {
  "security-systems": { position: [0, 28, 48], target: [-26, 0, 22] }, // the compound, the control room and the fence, clear of the dock
  vehicles: { position: [24, 16, 32], target: [3, 1, 6] }, // the crossing right of the dock, the loop and the park
  "industrial-robot": { position: [-12, 17, 8], target: [-28, 1.5, -13], pin: [-28, 6, -14] }, // label over the cell table, not off the top of the view
  "service-robot": { position: [22, 24, 62], target: [12, 0, 24] }, // the whole plaza: greeter, care robot, delivery robots, lockers
};

// No exploded view: every system here is out in the open; the demos stop, scan and link the real actors instead.
function SmartAutonomous({ onAnchors, activeId }) {
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
      reactions={AutonomousReactions}
    />
  );
}

export default {
  Component: SmartAutonomous,
  baked: true,
  base: BASE,
  showroom: "lab",
  Panel: AutonomousPanel,
  home: { position: [72, 58, 82], target: [-2, 2, -2] },
  maxDistance: 230,
  sky: ["#4a7fc4", "#f1e6d6", "#aebfd2"], // warm horizon like the artwork's sunrise
};
