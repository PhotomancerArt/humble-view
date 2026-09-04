import type { Role, Session } from "@humble/backend";

import { type HttpClient, readJson } from "../http/HttpClient";
import type { AuthService } from "./AuthService";

export function HttpAuthService({ http }: { http: HttpClient }): AuthService {
  return {
    current: () => readJson<Session>(http("/session")),
    setRole: async (role: Role) => {
      await readJson<Session>(
        http("/session", {
          method: "PUT",
          body: JSON.stringify({ role }),
          headers: { "content-type": "application/json" },
        }),
      );
    },
  };
}
