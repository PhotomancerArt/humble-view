import type { OrderSpec } from "@humble/app-core/testing";

/** The orders every page story and the deployed demo start with. Stories override maximally. */
export const demoOrders: OrderSpec[] = [
  { customer: "Radia Perlman", totalCents: 12_000, status: "pending" },
  { customer: "Ada Lovelace", totalCents: 6_450, status: "shipped" },
  { customer: "Grace Hopper", totalCents: 31_000, status: "delivered" },
  { customer: "Lin Zhou", totalCents: 1_800, status: "cancelled" },
];
