# @humble/backend

This is the backend, simulated: a plain TypeScript module with the domain model, an in-memory
store, the business rules, and Hono routes in front of it. There is no real persistence and no
network inside this package; `apps/api` serves the routes over HTTP, the Pages build mounts them in
the browser, and the contract suites call `routes.request` in-process.

**Rules live here, once.** `rules/orders.ts` (cancel only when pending; refund only as admin and
only after delivered or cancelled) and `rules/shipments.ts` (dispatch, carrier failure, and the
cross-feature rule: a delivered shipment delivers its order). The Ux layer computes affordances so
the UI can explain itself, and the backend enforces the same rules and refuses — authorization is
checked twice, on purpose.

**Builders and worlds** (`testing/`): `TestOrder` / `TestShipment` create rows through the
backend's own create path and return live handles. `provideFakeBackend`, `provideAdmin`,
`provideAgent`, `provideOrders([...])`, `provideShipments([...])` are the provider links every Ux
test and page story starts from.

- May import: `ux-core` (for `Clock`). Hono appears only under `routes/`.
- Imported by: `app-core` (fakes, in-process HTTP), `feat-*`, apps.
