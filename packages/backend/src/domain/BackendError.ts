export type BackendError = {
  code: "not_found" | "forbidden" | "invalid_state" | "carrier_error";
  message: string;
};

export type BackendResult<T> = { ok: true; value: T } | { ok: false; error: BackendError };

export function ok<T>(value: T): BackendResult<T> {
  return { ok: true, value };
}

export function fail<T = never>(code: BackendError["code"], message: string): BackendResult<T> {
  return { ok: false, error: { code, message } };
}
