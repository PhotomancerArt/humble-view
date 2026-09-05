import { available, disabled, forbidden, unavailable } from "@humble/ux-core";

import type { OrderRow, OrdersState } from "../ux/OrdersState";

/** Hand-built states for component stories. Page stories boot the real Ux on a world instead. */

function row(
  id: string,
  customer: string,
  total: string,
  status: OrderRow["status"],
  role: "admin" | "agent",
): OrderRow {
  const cancel = {
    op: { kind: "cancel", orderId: id } as const,
    label: "Cancel",
    destructive: true,
    confirm: {
      title: `Cancel order ${id}?`,
      body: `${customer} will be notified. This cannot be undone.`,
      confirmLabel: "Cancel order",
    },
    affordance:
      status === "pending" ? available() : disabled("Only pending orders can be cancelled"),
  };
  const refund = {
    op: { kind: "refund", orderId: id } as const,
    label: "Refund",
    affordance:
      role === "agent"
        ? forbidden("Admins only")
        : status === "delivered" || status === "cancelled"
          ? available()
          : unavailable(),
  };
  return { id, customer, total, status, actions: [cancel, refund] };
}

function rows(role: "admin" | "agent"): OrderRow[] {
  return [
    row("ord-1001", "Radia", "$120.00", "pending", role),
    row("ord-1002", "Ada", "$64.50", "shipped", role),
    row("ord-1003", "Grace", "$310.00", "delivered", role),
    row("ord-1004", "Lin", "$18.00", "cancelled", role),
    row("ord-1005", "Noor", "$92.25", "refunded", role),
  ];
}

export const sampleStates = {
  loading: { phase: "loading", rows: [] } satisfies OrdersState,
  empty: { phase: "ready", rows: [] } satisfies OrdersState,
  readyAsAdmin: { phase: "ready", rows: rows("admin") } satisfies OrdersState,
  readyAsAgent: { phase: "ready", rows: rows("agent") } satisfies OrdersState,
  inFlight: {
    phase: "ready",
    rows: rows("admin").map((r, i) =>
      i === 0
        ? {
            ...r,
            actions: r.actions.map((a) =>
              a.op.kind === "cancel"
                ? { ...a, affordance: disabled("Cancelling", { label: "Cancelling…" }) }
                : a,
            ),
          }
        : r,
    ),
  } satisfies OrdersState,
  withErrorNotice: {
    phase: "ready",
    rows: rows("admin"),
    notice: { tone: "error", message: "Only admins can refund orders" },
  } satisfies OrdersState,
  loadFailed: {
    phase: "error",
    rows: [],
    notice: { tone: "error", message: "Could not load orders: 503 from the backend" },
  } satisfies OrdersState,
};
