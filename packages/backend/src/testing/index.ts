// Fixture builders and world providers, shared by every feature's Ux tests and page stories.
//
// Worlds begin with `provideFakeClock` from `@humble/ux-core` (re-exported by `app-core`), then
// `provideFakeBackend()`, a role, data, and finally the services and Ux under test:
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
  provideFakeBackend,
  provideOrders,
  provideShipments,
} from "./worlds";
