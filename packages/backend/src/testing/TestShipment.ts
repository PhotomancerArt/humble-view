import type { Backend } from "../Backend";
import type { Shipment, ShipmentInput } from "../domain/Shipment";
import { TestOrder } from "./TestOrder";

export type ShipmentSpec = Partial<ShipmentInput>;

export type ShipmentHandle = { id: string; orderId: string; get: () => Promise<Shipment> };

/** Builder for shipments. A missing `orderId` creates a fresh pending order first. */
export function TestShipment(backend: Backend) {
  const byId = (id: string, orderId: string): ShipmentHandle => ({
    id,
    orderId,
    get: async () => {
      const shipment = await backend.shipments.get(id);
      if (!shipment) throw new Error(`Shipment ${id} no longer exists`);
      return shipment;
    },
  });

  return Object.assign(byId, {
    create: async (overrides: ShipmentSpec = {}): Promise<ShipmentHandle> => {
      const orderId = overrides.orderId ?? (await TestOrder(backend).create()).id;
      const shipment = await backend.shipments.create({ ...overrides, orderId });
      return byId(shipment.id, orderId);
    },
  });
}
