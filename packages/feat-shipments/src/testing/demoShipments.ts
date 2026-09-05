import type { ShipmentSpec } from "@humble/app-core/testing";

/** The shipments every page story starts with; each creates its own order unless given one. */
export const demoShipments: ShipmentSpec[] = [
  { carrier: "Northwind Freight", status: "ready" },
  { carrier: "Pelican Post", status: "in_transit" },
  { carrier: "Northwind Freight", status: "delivered" },
];
