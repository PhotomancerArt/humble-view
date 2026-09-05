import type { Backend } from "@humble/backend";
import { TestShipment } from "@humble/backend/testing";
import type { Chain } from "@humble/ux-core";
import { describe, expect, test } from "@humble/ux-core/test";

import type { ShipmentService } from "./ShipmentService";

/** What every ShipmentService must do. Run against the fake and against Http over the routes. */
export function describeShipmentService(
  name: string,
  world: Chain<{ shipmentService: ShipmentService; backend: Backend }>,
) {
  describe(`ShipmentService: ${name}`, () => {
    test(
      "list returns the shipments the backend has",
      world,
      async ({ shipmentService, backend }) => {
        const a = await TestShipment(backend).create({ carrier: "Pelican Post" });
        const b = await TestShipment(backend).create();

        const shipments = await shipmentService.list();

        expect(shipments.map((s) => s.id)).toEqual([a.id, b.id]);
        expect(shipments[0]).toMatchObject({ carrier: "Pelican Post", status: "ready" });
      },
    );

    test("get returns undefined for an unknown id", world, async ({ shipmentService, backend }) => {
      const shipment = await TestShipment(backend).create();

      expect(await shipmentService.get(shipment.id)).toMatchObject({ id: shipment.id });
      expect(await shipmentService.get("shp-none")).toBeUndefined();
    });

    test(
      "dispatch: ready → in_transit, and the order is shipped",
      world,
      async ({ shipmentService, backend }) => {
        const shipment = await TestShipment(backend).create();

        expect(await shipmentService.dispatch(shipment.id)).toMatchObject({
          ok: true,
          value: { status: "in_transit" },
        });
        expect((await backend.orders.get(shipment.orderId))?.status).toBe("shipped");
      },
    );

    test("dispatch: in_transit → invalid_state", world, async ({ shipmentService, backend }) => {
      const shipment = await TestShipment(backend).create({ status: "in_transit" });

      expect(await shipmentService.dispatch(shipment.id)).toMatchObject({
        ok: false,
        error: { code: "invalid_state" },
      });
    });

    test(
      "markDelivered: in_transit → delivered, and the order is delivered",
      world,
      async ({ shipmentService, backend }) => {
        const shipment = await TestShipment(backend).create({ status: "in_transit" });

        expect(await shipmentService.markDelivered(shipment.id)).toMatchObject({
          ok: true,
          value: { status: "delivered" },
        });
        expect((await backend.orders.get(shipment.orderId))?.status).toBe("delivered");
      },
    );

    test("markDelivered: ready → invalid_state", world, async ({ shipmentService, backend }) => {
      const shipment = await TestShipment(backend).create();

      expect(await shipmentService.markDelivered(shipment.id)).toMatchObject({
        ok: false,
        error: { code: "invalid_state" },
      });
    });

    test("unknown id → not_found", world, async ({ shipmentService }) => {
      expect(await shipmentService.dispatch("shp-none")).toMatchObject({
        ok: false,
        error: { code: "not_found" },
      });
    });
  });
}
