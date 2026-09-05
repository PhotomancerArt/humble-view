import type { BackendError } from "@humble/backend";
import type { Clock } from "@humble/ux-core";

/**
 * What a fake service does besides call the backend: wait, and fail on cue. Tests and stories hold
 * the handle and change the script mid-flight; `settle()` waits for every call in progress.
 */
export interface FakeScript<Method extends string> {
  latencyMs: number;
  failNext: (method: Method, error: BackendError) => void;
  run: <T>(
    method: Method,
    call: () => Promise<T>,
    onError?: (error: BackendError) => T,
  ) => Promise<T>;
  settle: () => Promise<void>;
}

export function FakeScript<Method extends string>(clock: Clock): FakeScript<Method> {
  let scripted: { method: Method; error: BackendError } | undefined;
  const inFlight = new Set<Promise<unknown>>();

  const script: FakeScript<Method> = {
    latencyMs: 0,
    failNext: (method, error) => {
      scripted = { method, error };
    },
    run: (method, call, onError) => {
      const promise = (async () => {
        if (script.latencyMs > 0) await clock.sleep(script.latencyMs);
        if (scripted?.method === method) {
          const { error } = scripted;
          scripted = undefined;
          if (onError) return onError(error);
          throw new Error(error.message);
        }
        return await call();
      })();
      inFlight.add(promise);
      const done = () => void inFlight.delete(promise);
      promise.then(done, done);
      return promise;
    },
    settle: async () => {
      await Promise.allSettled([...inFlight]);
    },
  };
  return script;
}
