import type { Backend } from "@humble/backend";

import type { AuthService } from "./AuthService";

/** The auth service without the network: it reads and writes the backend's session directly. */
export function FakeAuthService({ backend }: { backend: Backend }): AuthService {
  return {
    current: () => backend.session.get(),
    setRole: (role) => backend.session.setRole(role),
  };
}
