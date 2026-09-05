import type { DispatchEvent } from "@humble/app-core";
import { provideAgent, provideFakeBackend, provideShipments } from "@humble/app-core/testing";
import { type Clock, provideFakeClock, Providers } from "@humble/ux-core";
import { expect, test } from "@humble/ux-core/test";

import { provideFakeShipmentService } from "../service/provideShipmentService";
import { provideShipmentsUx } from "./provideShipmentsUx";

test(
  "dispatching a ready shipment",
  Providers(
    provideFakeClock,
    provideFakeBackend(),
    provideAgent,
    provideShipments([{ carrier: "Pelican Post" }]),
    provideFakeShipmentService,
    provideShipmentsUx,
  ),
  async ({ shipmentsUx, shipments }) => {
    await shipmentsUx.dispatch({ kind: "load" });
    expect(shipmentsUx.getState().rows[0]?.actions[0]?.affordance.status).toBe("available");

    await shipmentsUx.dispatch({ kind: "dispatch", shipmentId: shipments[0]!.id });

    expect(shipmentsUx.getState().rows[0]?.status).toBe("in_transit");
  },
);

// ---- worlds

const threeShipments = provideShipments([
  { status: "ready" },
  { status: "in_transit" },
  { status: "delivered" },
]);

const world = Providers(
  provideFakeClock,
  provideFakeBackend(),
  provideAgent,
  threeShipments,
  provideFakeShipmentService,
  provideShipmentsUx,
);

const slowCarrier = Providers(
  provideFakeClock,
  provideFakeBackend({ carrierLatencyMs: 500 }),
  provideShipments([{}]),
  provideFakeShipmentService,
  provideShipmentsUx,
);

function failingOnce() {
  let attempts = 0;
  return { fail: () => attempts++ === 0 };
}

// A fresh carrier per world: the counter must not leak between tests.
const provideFlakyBackend = (ctx: { clock: Clock }) =>
  provideFakeBackend({ carrier: failingOnce() })(ctx);

const flakyCarrier = Providers(
  provideFakeClock,
  provideFlakyBackend,
  provideShipments([{}]),
  provideFakeShipmentService,
  provideShipmentsUx,
);

function affordances(
  ctx: {
    shipmentsUx: {
      getState: () => { rows: Array<{ actions: Array<{ affordance: { status: string } }> }> };
    };
  },
  row: number,
) {
  return ctx.shipmentsUx.getState().rows[row]?.actions.map((a) => a.affordance.status);
}

// ---- affordances

test(
  "dispatch applies to ready shipments; mark delivered to shipments in transit",
  world,
  async (ctx) => {
    await ctx.shipmentsUx.dispatch({ kind: "load" });

    expect(affordances(ctx, 0)).toEqual(["available", "unavailable"]);
    expect(affordances(ctx, 1)).toEqual(["unavailable", "available"]);
    expect(affordances(ctx, 2)).toEqual(["unavailable", "unavailable"]);
  },
);

test(
  "mark delivered is not destructive and asks no confirmation",
  world,
  async ({ shipmentsUx }) => {
    await shipmentsUx.dispatch({ kind: "load" });
    const action = shipmentsUx.getState().rows[1]?.actions[1];

    expect(action).toMatchObject({ label: "Mark delivered", affordance: { status: "available" } });
    expect(action?.destructive).toBeUndefined();
    expect(action?.confirm).toBeUndefined();
  },
);

test(
  "dispatch re-validates: an op that does not apply is refused",
  world,
  async ({ shipmentsUx, shipments }) => {
    await shipmentsUx.dispatch({ kind: "load" });

    expect(
      await shipmentsUx.dispatch({ kind: "markDelivered", shipmentId: shipments[0]!.id }),
    ).toEqual({
      ok: false,
      reason: "unavailable",
      message: "Not applicable",
    });
  },
);

// ---- progress

test(
  "while the carrier is thinking, dispatch is disabled with progress",
  slowCarrier,
  async ({ shipmentsUx, shipments, clock }) => {
    await shipmentsUx.dispatch({ kind: "load" });

    const dispatching = shipmentsUx.dispatch({ kind: "dispatch", shipmentId: shipments[0]!.id });
    await clock.settle();

    expect(shipmentsUx.getState().rows[0]?.actions[0]?.affordance).toEqual({
      status: "disabled",
      reason: "Dispatch in progress",
      progress: { label: "Dispatching…" },
    });

    await clock.advance(500);
    expect(await dispatching).toEqual({ ok: true });
    expect(shipmentsUx.getState().rows[0]).toMatchObject({ status: "in_transit" });
    expect(affordances({ shipmentsUx }, 0)).toEqual(["unavailable", "available"]);
  },
);

// ---- failure and retry

test(
  "a carrier failure marks the shipment failed, shows a notice, and allows a retry",
  flakyCarrier,
  async ({ shipmentsUx, shipments }) => {
    await shipmentsUx.dispatch({ kind: "load" });

    const first = await shipmentsUx.dispatch({ kind: "dispatch", shipmentId: shipments[0]!.id });

    expect(first).toMatchObject({ ok: false, reason: "failed" });
    expect(shipmentsUx.getState().rows[0]).toMatchObject({
      status: "failed",
      actions: [{ label: "Retry dispatch", affordance: { status: "available" } }, {}],
    });
    expect(shipmentsUx.getState().notice?.message).toMatch(/refused shipment/);

    await shipmentsUx.dispatch({ kind: "dismissNotice" });
    const second = await shipmentsUx.dispatch({ kind: "dispatch", shipmentId: shipments[0]!.id });

    expect(second).toEqual({ ok: true });
    expect(shipmentsUx.getState().rows[0]?.status).toBe("in_transit");
    expect(shipmentsUx.getState().notice).toBeUndefined();
  },
);

test(
  "a scripted service failure becomes a notice",
  world,
  async ({ shipmentsUx, shipments, shipmentsScript }) => {
    await shipmentsUx.dispatch({ kind: "load" });
    shipmentsScript.failNext("markDelivered", { code: "not_found", message: "Shipment vanished" });

    const result = await shipmentsUx.dispatch({
      kind: "markDelivered",
      shipmentId: shipments[1]!.id,
    });

    expect(result).toEqual({ ok: false, reason: "failed", message: "Shipment vanished" });
    expect(shipmentsUx.getState().notice?.message).toBe("Shipment vanished");
  },
);

test(
  "a failed load is an error phase with a notice",
  world,
  async ({ shipmentsUx, shipmentsScript }) => {
    shipmentsScript.failNext("list", { code: "carrier_error", message: "503 from the backend" });

    await shipmentsUx.dispatch({ kind: "load" });

    expect(shipmentsUx.getState()).toMatchObject({
      phase: "error",
      notice: { message: "Could not load shipments: 503 from the backend" },
    });
  },
);

// ---- events

test(
  "dispatch and delivery are announced on the bus with the order id",
  world,
  async ({ shipmentsUx, shipments, events }) => {
    const seen: DispatchEvent[] = [];
    events.subscribe((e) => seen.push(e));
    await shipmentsUx.dispatch({ kind: "load" });

    await shipmentsUx.dispatch({ kind: "dispatch", shipmentId: shipments[0]!.id });
    await shipmentsUx.dispatch({ kind: "markDelivered", shipmentId: shipments[1]!.id });

    expect(seen).toEqual([
      { type: "shipment.dispatched", orderId: shipments[0]!.orderId },
      { type: "shipment.delivered", orderId: shipments[1]!.orderId },
    ]);
  },
);

test("a refused op announces nothing", flakyCarrier, async ({ shipmentsUx, shipments, events }) => {
  const seen: DispatchEvent[] = [];
  events.subscribe((e) => seen.push(e));
  await shipmentsUx.dispatch({ kind: "load" });

  await shipmentsUx.dispatch({ kind: "dispatch", shipmentId: shipments[0]!.id });

  expect(seen).toEqual([]);
});
