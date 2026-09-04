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
- `AppContext = { clock, events, auth }`.

May import: `ux-core`, `backend` (for the fake and the in-process routes). Imported by: `feat-*`,
apps.
