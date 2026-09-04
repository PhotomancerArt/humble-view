import { type Chain } from "@humble/ux-core";
import { describe, expect, test } from "@humble/ux-core/test";

import type { AuthService } from "./AuthService";

/** The behaviour every AuthService must have. Run it against the fake and the real one. */
export function describeAuthService(name: string, world: Chain<{ auth: AuthService }>) {
  describe(`AuthService: ${name}`, () => {
    test("starts as an agent", world, async ({ auth }) => {
      expect(await auth.current()).toEqual({ role: "agent" });
    });

    test("setRole changes the current session", world, async ({ auth }) => {
      await auth.setRole("admin");
      expect(await auth.current()).toEqual({ role: "admin" });
      await auth.setRole("agent");
      expect(await auth.current()).toEqual({ role: "agent" });
    });
  });
}
