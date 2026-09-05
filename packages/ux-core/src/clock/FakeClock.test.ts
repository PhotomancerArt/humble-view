import { describe, expect, test } from "vitest";

import { FakeClock } from "./FakeClock";

describe("FakeClock", () => {
  test("a sleep resolves only after enough time is advanced", async () => {
    const clock = FakeClock();
    let done = false;
    void clock.sleep(100).then(() => (done = true));

    await clock.advance(99);
    expect(done).toBe(false);
    expect(clock.pending()).toBe(1);

    await clock.advance(1);
    expect(done).toBe(true);
    expect(clock.now()).toBe(100);
    expect(clock.pending()).toBe(0);
  });

  test("sleeps resolve in due order and see the right time", async () => {
    const clock = FakeClock(1_000);
    const log: number[] = [];
    void clock.sleep(50).then(() => log.push(clock.now()));
    void clock.sleep(10).then(() => log.push(clock.now()));

    await clock.advance(100);

    expect(log).toEqual([1_010, 1_050]);
    expect(clock.now()).toBe(1_100);
  });

  test("work scheduled from a resolved sleep runs within the same advance", async () => {
    const clock = FakeClock();
    const log: string[] = [];
    void clock.sleep(10).then(async () => {
      log.push("first");
      await clock.sleep(10);
      log.push("second");
    });

    await clock.advance(20);

    expect(log).toEqual(["first", "second"]);
  });
});
