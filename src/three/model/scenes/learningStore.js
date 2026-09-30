// Shared state of the 03 Smart Learning scene: which campus systems are drawn, and what the "Try it" dock asks for.
import { createStore } from "../../live/store";

export const lsys = createStore({ power: false, net: false });

export const ldemo = createStore({
  // 1 cloud LMS
  access: "class", update: 0, collab: false, lost: 0,
  // 2 IoT classroom
  mode: "lesson", voice: 0, co2: 0, heat: false,
  // 3 AI personalised learning
  quiz: 0, tutor: 0, learner: "ploy",
  // 4 assessment & certificate
  exam: 0, vr: false,
});
