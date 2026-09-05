import type { Backend } from "@humble/backend";
import type { HttpClient } from "@humble/app-core";
import { FakeScript } from "@humble/app-core/testing";
import type { Clock } from "@humble/ux-core";

import { FakeShipmentService } from "./FakeShipmentService";
import { HttpShipmentService } from "./HttpShipmentService";
import type { ShipmentMethod, ShipmentService } from "./ShipmentService";

export type ShipmentServiceCtx = { shipmentService: ShipmentService };

export function provideShipmentService({ http }: { http: HttpClient }): ShipmentServiceCtx {
  return { shipmentService: HttpShipmentService({ http }) };
}

export function provideFakeShipmentService({ backend, clock }: { backend: Backend; clock: Clock }) {
  const shipmentsScript = FakeScript<ShipmentMethod>(clock);
  return {
    shipmentService: FakeShipmentService({ backend, script: shipmentsScript }),
    shipmentsScript,
  };
}
