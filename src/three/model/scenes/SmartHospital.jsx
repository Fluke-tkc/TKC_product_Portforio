// Smart Hospital diorama modelled and light-baked in Blender
// (public/Blender/scripts/smart_hospital.py -> bake_export.py -> process_lightmaps.py).
import { BakedModel } from "../baked";
import { HospitalPanel, HospitalReactions } from "./hospitalDemos";

const DIR = "/models/baked/smart_hospital";
const V = "?v=2"; // bump after every re-bake so open tabs and caches fetch the new model
const BASE = [40, 31]; // half size of the plinth: moving cars are cut off where they leave it

// Camera for each hotspot (three.js axes: x right, y up, +z towards the street).
const views = {
  "data-analytics": { position: [-6, 15.5, 2], target: [-20, 7.2, -16] },
  "smart-diagnostics": { position: [-0.5, 13.2, -2.6], target: [-10.4, 9.2, -16.6] }, // close on the CT (its exploded view rises above it)
  "patient-care": { position: [19, 15.5, 2], target: [10, 7.2, -16] },
  "safety-convenience": { position: [-4, 10, 12], target: [-18.5, 1.0, -1.5] }, // across the hall to the entrance: routes, falls and robots all in frame
  "hospital-management": { position: [18, 60, 52], target: [8, 1, -2] }, // command-centre overview: hub, towers and the energy centre
};

// No exploded view of the building (the hall is already a cut-away); only the CT scanner comes apart, in the
// diagnostics demo, because its insides are what explain it.
function SmartHospital({ onAnchors, activeId }) {
  return (
    <BakedModel
      url={`${DIR}.glb${V}`}
      lightmaps={{ building: `${DIR}_building.webp${V}`, site: `${DIR}_site.webp${V}`, tower: `${DIR}_tower.webp${V}` }}
      intensity={2}
      clip={BASE}
      views={views}
      onAnchors={onAnchors}
      activeId={activeId}
      reactions={HospitalReactions}
    />
  );
}

export default {
  Component: SmartHospital,
  baked: true,
  base: BASE,
  showroom: "atrium",
  Panel: HospitalPanel,
  home: { position: [70, 62, 78], target: [-4, 9, -6] }, // high enough to take in the inpatient tower and its helipad
  maxDistance: 220,
  sky: ["#4a7fc4", "#e3edf5", "#aebfd2"],
};
