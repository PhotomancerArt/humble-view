# @humble/app-core

Dispatch-wide client services and context — what every feature's Ux can count on, and nothing
feature-specific.

- `AuthService` with `HttpAuthService` (over `/session`), `FakeAuthService` (over the backend's
  session), and `describeAuthService`, the contract suite run against both.
- `HttpClient`: the one HTTP seam, fetch-shaped. `provideHttpClient({ fetch, baseUrl })` for a
  server; `provideInProcessHttp` for the same routes answering in-process. `readResult` maps a
  response back to the backend's result shape.
- `DispatchEvent` and `provideEvents`: the typed bus between features.
- `provideClock` / `provideFakeClock` (re-exported from `ux-core`).
- `AppContext = { clock, events, auth }`; `ServiceResult<T>` is the backend's result shape.
- `@humble/app-core/testing`: `provideFakeBackend()` (the backend + fake auth + event bus — the
  foundation of every fake world), `FakeScript` (latency and scripted failures for fakes), and
  re-exports of the builders and worlds from `@humble/backend/testing`. Browser-safe: no vitest.

May import: `ux-core`, `backend` (for the fake and the in-process routes). Imported by: `feat-*`,
apps.
