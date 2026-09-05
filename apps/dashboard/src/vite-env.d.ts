/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Where the network root sends requests. Default: http://localhost:8787 (apps/api). */
  readonly VITE_API_URL?: string;
}
