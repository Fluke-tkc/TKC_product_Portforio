import { createStore } from "../store";

// what the visitor has set on the control panel; the 3D scene follows it
export const store = createStore({ hour: 10, mode: "comfort", playing: false, exploded: false, energy: false, hvac: false, network: false, security: false });
