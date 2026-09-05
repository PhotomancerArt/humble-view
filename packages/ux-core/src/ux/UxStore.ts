/** The read side of a Ux: current state plus change notification. Plain functions, safe to pass around. */
export interface UxStore<S> {
  getState: () => S;
  subscribe: (listener: () => void) => () => void;
}

export function UxStore<S>(
  initial: S,
): UxStore<S> & { setState: (next: S | ((s: S) => S)) => void } {
  let state = initial;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    setState: (next) => {
      const value = typeof next === "function" ? (next as (s: S) => S)(state) : next;
      if (Object.is(value, state)) return;
      state = value;
      for (const listener of [...listeners]) listener();
    },
  };
}
