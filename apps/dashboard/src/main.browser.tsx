import { createRoot } from "react-dom/client";

import "@humble/ui-design/theme.css";
import { InlineProgress } from "@humble/ui-app";
import { World } from "@humble/ux-core/react";

import { App } from "./App";
import { provideBrowserBackend } from "./provideBrowserBackend";
import { provideDispatchApp } from "./provideDispatchApp";

// The browser root: the same Http services, but `fetch` is the backend's routes answering
// in-process. This is what GitHub Pages serves; nothing is mocked, there is just no server.
const app = async () => {
  const { fetch } = await provideBrowserBackend();
  return provideDispatchApp({ fetch })();
};

createRoot(document.getElementById("root")!).render(
  <World provider={app} fallback={<InlineProgress label="Booting…" className="m-6" />}>
    {(ctx) => <App ctx={ctx} />}
  </World>,
);
