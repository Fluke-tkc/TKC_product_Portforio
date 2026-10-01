// Shared state of the 04 Smart Logistics scene: which hub systems are drawn, and what the "Try it" dock asks for.
import { createStore } from "../../live/store";

export const gsys = createStore({ orders: false, fleet: false });

export const gdemo = createStore({
  // 1 smart scan
  code: "barcode", hand: 0, damaged: 0,
  // 2 route optimisation
  plan: "manual", jam: 0, rain: false, driver: "somchai",
  // 3 cargo volume
  measure: 0, packing: 0, sensors: false, forecast: "today",
  // 4 transfer & delivery
  dispatch: 0, pod: 0,
  // 5 POS
  pay: "card", sale: 0, member: 0, locker: 0, layout: "cafe",
});
