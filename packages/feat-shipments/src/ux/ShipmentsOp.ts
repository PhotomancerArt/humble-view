/** Everything the shipments Ux accepts. Plain data. */
export type ShipmentsOp =
  | { kind: "load" }
  | { kind: "dispatch"; shipmentId: string }
  | { kind: "markDelivered"; shipmentId: string }
  | { kind: "dismissNotice" };
