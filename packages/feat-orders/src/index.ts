export { FakeOrderService } from "./service/FakeOrderService";
export { HttpOrderService } from "./service/HttpOrderService";
export type { OrderMethod, OrderService } from "./service/OrderService";
export { describeOrderService } from "./service/OrderService.contract";
export {
  type OrderServiceCtx,
  provideFakeOrderService,
  provideOrderService,
} from "./service/provideOrderService";
export type { OrdersOp } from "./ux/OrdersOp";
export type { OrderRow, OrdersAction, OrdersState } from "./ux/OrdersState";
export { OrdersUx, type OrdersUxCtx } from "./ux/OrdersUx";
export { provideOrdersUx } from "./ux/provideOrdersUx";
export { OrdersPage } from "./view/OrdersPage";
export { OrdersView } from "./view/OrdersView";
