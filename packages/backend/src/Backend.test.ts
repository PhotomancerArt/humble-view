import { provideFakeClock, Providers } from "@humble/ux-core";
import { expect, test } from "@humble/ux-core/test";

import {
  provideAdmin,
  provideAgent,
  provideBackend,
  provideOrders,
  provideShipments,
} from "./testing";

const asAgent = Providers(provideFakeClock, provideBackend(), provideAgent);
const asAdmin = Providers(provideFakeClock, provideBackend(), provideAdmin);

test(
  "a pending order can be cancelled",
  Providers(asAgent, provideOrders([{ status: "pending" }])),
  async ({ backend, orders: [order] }) => {
    const result = await backend.orders.cancel(order!.id);

    expect(result).toMatchObject({ ok: true, value: { status: "cancelled" } });
    expect((await order!.get()).status).toBe("cancelled");
  },
);

test(
  "a shipped order cannot be cancelled",
  Providers(asAgent, provideOrders([{ status: "shipped" }])),
  async ({ backend, orders: [order] }) => {
    const result = await backend.orders.cancel(order!.id);

    expect(result).toMatchObject({ ok: false, error: { code: "invalid_state" } });
    expect((await order!.get()).status).toBe("shipped");
  },
);

test(
  "an agent may not refund",
  Providers(asAgent, provideOrders([{ status: "delivered" }])),
  async ({ backend, orders: [order] }) => {
    expect(await backend.orders.refund(order!.id)).toMatchObject({
      ok: false,
      error: { code: "forbidden" },
    });
  },
);

test(
  "an admin may refund a delivered order, but not a pending one",
  Providers(asAdmin, provideOrders([{ status: "delivered" }, { status: "pending" }])),
  async ({ backend, orders: [delivered, pending] }) => {
    expect(await backend.orders.refund(delivered!.id)).toMatchObject({
      ok: true,
      value: { status: "refunded" },
    });
    expect(await backend.orders.refund(pending!.id)).toMatchObject({
      ok: false,
      error: { code: "invalid_state" },
    });
  },
);

test("unknown ids are not_found", asAgent, async ({ backend }) => {
  expect(await backend.orders.cancel("ord-none")).toMatchObject({ error: { code: "not_found" } });
  expect(await backend.shipments.dispatch("shp-none")).toMatchObject({
    error: { code: "not_found" },
  });
});

test(
  "dispatching a shipment ships its order",
  Providers(asAgent, provideShipments([{}])),
  async ({ backend, shipments: [shipment] }) => {
    const result = await backend.shipments.dispatch(shipment!.id);

    expect(result).toMatchObject({ ok: true, value: { status: "in_transit" } });
    expect((await backend.orders.get(shipment!.orderId))?.status).toBe("shipped");
  },
);

test(
  "dispatch waits for the carrier on the injected clock",
  Providers(provideFakeClock, provideBackend({ carrierLatencyMs: 500 }), provideShipments([{}])),
  async ({ backend, clock, shipments: [shipment] }) => {
    const dispatching = backend.shipments.dispatch(shipment!.id);
    await clock.settle();
    expect((await shipment!.get()).status).toBe("dispatching");

    await clock.advance(500);

    expect(await dispatching).toMatchObject({ ok: true, value: { status: "in_transit" } });
  },
);

test(
  "a refusing carrier fails the shipment, which can be retried",
  Providers(
    provideFakeClock,
    provideBackend({ carrier: { fail: (s) => s.updatedAt === 0 } }),
    provideShipments([{}]),
  ),
  async ({ backend, clock, shipments: [shipment] }) => {
    expect(await backend.shipments.dispatch(shipment!.id)).toMatchObject({
      ok: false,
      error: { code: "carrier_error" },
    });
    expect((await shipment!.get()).status).toBe("failed");

    await clock.advance(1);
    expect(await backend.shipments.dispatch(shipment!.id)).toMatchObject({ ok: true });
  },
);

test(
  "a delivered shipment delivers its order",
  Providers(asAgent, provideShipments([{ status: "in_transit" }, { status: "ready" }])),
  async ({ backend, shipments: [inTransit, ready] }) => {
    expect(await backend.shipments.markDelivered(inTransit!.id)).toMatchObject({
      ok: true,
      value: { status: "delivered" },
    });
    expect((await backend.orders.get(inTransit!.orderId))?.status).toBe("delivered");

    expect(await backend.shipments.markDelivered(ready!.id)).toMatchObject({
      error: { code: "invalid_state" },
    });
  },
);

test("the session starts as an agent and can change role", asAgent, async ({ backend }) => {
  expect(await backend.session.get()).toEqual({ role: "agent" });
  await backend.session.setRole("admin");
  expect(await backend.session.get()).toEqual({ role: "admin" });
});
