import { createRoot } from "react-dom/client";

import "@humble/ui-design/theme.css";
import { InlineProgress } from "@humble/ui-app";
import { World } from "@humble/ux-core/react";

import { App } from "./App";
import { provideDispatchApp } from "./provideDispatchApp";

// The network root: Http services over fetch to apps/api.
const app = provideDispatchApp({
  fetch: (path, init) => fetch(path, init),
  baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8787",
});

createRoot(document.getElementById("root")!).render(
  <World provider={app} fallback={<InlineProgress label="Connecting…" className="m-6" />}>
    {(ctx) => <App ctx={ctx} />}
  </World>,
);
