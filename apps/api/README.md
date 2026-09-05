# @humble/api

The simulated backend as a node server: `backendRoutes` behind `@hono/node-server` on port 8787,
seeded with the demo data on boot, with CORS for the dashboard's dev server. The carrier takes
800 ms, so dispatching shows progress.

```bash
pnpm --filter @humble/api dev        # http://localhost:8787
curl http://localhost:8787/orders
curl -X PUT -H 'content-type: application/json' -d '{"role":"admin"}' http://localhost:8787/session
```

The dashboard's network root (`pnpm --filter @humble/dashboard dev`) talks to this server. The
Pages build does not need it: the same routes run in the browser.
