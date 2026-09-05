/** Time as a service, so the Ux never touches `Date` or `setTimeout` directly. */
export interface Clock {
  now: () => number;
  sleep: (ms: number) => Promise<void>;
}

export function SystemClock(): Clock {
  return {
    now: () => Date.now(),
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  };
}
