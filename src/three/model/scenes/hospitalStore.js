// Shared state of the 02 Smart Hospital scene: which building systems are drawn, and what the "Try it" dock asks for.
import { createStore } from "../../live/store";

export const hsys = createStore({ power: false, hvac: false, o2: false });

export const hdemo = createStore({
  // 1 data analytics
  forecast: "normal", cdss: 0, breach: 0,
  // 2 diagnostics
  scan: 0, explode: false, tele: false,
  // 3 safety & convenience
  nav: null, fall: 0, uv: false, rtls: false,
  // 4 patient care
  deteriorate: 0, night: false,
  // 5 management
  rush: 0, restock: 0, outage: 0,
});
