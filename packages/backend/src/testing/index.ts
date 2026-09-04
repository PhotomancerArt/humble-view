// Fixture builders and world providers, shared by every feature's Ux tests and page stories.
//
// `provideBackend` yields only the backend; `@humble/app-core/testing` wraps it as
// `provideFakeBackend`, which also yields the fake auth service and the event bus, and re-exports
// everything here. Worlds begin with `provideFakeClock`, then `provideFakeBackend()`, a role, data,
// and finally the services and Ux under test:
//
//   Providers(provideFakeClock, provideFakeBackend(), provideAdmin,
//             provideOrders([{ customer: "Radia" }]), provideFakeOrderService, provideOrdersUx)
export { type OrderHandle, type OrderSpec, TestOrder } from "./TestOrder";
export { type ShipmentHandle, type ShipmentSpec, TestShipment } from "./TestShipment";
export { testStr } from "./testStr";
export {
  type BackendCtx,
  provideAdmin,
  provideAgent,
  provideBackend,
  provideOrders,
  provideShipments,
} from "./worlds";
