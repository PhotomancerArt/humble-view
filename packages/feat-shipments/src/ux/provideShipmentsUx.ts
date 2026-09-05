import { ShipmentsUx, type ShipmentsUxCtx } from "./ShipmentsUx";

/** The last link of a shipments world. Disposing the world disposes the Ux. */
export function provideShipmentsUx(ctx: ShipmentsUxCtx) {
  const shipmentsUx = ShipmentsUx(ctx);
  return { shipmentsUx, [Symbol.dispose]: () => shipmentsUx.dispose() };
}
