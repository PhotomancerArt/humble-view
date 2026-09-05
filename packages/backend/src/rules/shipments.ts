import { type BackendResult, fail, ok } from "../domain/BackendError";
import type { Order } from "../domain/Order";
import type { Shipment } from "../domain/Shipment";

/** A ready shipment can be handed to the carrier. */
export function startDispatch(shipment: Shipment, now: number): BackendResult<Shipment> {
  if (shipment.status !== "ready" && shipment.status !== "failed") {
    return fail(
      "invalid_state",
      `Shipment ${shipment.id} is ${shipment.status}; only ready shipments can be dispatched`,
    );
  }
  return ok({ ...shipment, status: "dispatching", updatedAt: now });
}

/** The carrier accepted: the shipment is in transit and its order is shipped. */
export function completeDispatch(
  shipment: Shipment,
  order: Order,
  now: number,
): { shipment: Shipment; order: Order } {
  return {
    shipment: { ...shipment, status: "in_transit", updatedAt: now },
    order: { ...order, status: "shipped" },
  };
}

/** The carrier refused: the shipment is failed and may be retried. */
export function failDispatch(shipment: Shipment, now: number): Shipment {
  return { ...shipment, status: "failed", updatedAt: now };
}

/** The cross-feature rule lives here: a delivered shipment delivers its order. */
export function markDelivered(
  shipment: Shipment,
  order: Order,
  now: number,
): BackendResult<{ shipment: Shipment; order: Order }> {
  if (shipment.status !== "in_transit") {
    return fail(
      "invalid_state",
      `Shipment ${shipment.id} is ${shipment.status}; only shipments in transit can be delivered`,
    );
  }
  return ok({
    shipment: { ...shipment, status: "delivered", updatedAt: now },
    order: { ...order, status: "delivered" },
  });
}
