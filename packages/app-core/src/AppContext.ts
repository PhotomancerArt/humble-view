import type { Clock, EventBus } from "@humble/ux-core";

import type { AuthService } from "./auth/AuthService";
import type { DispatchEvent } from "./events/DispatchEvent";

/** What every feature's Ux can count on. Services are added per feature on top of this. */
export type AppContext = {
  clock: Clock;
  events: EventBus<DispatchEvent>;
  auth: AuthService;
};
