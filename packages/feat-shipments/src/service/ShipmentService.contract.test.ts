import { provideAuth, provideInProcessHttp } from "@humble/app-core";
import { provideBackend, provideFakeBackend } from "@humble/app-core/testing";
import { provideFakeClock, Providers } from "@humble/ux-core";

import { provideFakeShipmentService, provideShipmentService } from "./provideShipmentService";
import { describeShipmentService } from "./ShipmentService.contract";

describeShipmentService(
  "Fake",
  Providers(provideFakeClock, provideFakeBackend(), provideFakeShipmentService),
);

describeShipmentService(
  "Http over in-process routes",
  Providers(
    provideFakeClock,
    provideBackend(),
    provideInProcessHttp,
    provideAuth,
    provideShipmentService,
  ),
);
