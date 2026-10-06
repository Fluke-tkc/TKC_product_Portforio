// Shared state of the 10 Cloud Services scene: which campus overlays are drawn, and what the "Try it" dock asks for.
import { createStore } from "../../live/store";

export const qsys = createStore({ users: false, spokes: false });

export const qdemo = createStore({
  // 1 data centre
  load: "normal", fail: 0, airflow: false,
  // 2 big data
  etl: 0, proc: "stream",
  // 3 AI services
  service: "vision", train: 0, ask: 0,
  // 4 security & compliance
  login: 0, audit: 0, encrypt: false,
  // 5 ERP
  module: "supply", order: 0,
  // 6 contact centre
  channel: "chat", rush: 0,
  // 7 blockchain
  tx: 0, contract: 0,
});
