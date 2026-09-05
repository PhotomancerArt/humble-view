import type { Shipment } from "@humble/backend";
import { type HttpClient, readJson, readResult } from "@humble/app-core";

import type { ShipmentService } from "./ShipmentService";

export function HttpShipmentService({ http }: { http: HttpClient }): ShipmentService {
  return {
    list: () => readJson<Shipment[]>(http("/shipments")),
    get: async (id) => {
      const res = await http(`/shipments/${id}`);
      return res.status === 404 ? undefined : readJson<Shipment>(res);
    },
    dispatch: (id) => readResult<Shipment>(http(`/shipments/${id}/dispatch`, { method: "POST" })),
    markDelivered: (id) =>
      readResult<Shipment>(http(`/shipments/${id}/delivered`, { method: "POST" })),
  };
}
