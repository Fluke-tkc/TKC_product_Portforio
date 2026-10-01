// Shared state of the 07 Cyber Security scene: which centre-wide overlays are drawn, and what the "Try it" dock asks for.
import { createStore } from "../../live/store";

export const ksys = createStore({ attacks: false, links: false });

export const kdemo = createStore({
  // 1 network security
  layer: "ngfw", ddos: 0, ztna: 0,
  // 2 endpoint security
  ransom: 0, dlp: 0, patch: 0,
  // 3 application & cloud security
  deploy: 0, sqli: 0, xdr: false,
  // 4 threat intelligence
  intel: 0, actor: 0, dark: 0,
  // 5 consulting services
  service: "soc", drill: 0,
});
