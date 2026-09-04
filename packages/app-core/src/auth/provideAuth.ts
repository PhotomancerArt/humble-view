import type { Backend } from "@humble/backend";

import type { HttpClient } from "../http/HttpClient";
import type { AuthService } from "./AuthService";
import { FakeAuthService } from "./FakeAuthService";
import { HttpAuthService } from "./HttpAuthService";

export type AuthCtx = { auth: AuthService };

export function provideAuth({ http }: { http: HttpClient }): AuthCtx {
  return { auth: HttpAuthService({ http }) };
}

export function provideFakeAuth({ backend }: { backend: Backend }): AuthCtx {
  return { auth: FakeAuthService({ backend }) };
}
