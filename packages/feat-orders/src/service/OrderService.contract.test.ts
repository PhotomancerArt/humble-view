import { provideAuth, provideInProcessHttp } from "@humble/app-core";
import { provideBackend, provideFakeBackend } from "@humble/app-core/testing";
import { provideFakeClock, Providers } from "@humble/ux-core";

import { describeOrderService } from "./OrderService.contract";
import { provideFakeOrderService, provideOrderService } from "./provideOrderService";

describeOrderService(
  "Fake",
  Providers(provideFakeClock, provideFakeBackend(), provideFakeOrderService),
);

describeOrderService(
  "Http over in-process routes",
  Providers(
    provideFakeClock,
    provideBackend(),
    provideInProcessHttp,
    provideAuth,
    provideOrderService,
  ),
);
