import { type Backend, backendRoutes } from "@humble/backend";

import { HttpClient } from "./HttpClient";

/** The real HTTP path with no server: the routes answer `fetch` in-process. */
export function provideInProcessHttp({ backend }: { backend: Backend }): { http: HttpClient } {
  const routes = backendRoutes(backend);
  return { http: HttpClient({ fetch: (path, init) => routes.request(path, init) }) };
}
