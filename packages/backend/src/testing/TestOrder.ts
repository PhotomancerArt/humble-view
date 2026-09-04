import type { Backend } from "../Backend";
import type { Order, OrderInput } from "../domain/Order";
import { testStr } from "./testStr";

export type OrderSpec = Partial<OrderInput>;

/** Handle to an order row: its id, and the row as the backend has it right now. */
export type OrderHandle = { id: string; get: () => Promise<Order> };

/**
 * Builder for orders. `TestOrder(backend).create(overrides)` creates through the backend's own
 * create path and returns a live handle; `TestOrder(backend)(id)` wraps an existing row.
 */
export function TestOrder(backend: Backend) {
  const byId = (id: string): OrderHandle => ({
    id,
    get: async () => {
      const order = await backend.orders.get(id);
      if (!order) throw new Error(`Order ${id} no longer exists`);
      return order;
    },
  });

  return Object.assign(byId, {
    create: async (overrides: OrderSpec = {}): Promise<OrderHandle> => {
      const order = await backend.orders.create({
        customer: testStr("customer"),
        totalCents: 4_200,
        ...overrides,
      });
      return byId(order.id);
    },
  });
}
