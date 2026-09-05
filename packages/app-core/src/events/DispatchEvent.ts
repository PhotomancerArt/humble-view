import type { Role } from "@humble/backend";

/** Everything features say to each other. Features never import each other; they publish these. */
export type DispatchEvent =
  | { type: "shipment.dispatched"; orderId: string }
  | { type: "shipment.delivered"; orderId: string }
  | { type: "session.changed"; role: Role };
