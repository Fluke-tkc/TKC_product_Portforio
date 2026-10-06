// Shared state of the 09 Smart Utility scene: which district overlays are drawn, and what the "Try it" dock asks for.
import { createStore } from "../../live/store";

export const usys = createStore({ power: false, meters: false });

export const udemo = createStore({
  // 1 demand response & EMS
  peak: 0, optimise: 0,
  // 2 renewables
  weather: "sunny", forecast: 0,
  // 3 AMI
  read: 0, outage: 0,
  // 4 microgrid
  island: 0, trade: 0,
  // 5 EV integration
  evmode: "smart", book: 0,
  // 6 energy storage
  bessmode: "charge", freq: 0, thermal: 0,
});
