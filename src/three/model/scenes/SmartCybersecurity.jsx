// Smart Cyber Security diorama modelled and light-baked in Blender
// (public/Blender/scripts/smart_cybersecurity.py -> bake_export.py -> process_lightmaps.py).
import { BakedModel } from "../baked";
import { CyberPanel, CyberReactions } from "./cyberDemos";

const DIR = "/models/baked/smart_cybersecurity";
const V = "?v=2"; // bump after every re-bake so open tabs and caches fetch the new model
const BASE = [40, 31]; // half size of the plinth: moving cars are cut off where they leave it

// Camera for each hotspot (three.js axes: x right, y up, +z towards the street). The SOC, threat intelligence,
// cyber range and consulting rooms are on the command deck (floor 10 m); the data hall is in the podium below it.
const views = {
  // The baked pins float above the deck roof for the overview, which is out of frame from inside the deck, so the
  // deck hotspots bring their label down under the ceiling while they are open (focusPin).
  "network-security": { position: [-2, 16.5, 27], target: [-4, 12, 4], focusPin: [-4, 15.4, 7.5] }, // through the deck's front glass onto the shield hologram
  "endpoint-security": { position: [-1, 16.2, 14], target: [-4, 10.5, -5], focusPin: [-3, 12.6, -7] }, // over the hologram onto the tiered analyst rows
  // Between the street trees, under the cantilever into the data hall. The deck hides the baked pin from above,
  // so the overview pin hangs at the cantilever's edge.
  "app-cloud-security": { position: [8, 9.5, 24], target: [9, 3, -4], pin: [8, 4.5, 16.8], focusPin: [10, 5.1, 7.2] },
  "threat-intelligence": { position: [30, 18, 22], target: [13, 12, 2], focusPin: [14, 14, 3] }, // the deck's right wing: threat wall and fusion globe
  consulting: { position: [-34, 18, 20], target: [-21, 12, 0], focusPin: [-23, 13.5, 4] }, // the deck's left wing: cyber range and consulting room
};

function SmartCybersecurity({ onAnchors, activeId }) {
  return (
    <BakedModel
      url={`${DIR}.glb${V}`}
      lightmaps={{ building: `${DIR}_building.webp${V}`, site: `${DIR}_site.webp${V}`, tower: `${DIR}_tower.webp${V}` }}
      intensity={2}
      clip={BASE}
      views={views}
      onAnchors={onAnchors}
      activeId={activeId}
      reactions={CyberReactions}
    />
  );
}

export default {
  Component: SmartCybersecurity,
  baked: true,
  base: BASE,
  showroom: "soc",
  Panel: CyberPanel,
  home: { position: [72, 64, 94], target: [-4, 14, -4] }, // high enough to take in the Cyber Tower
  maxDistance: 240,
  sky: ["#3f6fb5", "#e6edf6", "#aebfd6"],
};
