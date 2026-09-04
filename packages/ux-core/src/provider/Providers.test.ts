import { describe, expect } from "vitest";

import { disposeCtx, Providers } from "./Providers";
import { test } from "./test";

function provideConfig() {
  return { config: { greeting: "Hello" } };
}

function provideNames({ config }: { config: { greeting: string } }) {
  return { names: [`${config.greeting}, Ada`] };
}

async function provideAsyncCount({ names }: { names: string[] }) {
  await Promise.resolve();
  return { count: names.length };
}

describe("Providers", () => {
  test("a chain accumulates every link's output", async () => {
    const ctx = await Providers(provideConfig, provideNames, provideAsyncCount)();

    expect(ctx.config.greeting).toBe("Hello");
    expect(ctx.names).toEqual(["Hello, Ada"]);
    expect(ctx.count).toBe(1);
  });

  test("chains are providers too", async () => {
    const base = Providers(provideConfig, provideNames);
    const ctx = await Providers(base, provideAsyncCount)();

    expect(ctx.count).toBe(1);
  });

  test("the types enforce the order", () => {
    // @ts-expect-error A provider cannot run before its dependencies exist.
    Providers(provideNames);
    // @ts-expect-error Order matters: names need config before they run.
    Providers(provideNames, provideConfig);
    // @ts-expect-error The count needs names, not just config.
    Providers(provideConfig, provideAsyncCount);
  });

  test("disposers run in reverse order", async () => {
    const log: string[] = [];
    const chain = Providers(
      () => ({ a: 1, [Symbol.dispose]: () => void log.push("a") }),
      () => ({ b: 2, [Symbol.asyncDispose]: () => Promise.resolve(void log.push("b")) }),
      () => ({ c: 3 }),
    );
    const ctx = await chain();

    expect(ctx).toMatchObject({ a: 1, b: 2, c: 3 });
    expect(Symbol.dispose in ctx).toBe(false);
    await disposeCtx(ctx);
    expect(log).toEqual(["b", "a"]);
  });

  test("a nested chain's disposers run with the outer chain", async () => {
    const log: string[] = [];
    const inner = Providers(() => ({ a: 1, [Symbol.dispose]: () => void log.push("inner") }));
    const ctx = await Providers(inner, () => ({
      [Symbol.dispose]: () => void log.push("outer"),
    }))();

    await disposeCtx(ctx);
    expect(log).toEqual(["outer", "inner"]);
  });
});

describe("test()", () => {
  const disposed: string[] = [];

  test("hands the world to the body", Providers(provideConfig, provideNames), ({ names }) => {
    expect(names).toEqual(["Hello, Ada"]);
  });

  test(
    "disposes the world after the body",
    Providers(() => ({ [Symbol.dispose]: () => void disposed.push("world") })),
    () => {
      expect(disposed).toEqual([]);
    },
  );

  test("…which the next test can observe", () => {
    expect(disposed).toEqual(["world"]);
  });
});
