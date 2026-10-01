// Shared state of the 06 Autonomous scene: which district systems are drawn, and what the "Try it" dock asks for.
import { createStore } from "../../live/store";

export const asys = createStore({ net: false, robots: false });

export const ademo = createStore({
  // 1 security systems
  view: "normal", intruder: 0, cyber: 0,
  // 2 autonomous vehicles
  link: "v2v", sensors: false, map: false, walker: 0,
  // 3 industrial robots
  worker: 0, qc: 0, agv: false,
  // 4 service robots
  robot: "healthcare", greet: 0,
});
