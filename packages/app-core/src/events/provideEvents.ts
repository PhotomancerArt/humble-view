import { EventBus } from "@humble/ux-core";

import type { DispatchEvent } from "./DispatchEvent";

export type EventsCtx = { events: EventBus<DispatchEvent> };

export function provideEvents(): EventsCtx {
  return { events: EventBus<DispatchEvent>() };
}
