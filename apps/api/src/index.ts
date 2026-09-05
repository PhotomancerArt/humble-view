import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { Backend, backendRoutes } from "@humble/backend";
import { seedDemo } from "@humble/backend/testing";
import { SystemClock } from "@humble/ux-core";

/** The backend as a node server, for the dashboard's network composition root. */
const port = Number(process.env.PORT ?? 8787);
const backend = Backend({ clock: SystemClock(), carrierLatencyMs: 800 });
await seedDemo(backend);

const app = new Hono();
app.use("*", cors({ origin: ["http://localhost:5173"] }));
app.route("/", backendRoutes(backend));

serve({ fetch: app.fetch, port }, () => {
  console.log(`Dispatch api on http://localhost:${port} (seeded with the demo data)`);
});
