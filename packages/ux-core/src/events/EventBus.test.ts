import { afterEach, describe, expect, test, vi } from "vitest";

import { EventBus } from "./EventBus";

type Ping = { type: "ping"; n: number };

afterEach(() => vi.restoreAllMocks());

describe("EventBus", () => {
  test("delivers synchronously to every subscriber", () => {
    const bus = EventBus<Ping>();
    const seen: number[] = [];
    bus.subscribe((e) => seen.push(e.n));
    bus.subscribe((e) => seen.push(e.n * 10));

    bus.publish({ type: "ping", n: 1 });

    expect(seen).toEqual([1, 10]);
  });

  test("unsubscribe stops delivery", () => {
    const bus = EventBus<Ping>();
    const listener = vi.fn();
    const unsubscribe = bus.subscribe(listener);

    bus.publish({ type: "ping", n: 1 });
    unsubscribe();
    bus.publish({ type: "ping", n: 2 });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("a throwing listener does not stop the others; its error surfaces later", () => {
    const deferred: Array<() => void> = [];
    vi.spyOn(globalThis, "queueMicrotask").mockImplementation((fn) => deferred.push(fn));
    const bus = EventBus<Ping>();
    const later = vi.fn();
    bus.subscribe(() => {
      throw new Error("boom");
    });
    bus.subscribe(later);

    bus.publish({ type: "ping", n: 1 });

    expect(later).toHaveBeenCalledOnce();
    expect(deferred).toHaveLength(1);
    expect(() => deferred[0]?.()).toThrow("boom");
  });
});
