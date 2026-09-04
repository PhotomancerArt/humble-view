import type { Clock } from "@humble/ux-core";

import { Backend, type BackendOptions } from "../Backend";
import { type OrderSpec, TestOrder } from "./TestOrder";
import { type ShipmentSpec, TestShipment } from "./TestShipment";

export type BackendCtx = { backend: Backend };

/** A fresh simulated backend on the world's clock. Worlds start with `provideFakeClock`. */
export function provideFakeBackend(opts: Omit<BackendOptions, "clock"> = {}) {
  return ({ clock }: { clock: Clock }): BackendCtx => ({ backend: Backend({ clock, ...opts }) });
}

/** Logs the world in as an admin. */
export async function provideAdmin({ backend }: BackendCtx): Promise<Record<never, never>> {
  await backend.session.setRole("admin");
  return {};
}

/** Logs the world in as an agent (the default role). */
export async function provideAgent({ backend }: BackendCtx): Promise<Record<never, never>> {
  await backend.session.setRole("agent");
  return {};
}

/** Creates orders through the builder and hands their handles to the context as `orders`. */
export function provideOrders(specs: OrderSpec[]) {
  return async ({ backend }: BackendCtx) => ({
    orders: await sequentially(specs, (spec) => TestOrder(backend).create(spec)),
  });
}

/** Creates shipments (and their orders when unspecified) as `shipments`. */
export function provideShipments(specs: ShipmentSpec[]) {
  return async ({ backend }: BackendCtx) => ({
    shipments: await sequentially(specs, (spec) => TestShipment(backend).create(spec)),
  });
}

async function sequentially<T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (const item of items) out.push(await fn(item));
  return out;
}
