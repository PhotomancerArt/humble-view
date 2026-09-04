import type { BackendResult } from "@humble/backend";

/** What a mutating service call returns: the backend's answer, network or not. */
export type ServiceResult<T> = BackendResult<T>;
