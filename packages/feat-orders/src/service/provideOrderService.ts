import type { Backend } from "@humble/backend";
import type { HttpClient } from "@humble/app-core";
import { FakeScript } from "@humble/app-core/testing";
import type { Clock } from "@humble/ux-core";

import { FakeOrderService } from "./FakeOrderService";
import { HttpOrderService } from "./HttpOrderService";
import type { OrderMethod, OrderService } from "./OrderService";

export type OrderServiceCtx = { orderService: OrderService };

export function provideOrderService({ http }: { http: HttpClient }): OrderServiceCtx {
  return { orderService: HttpOrderService({ http }) };
}

/** The fake, and its script so the test or story can change the weather. */
export function provideFakeOrderService({ backend, clock }: { backend: Backend; clock: Clock }) {
  const ordersScript = FakeScript<OrderMethod>(clock);
  return { orderService: FakeOrderService({ backend, script: ordersScript }), ordersScript };
}
