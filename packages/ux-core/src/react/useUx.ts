import { useSyncExternalStore } from "react";

import type { Ux } from "../ux/Ux";

/** The whole React adapter: subscribe to a Ux, hand its state and dispatch to a View. */
export function useUx<S, Op>(ux: Ux<S, Op>) {
  const state = useSyncExternalStore(ux.subscribe, ux.getState, ux.getState);
  return { state, dispatch: ux.dispatch };
}
