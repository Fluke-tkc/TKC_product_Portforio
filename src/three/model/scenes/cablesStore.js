// Shared state of the 05 Smart Cables scene: which street systems are drawn, and what the "Try it" dock asks for.
import { createStore } from "../../live/store";

export const csys = createStore({ net: false, power: false });

export const cdemo = createStore({
  // 1 underground cables
  cable: "armored", storm: 0, emi: false,
  // 2 organised cables
  scan: 0, fault: 0, iot: false,
});
