import { type BackendResult, fail, ok } from "../domain/BackendError";
import type { Order } from "../domain/Order";
import type { Session } from "../domain/Session";

/** Any role may cancel, but only a pending order. */
export function cancel(order: Order): BackendResult<Order> {
  if (order.status !== "pending") {
    return fail(
      "invalid_state",
      `Order ${order.id} is ${order.status}; only pending orders can be cancelled`,
    );
  }
  return ok({ ...order, status: "cancelled" });
}

/** Admins only, and only after the order is delivered or cancelled. */
export function refund(order: Order, session: Session): BackendResult<Order> {
  if (session.role !== "admin") {
    return fail("forbidden", "Only admins can refund orders");
  }
  if (order.status !== "delivered" && order.status !== "cancelled") {
    return fail(
      "invalid_state",
      `Order ${order.id} is ${order.status}; only delivered or cancelled orders can be refunded`,
    );
  }
  return ok({ ...order, status: "refunded" });
}
