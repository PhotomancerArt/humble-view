import type { Role, Session } from "@humble/backend";

/** Who is logged in. Dispatch has no login; the role is a switch. */
export interface AuthService {
  current: () => Promise<Session>;
  setRole: (role: Role) => Promise<void>;
}
