import { expect, provideFakeClock, Providers, test } from "@humble/ux-core";

import type { Order } from "../domain/Order";
import { provideAdmin, provideBackend, provideOrders, provideShipments } from "../testing";
import { backendRoutes } from "./backendRoutes";

function provideRoutes({ backend }: { backend: Parameters<typeof backendRoutes>[0] }) {
  return { routes: backendRoutes(backend) };
}

const world = Providers(
  provideFakeClock,
  provideBackend(),
  provideAdmin,
  provideOrders([{ customer: "Radia", status: "pending" }, { status: "delivered" }]),
  provideShipments([{ status: "in_transit" }]),
  provideRoutes,
);

test("GET /orders lists the seeded orders", world, async ({ routes, orders, shipments }) => {
  const res = await routes.request("/orders");

  expect(res.status).toBe(200);
  const list = (await res.json()) as Order[];
  expect(list.map((o) => o.id)).toEqual([orders[0]!.id, orders[1]!.id, shipments[0]!.orderId]);
  expect(list[0]).toMatchObject({ customer: "Radia", status: "pending" });
});

test("GET /orders/:id is 404 for an unknown id", world, async ({ routes }) => {
  const res = await routes.request("/orders/ord-none");

  expect(res.status).toBe(404);
  expect(await res.json()).toMatchObject({ code: "not_found" });
});

test("POST /orders/:id/cancel returns the updated order", world, async ({ routes, orders }) => {
  const res = await routes.request(`/orders/${orders[0]!.id}/cancel`, { method: "POST" });

  expect(res.status).toBe(200);
  expect(await res.json()).toMatchObject({ status: "cancelled" });
});

test("errors map to status codes", world, async ({ routes, orders, backend }) => {
  const conflict = await routes.request(`/orders/${orders[1]!.id}/cancel`, { method: "POST" });
  expect(conflict.status).toBe(409);

  await backend.session.setRole("agent");
  const forbidden = await routes.request(`/orders/${orders[1]!.id}/refund`, { method: "POST" });
  expect(forbidden.status).toBe(403);
  expect(await forbidden.json()).toMatchObject({ code: "forbidden" });
});

test(
  "POST /shipments/:id/delivered applies the delivered rule",
  world,
  async ({ routes, shipments }) => {
    const res = await routes.request(`/shipments/${shipments[0]!.id}/delivered`, {
      method: "POST",
    });

    expect(await res.json()).toMatchObject({ status: "delivered" });
    const order = await routes.request(`/orders/${shipments[0]!.orderId}`);
    expect(await order.json()).toMatchObject({ status: "delivered" });
  },
);

test("PUT /session switches the role", world, async ({ routes }) => {
  const res = await routes.request("/session", {
    method: "PUT",
    body: JSON.stringify({ role: "agent" }),
    headers: { "content-type": "application/json" },
  });
  expect(await res.json()).toEqual({ role: "agent" });

  const bad = await routes.request("/session", {
    method: "PUT",
    body: JSON.stringify({ role: "root" }),
    headers: { "content-type": "application/json" },
  });
  expect(bad.status).toBe(400);
});
