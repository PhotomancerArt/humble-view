import { type Clock, SystemClock } from "./Clock";
import { FakeClock } from "./FakeClock";

/** The first link of a real world: wall-clock time. */
export function provideClock(): { clock: Clock } {
  return { clock: SystemClock() };
}

/** The first link of a test or story world: time that moves only when advanced. */
export function provideFakeClock(): { clock: FakeClock } {
  return { clock: FakeClock() };
}
