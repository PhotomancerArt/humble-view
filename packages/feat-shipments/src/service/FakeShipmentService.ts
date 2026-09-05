import type { Backend } from "@humble/backend";
import type { FakeScript } from "@humble/app-core/testing";

import type { ShipmentMethod, ShipmentService } from "./ShipmentService";

/** The service without the network, plus a script. Carrier behaviour is the backend's, not ours. */
export function FakeShipmentService({
  backend,
  script,
}: {
  backend: Backend;
  script: FakeScript<ShipmentMethod>;
}): ShipmentService {
  return {
    list: () => script.run("list", () => backend.shipments.list()),
    get: (id) => script.run("get", () => backend.shipments.get(id)),
    dispatch: (id) =>
      script.run(
        "dispatch",
        () => backend.shipments.dispatch(id),
        (error) => ({ ok: false, error }),
      ),
    markDelivered: (id) =>
      script.run(
        "markDelivered",
        () => backend.shipments.markDelivered(id),
        (error) => ({ ok: false, error }),
      ),
  };
}
