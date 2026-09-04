import { describe, expect, test } from "vitest";

import { HttpClient, readResult } from "./HttpClient";

describe("HttpClient", () => {
  test("prefixes paths with the base url", async () => {
    const seen: string[] = [];
    const http = HttpClient({
      baseUrl: "http://localhost:8787/",
      fetch: (path) => {
        seen.push(path);
        return Response.json({});
      },
    });

    await http("/orders");

    expect(seen).toEqual(["http://localhost:8787/orders"]);
  });

  test("readResult maps error bodies back to BackendResult", async () => {
    const failed = readResult(Response.json({ code: "forbidden", message: "no" }, { status: 403 }));
    const ok = readResult(Response.json({ id: "ord-1" }));

    expect(await failed).toEqual({ ok: false, error: { code: "forbidden", message: "no" } });
    expect(await ok).toEqual({ ok: true, value: { id: "ord-1" } });
  });
});
