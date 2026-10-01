import { Suspense } from "react";
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

const SCENES = { building, hospital, learning, logistics, cables, autonomous, cybersecurity, utility };

// Canvas for the modelled (fully 3D) solution scenes.
export default function ModelView({ id, hotspots, activeIndex, onSelect, isNarrow, className }) {
  const scene = SCENES[id];
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
      {scene.Panel && <scene.Panel hidden={activeIndex >= 0} activeId={hotspots[activeIndex]?.id} />}
    </>
  );
}
