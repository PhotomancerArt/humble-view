import type { Order, Role } from "@humble/backend";
import type { AuthService, DispatchEvent } from "@humble/app-core";
import {
  available,
  type DispatchResult,
  disabled,
  type EventBus,
  forbidden,
  unavailable,
  type Ux,
  UxStore,
} from "@humble/ux-core";

import type { OrderService } from "../service/OrderService";
import type { OrdersOp } from "./OrdersOp";
import type { OrderRow, OrdersAction, OrdersState } from "./OrdersState";

export type OrdersUxCtx = {
  orderService: OrderService;
  auth: AuthService;
  events: EventBus<DispatchEvent>;
};

/**
 * The orders feature's logic, all of it: which ops apply to which order for whom, what happens
 * while one is in flight, and how the backend's refusals come back as notices. Framework-free.
 */
export function OrdersUx(ctx: OrdersUxCtx): Ux<OrdersState, OrdersOp> {
  const { orderService, auth, events } = ctx;
  const store = UxStore<OrdersState>({ phase: "loading", rows: [] });

  let orders: Order[] = [];
  let role: Role = "agent";
  let phase: OrdersState["phase"] = "loading";
  let notice: OrdersState["notice"];
  const inFlight = new Map<string, "cancel" | "refund">();

  function publish() {
    store.setState(
      notice ? { phase, rows: orders.map(toRow), notice } : { phase, rows: orders.map(toRow) },
    );
  }

  function toRow(order: Order): OrderRow {
    return {
      id: order.id,
      customer: order.customer,
      total: formatCents(order.totalCents),
      status: order.status,
      actions: [cancelAction(order), refundAction(order)],
    };
  }

  function cancelAction(order: Order): OrdersAction {
    const base = {
      op: { kind: "cancel", orderId: order.id } as const,
      label: "Cancel",
      destructive: true,
      confirm: {
        title: `Cancel order ${order.id}?`,
        body: `${order.customer} will be notified. This cannot be undone.`,
        confirmLabel: "Cancel order",
      },
    };
    if (inFlight.get(order.id) === "cancel") {
      return { ...base, affordance: disabled("Cancelling", { label: "Cancelling…" }) };
    }
    if (order.status !== "pending") {
      return { ...base, affordance: disabled("Only pending orders can be cancelled") };
    }
    return { ...base, affordance: available() };
  }

  function refundAction(order: Order): OrdersAction {
    const base = { op: { kind: "refund", orderId: order.id } as const, label: "Refund" };
    if (role !== "admin") return { ...base, affordance: forbidden("Admins only") };
    if (inFlight.get(order.id) === "refund") {
      return { ...base, affordance: disabled("Refunding", { label: "Refunding…" }) };
    }
    if (order.status !== "delivered" && order.status !== "cancelled") {
      return { ...base, affordance: unavailable() };
    }
    return { ...base, affordance: available() };
  }

  async function load(): Promise<DispatchResult> {
    phase = "loading";
    publish();
    try {
      [orders, { role }] = await Promise.all([orderService.list(), auth.current()]);
      phase = "ready";
      publish();
      return { ok: true };
    } catch (error) {
      phase = "error";
      notice = { tone: "error", message: `Could not load orders: ${describe(error)}` };
      publish();
      return { ok: false, reason: "failed", message: describe(error) };
    }
  }

  async function refetch(orderId: string) {
    const fresh = await orderService.get(orderId);
    orders = fresh
      ? orders.map((o) => (o.id === orderId ? fresh : o))
      : orders.filter((o) => o.id !== orderId);
    publish();
  }

  async function mutate(
    op: Extract<OrdersOp, { kind: "cancel" | "refund" }>,
  ): Promise<DispatchResult> {
    const row = store.getState().rows.find((r) => r.id === op.orderId);
    const action = row?.actions.find((a) => a.op.kind === op.kind);
    const affordance = action?.affordance ?? unavailable();
    if (affordance.status !== "available") {
      const message = "reason" in affordance ? affordance.reason : "Not applicable";
      return { ok: false, reason: affordance.status, message };
    }

    inFlight.set(op.orderId, op.kind);
    publish();
    try {
      const result = await (op.kind === "cancel"
        ? orderService.cancel(op.orderId)
        : orderService.refund(op.orderId));
      inFlight.delete(op.orderId);
      if (result.ok) {
        orders = orders.map((o) => (o.id === result.value.id ? result.value : o));
        publish();
        return { ok: true };
      }
      notice = { tone: "error", message: result.error.message };
      await refetch(op.orderId);
      return {
        ok: false,
        reason: result.error.code === "forbidden" ? "forbidden" : "failed",
        message: result.error.message,
      };
    } catch (error) {
      inFlight.delete(op.orderId);
      notice = { tone: "error", message: describe(error) };
      publish();
      return { ok: false, reason: "failed", message: describe(error) };
    }
  }

  const unsubscribe = events.subscribe((event) => {
    switch (event.type) {
      case "shipment.dispatched":
      case "shipment.delivered":
        void refetch(event.orderId);
        return;
      case "session.changed":
        role = event.role;
        publish();
        return;
    }
  });

  return {
    getState: store.getState,
    subscribe: store.subscribe,
    dispatch: (op) => {
      switch (op.kind) {
        case "load":
          return load();
        case "cancel":
        case "refund":
          return mutate(op);
        case "dismissNotice":
          notice = undefined;
          publish();
          return Promise.resolve({ ok: true });
      }
    },
    dispose: unsubscribe,
  };
}

export type OrdersUx = ReturnType<typeof OrdersUx>;

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function formatCents(cents: number) {
  return usd.format(cents / 100);
}

function describe(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
