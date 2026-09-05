import type { UxStore } from "./UxStore";

export type DispatchResult =
  | { ok: true }
  | {
      ok: false;
      reason: "forbidden" | "disabled" | "unavailable" | "failed";
      message: string;
    };

/**
 * A Ux owns its services, emits a data-only State, and accepts Ops. It re-validates the op's
 * affordance on dispatch, so a stale View cannot make it do what the State said it could not.
 */
export interface Ux<State, Op> extends UxStore<State> {
  dispatch: (op: Op) => Promise<DispatchResult>;
  dispose: () => void;
}
