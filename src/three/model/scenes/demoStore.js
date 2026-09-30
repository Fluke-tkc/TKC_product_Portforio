// Shared state of the 01 Smart Building demos: what the "Try it" dock asks for and what the scene reports back.
import { createStore } from "../../live/store";

export const demo = createStore({
  // 5 surveillance, 6 access, 8 parking, 3 signage & lighting
  intrude: 0, access: null, log: [], status: "", alert: false, cam: 0, findCar: false, campaign: "welcome", lights: "show", voice: 0,
  // 1 renewable energy, 2 IoT, 4 motion sensors, 7 building automation
  weather: "sunny", trade: true, net: "5g", secure: true, sense: "ir", edge: true, leak: 0, repair: false,
});

// which parking visitors stand in their bay right now (written by ParkingActors)
export const parked = [false, false, false];
// the live energy balance (written by EnergyNetwork every frame): kW, battery 0..1
export const energyNow = { solar: 0, wind: 0, load: 0, ev: 0, battery: 0, grid: 0, soc: 0.82 };
