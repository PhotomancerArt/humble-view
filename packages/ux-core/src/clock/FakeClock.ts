import type { Clock } from "./Clock";

export interface FakeClock extends Clock {
  /** Moves time forward, resolving every sleep that comes due, in order. */
  advance: (ms: number) => Promise<void>;
  /** Lets every pending promise chain run to its next await. */
  settle: () => Promise<void>;
  /** How many sleeps are still waiting. */
  pending: () => number;
}

export function FakeClock(startMs = 0): FakeClock {
  let now = startMs;
  let seq = 0;
  const timers: Array<{ due: number; seq: number; resolve: () => void }> = [];

  function settle(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  return {
    now: () => now,
    sleep(ms) {
      return new Promise((resolve) => {
        timers.push({ due: now + ms, seq: seq++, resolve });
      });
    },
    async advance(ms) {
      const target = now + ms;
      for (;;) {
        timers.sort((a, b) => a.due - b.due || a.seq - b.seq);
        const next = timers[0];
        if (!next || next.due > target) break;
        timers.shift();
        now = next.due;
        next.resolve();
        await settle();
      }
      now = target;
    },
    settle,
    pending: () => timers.length,
  };
}
