import type { ShipmentStatus } from "@humble/backend";
import type { Action } from "@humble/ux-core";

import type { ShipmentsOp } from "./ShipmentsOp";

export type ShipmentsAction = Action<ShipmentsOp>;

export type ShipmentRow = {
  id: string;
  orderId: string;
  carrier: string;
  status: ShipmentStatus;
  actions: ShipmentsAction[];
};

/** The read model the shipments Ux emits: serializable, complete, no functions. */
export type ShipmentsState = {
  phase: "loading" | "ready" | "error";
  rows: ShipmentRow[];
  notice?: { tone: "error" | "info"; message: string };
};
