import { expect, test } from "vitest";

import { packageName } from "./index";

test("placeholder", () => {
  expect(packageName).toBe("@humble/ui-app");
});
