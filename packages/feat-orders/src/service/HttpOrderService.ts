import type { Order } from "@humble/backend";
import { type HttpClient, readJson, readResult } from "@humble/app-core";

import type { OrderService } from "./OrderService";

export function HttpOrderService({ http }: { http: HttpClient }): OrderService {
  return {
    list: () => readJson<Order[]>(http("/orders")),
    get: async (id) => {
      const res = await http(`/orders/${id}`);
      return res.status === 404 ? undefined : readJson<Order>(res);
    },
    cancel: (id) => readResult<Order>(http(`/orders/${id}/cancel`, { method: "POST" })),
    refund: (id) => readResult<Order>(http(`/orders/${id}/refund`, { method: "POST" })),
  };
}
