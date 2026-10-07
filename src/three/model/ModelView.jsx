import { Suspense } from "react";
import { createPortal } from "react-dom";
import { Canvas } from "@react-three/fiber";
import { ModelStage } from "./ModelStage";
import building from "./scenes/SmartBuilding";
import hospital from "./scenes/SmartHospital";
import learning from "./scenes/SmartLearning";
import logistics from "./scenes/SmartLogistics";
import cables from "./scenes/SmartCables";
import autonomous from "./scenes/SmartAutonomous";
import cybersecurity from "./scenes/SmartCybersecurity";
import utility from "./scenes/SmartUtility";
import cloud from "./scenes/SmartCloud";

const SCENES = { building, hospital, learning, logistics, cables, autonomous, cybersecurity, utility, cloud };

// Canvas for the modelled (fully 3D) solution scenes.
// panelSlot: undefined = the scene's Panel sits where its CSS puts it; an element = portal it there (the phone
// sheet's Try it tab); null = leave it out (the sheet is folded or on its Info tab).
export default function ModelView({ id, hotspots, activeIndex, onSelect, isNarrow, className, panelSlot }) {
  const scene = SCENES[id];
  const panel = scene.Panel && <scene.Panel hidden={activeIndex >= 0} activeId={hotspots[activeIndex]?.id} />;
  return (
    <>
      <Canvas
        className={className}
        shadows
        flat
        dpr={isNarrow ? [1, 1.5] : [1, 1.75]}
        gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
        camera={{ fov: 35, near: 1, far: 1500, position: scene.home.position }}
      >
        <Suspense fallback={null}>
          <ModelStage scene={scene} hotspots={hotspots} activeIndex={activeIndex} onSelect={onSelect} isNarrow={isNarrow} />
        </Suspense>
      </Canvas>
      {panelSlot === undefined ? panel : panelSlot && panel && createPortal(panel, panelSlot)}
    </>
  );
}
