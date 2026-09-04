import { test as vitestTest } from "vitest";

import { type AnyProvider, disposeCtx, type MaybePromise, type ProvidedCtx } from "./Providers";

/**
 * `test(name, fn)` is vitest's test. `test(name, world, fn)` builds the world — a provider chain —
 * hands its context to the body, and disposes it afterwards.
 */
export function test(name: string, fn: () => MaybePromise<void>): void;
export function test<P extends AnyProvider>(
  name: string,
  world: P,
  fn: (ctx: ProvidedCtx<P>) => MaybePromise<void>,
): void;
export function test(
  name: string,
  worldOrFn: AnyProvider | (() => MaybePromise<void>),
  fn?: (ctx: object) => MaybePromise<void>,
): void {
  if (fn === undefined) {
    vitestTest(name, worldOrFn as () => MaybePromise<void>);
    return;
  }

  vitestTest(name, async () => {
    const ctx = await (worldOrFn as () => MaybePromise<object>)();
    try {
      await fn(ctx);
    } finally {
      await disposeCtx(ctx);
    }
  });
}
