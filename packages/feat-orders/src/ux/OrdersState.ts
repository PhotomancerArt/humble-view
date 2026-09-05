import type { OrderStatus } from "@humble/backend";
import type { Action } from "@humble/ux-core";

import type { OrdersOp } from "./OrdersOp";

export type OrdersAction = Action<OrdersOp>;

export type OrderRow = {
  id: string;
  customer: string;
  total: string;
  status: OrderStatus;
  actions: OrdersAction[];
};

/** The read model the orders Ux emits: serializable, complete, no functions. */
export type OrdersState = {
  phase: "loading" | "ready" | "error";
  rows: OrderRow[];
  notice?: { tone: "error" | "info"; message: string };
};
