import type { BackendError, BackendResult } from "@humble/backend";
import type { MaybePromise } from "@humble/ux-core";

/** Anything fetch-shaped: `fetch` itself, or a Hono app's `request`. */
export type FetchLike = (path: string, init?: RequestInit) => MaybePromise<Response>;

/** The one HTTP seam. Paths are relative; `baseUrl` says where they go. */
export type HttpClient = (path: string, init?: RequestInit) => Promise<Response>;

export function HttpClient(opts: { fetch: FetchLike; baseUrl?: string }): HttpClient {
  const base = (opts.baseUrl ?? "").replace(/\/$/, "");
  return async (path, init) => await opts.fetch(`${base}${path}`, init);
}

export function provideHttpClient(opts: { fetch: FetchLike; baseUrl?: string }) {
  return (): { http: HttpClient } => ({ http: HttpClient(opts) });
}

/** A successful response's JSON, or an error thrown from the body — for reads that cannot fail. */
export async function readJson<T>(response: MaybePromise<Response>): Promise<T> {
  const res = await response;
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${res.url || "request"}`);
  return (await res.json()) as T;
}

/** Maps an HTTP response back onto the backend's result shape. */
export async function readResult<T>(response: MaybePromise<Response>): Promise<BackendResult<T>> {
  const res = await response;
  if (res.ok) return { ok: true, value: (await res.json()) as T };
  const error = (await res.json()) as BackendError;
  return { ok: false, error };
}
