import { type FetchLike, provideAuth, provideEvents, provideHttpClient } from "@humble/app-core";
import { provideOrderService, provideOrdersUx } from "@humble/feat-orders";
import { provideShipmentService, provideShipmentsUx } from "@humble/feat-shipments";
import { type ProvidedCtx, provideClock, Providers } from "@humble/ux-core";

/**
 * The one place the whole app is wired. Both composition roots call this; they differ only in
 * the `fetch` they pass: the network, or the backend routes answering in-process.
 */
export function provideDispatchApp(http: { fetch: FetchLike; baseUrl?: string }) {
  return Providers(
    provideClock,
    provideEvents,
    provideHttpClient(http),
    provideAuth,
    provideOrderService,
    provideShipmentService,
    provideOrdersUx,
    provideShipmentsUx,
  );
}

export type DispatchCtx = ProvidedCtx<ReturnType<typeof provideDispatchApp>>;
