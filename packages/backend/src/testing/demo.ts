import type { Backend } from "../Backend";
import type { OrderSpec } from "./TestOrder";
import { TestOrder } from "./TestOrder";
import type { ShipmentSpec } from "./TestShipment";
import { TestShipment } from "./TestShipment";

/** The orders the demo starts with. Stories and the deployed dashboard share them. */
export const demoOrders: OrderSpec[] = [
  { customer: "Radia Perlman", totalCents: 12_000, status: "pending" },
  { customer: "Ada Lovelace", totalCents: 6_450, status: "shipped" },
  { customer: "Grace Hopper", totalCents: 31_000, status: "delivered" },
  { customer: "Lin Zhou", totalCents: 1_800, status: "cancelled" },
];

/** Shipments without an order of their own; `provideShipments` creates one per spec. */
export const demoShipments: ShipmentSpec[] = [
  { carrier: "Northwind Freight", status: "ready" },
  { carrier: "Pelican Post", status: "in_transit" },
  { carrier: "Northwind Freight", status: "delivered" },
];

/**
 * Seeds a backend with the demo orders and one shipment per shipped/pending/delivered order, so
 * delivering Ada's shipment visibly delivers Ada's order. Used by apps/api, the browser root, and
 * the full-app story.
 */
export async function seedDemo(backend: Backend) {
  const orders = TestOrder(backend);
  const shipments = TestShipment(backend);
  const [radia, ada, grace] = await Promise.all(demoOrders.map((spec) => orders.create(spec)));
  await shipments.create({ orderId: radia!.id, carrier: "Northwind Freight", status: "ready" });
  await shipments.create({ orderId: ada!.id, carrier: "Pelican Post", status: "in_transit" });
  await shipments.create({ orderId: grace!.id, carrier: "Northwind Freight", status: "delivered" });
}
