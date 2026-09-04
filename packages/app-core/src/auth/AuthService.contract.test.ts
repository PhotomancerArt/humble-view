import { provideFakeBackend } from "@humble/backend/testing";
import { provideFakeClock, Providers } from "@humble/ux-core";

import { provideInProcessHttp } from "../http/provideInProcessHttp";
import { describeAuthService } from "./AuthService.contract";
import { provideAuth, provideFakeAuth } from "./provideAuth";

describeAuthService("Fake", Providers(provideFakeClock, provideFakeBackend(), provideFakeAuth));

describeAuthService(
  "Http over in-process routes",
  Providers(provideFakeClock, provideFakeBackend(), provideInProcessHttp, provideAuth),
);
