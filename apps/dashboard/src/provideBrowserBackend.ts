import { Backend, backendRoutes } from "@humble/backend";
import { seedDemo } from "@humble/backend/testing";
import type { FetchLike } from "@humble/app-core";
import { SystemClock } from "@humble/ux-core";

/** A seeded backend whose routes answer `fetch` without a network. */
export async function provideBrowserBackend(): Promise<{ fetch: FetchLike; backend: Backend }> {
  const backend = Backend({ clock: SystemClock(), carrierLatencyMs: 800 });
  await seedDemo(backend);
  const routes = backendRoutes(backend);
  return { backend, fetch: (path, init) => routes.request(path, init) };
}
