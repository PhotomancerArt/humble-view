import { type ReactNode, useEffect, useState } from "react";

import { disposeCtx } from "../provider/Providers";

/**
 * Runs a provider chain once and renders `children(ctx)`; page stories use it to boot a Ux on the
 * same world a Ux test uses. Keep `provider` stable (module level): a new function is a new world.
 */
export function World<T extends object>(props: {
  provider: () => Promise<T>;
  fallback?: ReactNode;
  children: (ctx: T) => ReactNode;
}) {
  const { provider } = props;
  const [ctx, setCtx] = useState<T | undefined>(undefined);

  useEffect(() => {
    let current: T | undefined;
    let cancelled = false;
    void provider().then((built) => {
      if (cancelled) return void disposeCtx(built);
      current = built;
      setCtx(built);
    });
    return () => {
      cancelled = true;
      setCtx(undefined);
      if (current) void disposeCtx(current);
    };
  }, [provider]);

  return ctx === undefined ? (props.fallback ?? null) : props.children(ctx);
}
