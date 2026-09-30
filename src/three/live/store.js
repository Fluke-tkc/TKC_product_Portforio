// Tiny shared store: the HTML control panel writes, the 3D scene reads (use() re-renders, get() inside useFrame).
import { useSyncExternalStore } from "react";

export function createStore(initial) {
  let state = initial;
  const subs = new Set();
  const get = () => state;
  const set = (patch) => {
    state = { ...state, ...(typeof patch === "function" ? patch(state) : patch) };
    subs.forEach((f) => f());
  };
  const subscribe = (f) => {
    subs.add(f);
    return () => subs.delete(f);
  };
  // select must return a primitive or a stable reference
  const use = (select = (s) => s) => useSyncExternalStore(subscribe, () => select(state));
  return { get, set, subscribe, use };
}
