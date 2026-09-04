import type { Clock } from "@humble/ux-core";

import { type BackendResult, fail, ok } from "./domain/BackendError";
import type { Order, OrderInput } from "./domain/Order";
import type { Role, Session } from "./domain/Session";
import type { Shipment, ShipmentInput } from "./domain/Shipment";
import { MemoryStore } from "./MemoryStore";
import * as orderRules from "./rules/orders";
import * as shipmentRules from "./rules/shipments";

export type BackendOptions = {
  clock: Clock;
  /** Decides whether the carrier refuses a dispatch. Default: never. */
  carrier?: { fail: (shipment: Shipment) => boolean };
  /** Simulated carrier round trip, slept on the injected clock. Default: 0. */
  carrierLatencyMs?: number;
};

/**
 * The backend, simulated. Owns the domain rules — including "delivered shipment ⇒ delivered
 * order" and "refund requires admin" — and knows who is logged in. Fakes call it directly; the
 * Hono routes in `routes/` put HTTP in front of it. Every mutating call returns a `BackendResult`.
 */
export function Backend(opts: BackendOptions) {
  const store = MemoryStore();
  const { clock } = opts;
  const carrier = opts.carrier ?? { fail: () => false };
  const carrierLatencyMs = opts.carrierLatencyMs ?? 0;
  let session: Session = { role: "agent" };

  const orders = {
    list: (): Promise<Order[]> => Promise.resolve(store.orders.list()),
    get: (id: string): Promise<Order | undefined> => Promise.resolve(store.orders.get(id)),
    create: (input: OrderInput): Promise<Order> =>
      Promise.resolve(
        store.orders.put({
          id: store.orders.nextId(),
          customer: input.customer,
          totalCents: input.totalCents,
          status: input.status ?? "pending",
          createdAt: clock.now(),
        }),
      ),
    cancel: (id: string): Promise<BackendResult<Order>> => {
      const order = store.orders.get(id);
      if (!order) return Promise.resolve(fail("not_found", `Order ${id} not found`));
      const result = orderRules.cancel(order);
      if (result.ok) store.orders.put(result.value);
      return Promise.resolve(result);
    },
    refund: (id: string): Promise<BackendResult<Order>> => {
      const order = store.orders.get(id);
      if (!order) return Promise.resolve(fail("not_found", `Order ${id} not found`));
      const result = orderRules.refund(order, session);
      if (result.ok) store.orders.put(result.value);
      return Promise.resolve(result);
    },
  };

  const shipments = {
    list: (): Promise<Shipment[]> => Promise.resolve(store.shipments.list()),
    get: (id: string): Promise<Shipment | undefined> => Promise.resolve(store.shipments.get(id)),
    create: (input: ShipmentInput): Promise<Shipment> => {
      if (!store.orders.get(input.orderId)) {
        return Promise.reject(new Error(`Order ${input.orderId} not found`));
      }
      return Promise.resolve(
        store.shipments.put({
          id: store.shipments.nextId(),
          orderId: input.orderId,
          carrier: input.carrier ?? "Northwind Freight",
          status: input.status ?? "ready",
          updatedAt: clock.now(),
        }),
      );
    },
    dispatch: async (id: string): Promise<BackendResult<Shipment>> => {
      const shipment = store.shipments.get(id);
      if (!shipment) return fail("not_found", `Shipment ${id} not found`);
      const order = store.orders.get(shipment.orderId);
      if (!order) return fail("not_found", `Order ${shipment.orderId} not found`);

      const started = shipmentRules.startDispatch(shipment, clock.now());
      if (!started.ok) return started;
      store.shipments.put(started.value);

      if (carrierLatencyMs > 0) await clock.sleep(carrierLatencyMs);

      if (carrier.fail(started.value)) {
        store.shipments.put(shipmentRules.failDispatch(started.value, clock.now()));
        return fail("carrier_error", `${shipment.carrier} refused shipment ${id}`);
      }
      const done = shipmentRules.completeDispatch(started.value, order, clock.now());
      store.shipments.put(done.shipment);
      store.orders.put(done.order);
      return ok(done.shipment);
    },
    markDelivered: (id: string): Promise<BackendResult<Shipment>> => {
      const shipment = store.shipments.get(id);
      if (!shipment) return Promise.resolve(fail("not_found", `Shipment ${id} not found`));
      const order = store.orders.get(shipment.orderId);
      if (!order) return Promise.resolve(fail("not_found", `Order ${shipment.orderId} not found`));
      const result = shipmentRules.markDelivered(shipment, order, clock.now());
      if (!result.ok) return Promise.resolve(result);
      store.shipments.put(result.value.shipment);
      store.orders.put(result.value.order);
      return Promise.resolve(ok(result.value.shipment));
    },
  };

  const sessionApi = {
    get: (): Promise<Session> => Promise.resolve(session),
    setRole: (role: Role): Promise<void> => {
      session = { role };
      return Promise.resolve();
    },
  };

  return { orders, shipments, session: sessionApi };
}

export type Backend = ReturnType<typeof Backend>;
