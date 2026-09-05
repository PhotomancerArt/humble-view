export interface EventBus<E> {
  publish: (event: E) => void;
  subscribe: (listener: (event: E) => void) => () => void;
}

/**
 * Synchronous publish to every subscriber. A throwing listener does not stop the others; its error
 * is rethrown on the next microtask so it is still visible.
 */
export function EventBus<E>(): EventBus<E> {
  const listeners = new Set<(event: E) => void>();

  return {
    publish(event) {
      for (const listener of [...listeners]) {
        try {
          listener(event);
        } catch (error) {
          queueMicrotask(() => {
            throw error;
          });
        }
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
  };
}
