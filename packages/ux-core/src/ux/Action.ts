import type { Affordance } from "./Affordance";

/**
 * An op the user may perform, paired with its affordance and label. Actions are data carried by
 * State; the View renders them and dispatches `op` back. `confirm` is presentation data: the surface
 * asks, the Ux never models a pending confirmation.
 */
export type Action<Op> = {
  op: Op;
  label: string;
  affordance: Affordance;
  destructive?: boolean;
  confirm?: { title: string; body: string; confirmLabel: string };
};
