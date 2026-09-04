import { provideBackend } from "@humble/backend/testing";

import { provideFakeBackend } from "../testing";
import { provideFakeClock, Providers } from "@humble/ux-core";

import { provideInProcessHttp } from "../http/provideInProcessHttp";
import { describeAuthService } from "./AuthService.contract";
import { provideAuth } from "./provideAuth";

describeAuthService("Fake", Providers(provideFakeClock, provideFakeBackend()));

describeAuthService(
  "Http over in-process routes",
  Providers(provideFakeClock, provideBackend(), provideInProcessHttp, provideAuth),
);
