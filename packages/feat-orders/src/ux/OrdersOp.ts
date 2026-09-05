/** Everything the orders Ux accepts. Plain data; the View dispatches these and nothing else. */
export type OrdersOp =
  | { kind: "load" }
  | { kind: "cancel"; orderId: string }
  | { kind: "refund"; orderId: string }
  | { kind: "dismissNotice" };
