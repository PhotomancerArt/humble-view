/**
 * The semantic availability of an op. The Ux reports *what is true* — the op is available, it is
 * disabled for a reason, the user is not allowed, or it does not apply — and the surface decides
 * how to present it (grey, lock icon, hide). No presentation words live here.
 */
export type Affordance =
  | { status: "available" }
  | { status: "disabled"; reason: string; progress?: { label: string } }
  | { status: "forbidden"; reason: string }
  | { status: "unavailable" };

export function available(): Affordance {
  return { status: "available" };
}

export function disabled(reason: string, progress?: { label: string }): Affordance {
  return progress ? { status: "disabled", reason, progress } : { status: "disabled", reason };
}

export function forbidden(reason: string): Affordance {
  return { status: "forbidden", reason };
}

export function unavailable(): Affordance {
  return { status: "unavailable" };
}

export function isAvailable(affordance: Affordance): boolean {
  return affordance.status === "available";
}
