import { OrdersUx, type OrdersUxCtx } from "./OrdersUx";

/** The last link of an orders world. Disposing the world disposes the Ux. */
export function provideOrdersUx(ctx: OrdersUxCtx) {
  const ordersUx = OrdersUx(ctx);
  return { ordersUx, [Symbol.dispose]: () => ordersUx.dispose() };
}
