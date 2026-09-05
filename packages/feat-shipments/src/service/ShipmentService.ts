import type { Shipment } from "@humble/backend";
import type { ServiceResult } from "@humble/app-core";

/** The shipments feature's port to the outside. Http talks to the backend; Fake is the backend. */
export interface ShipmentService {
  list: () => Promise<Shipment[]>;
  get: (id: string) => Promise<Shipment | undefined>;
  dispatch: (id: string) => Promise<ServiceResult<Shipment>>;
  markDelivered: (id: string) => Promise<ServiceResult<Shipment>>;
}

export type ShipmentMethod = keyof ShipmentService;
