import type { Backend } from "@humble/backend";
import type { FakeScript } from "@humble/app-core/testing";

import type { OrderMethod, OrderService } from "./OrderService";

/** The service without the network, plus a script: it calls the backend the routes would call. */
export function FakeOrderService({
  backend,
  script,
}: {
  backend: Backend;
  script: FakeScript<OrderMethod>;
}): OrderService {
  return {
    list: () => script.run("list", () => backend.orders.list()),
    get: (id) => script.run("get", () => backend.orders.get(id)),
    cancel: (id) =>
      script.run(
        "cancel",
        () => backend.orders.cancel(id),
        (error) => ({ ok: false, error }),
      ),
    refund: (id) =>
      script.run(
        "refund",
        () => backend.orders.refund(id),
        (error) => ({ ok: false, error }),
      ),
  };
}
