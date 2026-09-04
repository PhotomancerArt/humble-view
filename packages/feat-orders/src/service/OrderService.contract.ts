import type { Backend } from "@humble/backend";
import { TestOrder } from "@humble/backend/testing";
import { type Chain, describe, expect, test } from "@humble/ux-core";

import type { OrderService } from "./OrderService";

/** What every OrderService must do. Run against the fake and against Http over the routes. */
export function describeOrderService(
  name: string,
  world: Chain<{ orderService: OrderService; backend: Backend }>,
) {
  describe(`OrderService: ${name}`, () => {
    test("list returns the orders the backend has", world, async ({ orderService, backend }) => {
      const radia = await TestOrder(backend).create({ customer: "Radia" });
      const ada = await TestOrder(backend).create({ customer: "Ada" });

      const orders = await orderService.list();

      expect(orders.map((o) => o.id)).toEqual([radia.id, ada.id]);
      expect(orders[0]).toMatchObject({ customer: "Radia", status: "pending" });
    });

    test("get returns undefined for an unknown id", world, async ({ orderService, backend }) => {
      const order = await TestOrder(backend).create();

      expect(await orderService.get(order.id)).toMatchObject({ id: order.id });
      expect(await orderService.get("ord-none")).toBeUndefined();
    });

    test("cancel: pending → cancelled", world, async ({ orderService, backend }) => {
      const order = await TestOrder(backend).create({ status: "pending" });

      expect(await orderService.cancel(order.id)).toMatchObject({
        ok: true,
        value: { status: "cancelled" },
      });
      expect((await order.get()).status).toBe("cancelled");
    });

    test("cancel: shipped → invalid_state", world, async ({ orderService, backend }) => {
      const order = await TestOrder(backend).create({ status: "shipped" });

      expect(await orderService.cancel(order.id)).toMatchObject({
        ok: false,
        error: { code: "invalid_state" },
      });
    });

    test("refund as agent → forbidden", world, async ({ orderService, backend }) => {
      await backend.session.setRole("agent");
      const order = await TestOrder(backend).create({ status: "delivered" });

      expect(await orderService.refund(order.id)).toMatchObject({
        ok: false,
        error: { code: "forbidden" },
      });
    });

    test("refund as admin after delivery → refunded", world, async ({ orderService, backend }) => {
      await backend.session.setRole("admin");
      const order = await TestOrder(backend).create({ status: "delivered" });

      expect(await orderService.refund(order.id)).toMatchObject({
        ok: true,
        value: { status: "refunded" },
      });
    });

    test("unknown id → not_found", world, async ({ orderService }) => {
      expect(await orderService.cancel("ord-none")).toMatchObject({
        ok: false,
        error: { code: "not_found" },
      });
    });
  });
}
