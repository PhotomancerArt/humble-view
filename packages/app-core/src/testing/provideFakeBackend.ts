import type { BackendOptions } from "@humble/backend";
import { provideBackend } from "@humble/backend/testing";
import { type Clock, EventBus } from "@humble/ux-core";

import { FakeAuthService } from "../auth/FakeAuthService";
import type { DispatchEvent } from "../events/DispatchEvent";

/**
 * A fake world's foundation: the simulated backend, the fake auth service over its session, and
 * a fresh event bus. Everything a feature's fakes and Ux need, short of the feature itself.
 */
export function provideFakeBackend(opts: Omit<BackendOptions, "clock"> = {}) {
  return (ctx: { clock: Clock }) => {
    const { backend } = provideBackend(opts)(ctx);
    return { backend, auth: FakeAuthService({ backend }), events: EventBus<DispatchEvent>() };
  };
}
