import type { Order } from "@humble/backend";
import type { ServiceResult } from "@humble/app-core";

/** The orders feature's port to the outside. Http talks to the backend; Fake is the backend. */
export interface OrderService {
  list: () => Promise<Order[]>;
  get: (id: string) => Promise<Order | undefined>;
  cancel: (id: string) => Promise<ServiceResult<Order>>;
  refund: (id: string) => Promise<ServiceResult<Order>>;
}

export type OrderMethod = keyof OrderService;
