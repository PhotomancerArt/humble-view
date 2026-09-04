import {
  provideAdmin,
  provideAgent,
  provideFakeBackend,
  provideOrders,
  TestShipment,
} from "@humble/app-core/testing";
import { expect, provideFakeClock, Providers, test } from "@humble/ux-core";

import { provideFakeOrderService } from "../service/provideOrderService";
import { provideOrdersUx } from "./provideOrdersUx";

test(
  "cancelling a pending order",
  Providers(
    provideFakeClock,
    provideFakeBackend(),
    provideAdmin,
    provideOrders([{ customer: "Radia", status: "pending" }]),
    provideFakeOrderService,
    provideOrdersUx,
  ),
  async ({ ordersUx, orders }) => {
    await ordersUx.dispatch({ kind: "load" });
    const [row] = ordersUx.getState().rows;
    expect(row?.actions.find((a) => a.op.kind === "cancel")?.affordance.status).toBe("available");

    await ordersUx.dispatch({ kind: "cancel", orderId: orders[0]!.id });

    expect(ordersUx.getState().rows[0]?.status).toBe("cancelled");
  },
);

// ---- worlds the rest of the file shares

const base = Providers(provideFakeClock, provideFakeBackend());

const asAgent = Providers(
  base,
  provideAgent,
  provideOrders([
    { customer: "Radia", status: "pending" },
    { customer: "Ada", status: "shipped" },
    { customer: "Grace", status: "delivered" },
  ]),
  provideFakeOrderService,
  provideOrdersUx,
);

const asAdmin = Providers(
  base,
  provideAdmin,
  provideOrders([
    { customer: "Radia", status: "pending" },
    { customer: "Ada", status: "shipped" },
    { customer: "Grace", status: "delivered" },
    { customer: "Lin", status: "cancelled" },
  ]),
  provideFakeOrderService,
  provideOrdersUx,
);

function affordance(
  ctx: {
    ordersUx: {
      getState: () => {
        rows: Array<{ actions: Array<{ op: { kind: string }; affordance: { status: string } }> }>;
      };
    };
  },
  row: number,
  kind: string,
) {
  return ctx.ordersUx.getState().rows[row]?.actions.find((a) => a.op.kind === kind)?.affordance;
}

// ---- affordances

test("cancel is available only while pending", asAgent, async (ctx) => {
  await ctx.ordersUx.dispatch({ kind: "load" });

  expect(affordance(ctx, 0, "cancel")).toEqual({ status: "available" });
  expect(affordance(ctx, 1, "cancel")).toEqual({
    status: "disabled",
    reason: "Only pending orders can be cancelled",
  });
});

test("refund is forbidden for agents, with the reason", asAgent, async (ctx) => {
  await ctx.ordersUx.dispatch({ kind: "load" });

  expect(affordance(ctx, 2, "refund")).toEqual({ status: "forbidden", reason: "Admins only" });
});

test(
  "refund is available to admins after delivery or cancellation, else unavailable",
  asAdmin,
  async (ctx) => {
    await ctx.ordersUx.dispatch({ kind: "load" });

    expect(affordance(ctx, 0, "refund")).toEqual({ status: "unavailable" });
    expect(affordance(ctx, 1, "refund")).toEqual({ status: "unavailable" });
    expect(affordance(ctx, 2, "refund")).toEqual({ status: "available" });
    expect(affordance(ctx, 3, "refund")).toEqual({ status: "available" });
  },
);

test("cancel is destructive and asks for confirmation", asAgent, async ({ ordersUx }) => {
  await ordersUx.dispatch({ kind: "load" });
  const cancel = ordersUx.getState().rows[0]?.actions.find((a) => a.op.kind === "cancel");

  expect(cancel).toMatchObject({
    destructive: true,
    confirm: { confirmLabel: "Cancel order" },
  });
});

test("state is data", asAdmin, async ({ ordersUx }) => {
  await ordersUx.dispatch({ kind: "load" });

  expect(JSON.parse(JSON.stringify(ordersUx.getState()))).toEqual(ordersUx.getState());
  expect(ordersUx.getState().rows[0]?.total).toBe("$42.00");
});

// ---- dispatch

test(
  "dispatch re-validates: a disabled op is refused without calling the service",
  asAgent,
  async ({ ordersUx, orders, backend }) => {
    await ordersUx.dispatch({ kind: "load" });

    const result = await ordersUx.dispatch({ kind: "cancel", orderId: orders[1]!.id });

    expect(result).toEqual({
      ok: false,
      reason: "disabled",
      message: "Only pending orders can be cancelled",
    });
    expect((await backend.orders.get(orders[1]!.id))?.status).toBe("shipped");
  },
);

test("a forbidden op is refused the same way", asAgent, async ({ ordersUx, orders }) => {
  await ordersUx.dispatch({ kind: "load" });

  expect(await ordersUx.dispatch({ kind: "refund", orderId: orders[2]!.id })).toEqual({
    ok: false,
    reason: "forbidden",
    message: "Admins only",
  });
});

test(
  "while an op is in flight its action is disabled with progress",
  asAgent,
  async ({ ordersUx, orders, ordersScript, clock }) => {
    await ordersUx.dispatch({ kind: "load" });
    ordersScript.latencyMs = 100;

    const cancelling = ordersUx.dispatch({ kind: "cancel", orderId: orders[0]!.id });
    await clock.settle();

    expect(ordersUx.getState().rows[0]?.actions[0]?.affordance).toEqual({
      status: "disabled",
      reason: "Cancelling",
      progress: { label: "Cancelling…" },
    });

    await clock.advance(100);
    expect(await cancelling).toEqual({ ok: true });
    expect(ordersUx.getState().rows[0]).toMatchObject({ status: "cancelled" });
    expect(ordersUx.getState().rows[0]?.actions[0]?.affordance.status).toBe("disabled");
  },
);

test(
  "the backend's refusal becomes a notice and the row is refetched",
  asAdmin,
  async ({ ordersUx, orders, backend }) => {
    await ordersUx.dispatch({ kind: "load" });
    // The UI still shows refund as available; the server no longer agrees.
    await backend.session.setRole("agent");

    const result = await ordersUx.dispatch({ kind: "refund", orderId: orders[2]!.id });

    expect(result).toMatchObject({ ok: false, reason: "forbidden" });
    expect(ordersUx.getState().notice).toEqual({
      tone: "error",
      message: "Only admins can refund orders",
    });
    expect(ordersUx.getState().rows[2]?.status).toBe("delivered");

    await ordersUx.dispatch({ kind: "dismissNotice" });
    expect(ordersUx.getState().notice).toBeUndefined();
  },
);

test(
  "a scripted service failure becomes a notice",
  asAgent,
  async ({ ordersUx, orders, ordersScript }) => {
    await ordersUx.dispatch({ kind: "load" });
    ordersScript.failNext("cancel", {
      code: "invalid_state",
      message: "Order changed on the server",
    });

    const result = await ordersUx.dispatch({ kind: "cancel", orderId: orders[0]!.id });

    expect(result).toEqual({ ok: false, reason: "failed", message: "Order changed on the server" });
    expect(ordersUx.getState().notice?.message).toBe("Order changed on the server");
    expect(ordersUx.getState().rows[0]?.status).toBe("pending");
  },
);

test(
  "a failed load is an error phase with a notice",
  asAgent,
  async ({ ordersUx, ordersScript }) => {
    ordersScript.failNext("list", { code: "carrier_error", message: "503 from the backend" });

    await ordersUx.dispatch({ kind: "load" });

    expect(ordersUx.getState()).toMatchObject({
      phase: "error",
      rows: [],
      notice: { tone: "error", message: "Could not load orders: 503 from the backend" },
    });
  },
);

// ---- events

test(
  "a delivered shipment refreshes its order",
  asAgent,
  async ({ ordersUx, orders, backend, events, clock }) => {
    await ordersUx.dispatch({ kind: "load" });
    const shipment = await TestShipment(backend).create({
      orderId: orders[1]!.id,
      status: "in_transit",
    });
    await backend.shipments.markDelivered(shipment.id);
    expect(ordersUx.getState().rows[1]?.status).toBe("shipped");

    events.publish({ type: "shipment.delivered", orderId: orders[1]!.id });
    await clock.settle();

    expect(ordersUx.getState().rows[1]?.status).toBe("delivered");
  },
);

test("a session change recomputes affordances", asAgent, async (ctx) => {
  await ctx.ordersUx.dispatch({ kind: "load" });
  expect(affordance(ctx, 2, "refund")?.status).toBe("forbidden");

  ctx.events.publish({ type: "session.changed", role: "admin" });

  expect(affordance(ctx, 2, "refund")?.status).toBe("available");
});

test("dispose unsubscribes from the bus", asAgent, async (ctx) => {
  await ctx.ordersUx.dispatch({ kind: "load" });
  ctx.ordersUx.dispose();

  ctx.events.publish({ type: "session.changed", role: "admin" });

  expect(affordance(ctx, 2, "refund")?.status).toBe("forbidden");
});
