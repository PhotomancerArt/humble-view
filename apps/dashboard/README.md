# @humble/dashboard

The Dispatch dashboard: Vite + React, `AppShell` with Orders and Shipments pages, a role toggle in
the header. Everything is wired once, in `provideDispatchApp`, and there are two composition roots
that differ only in the `fetch` they pass:

| Entry                | Root               | `fetch`                                      |
| -------------------- | ------------------ | -------------------------------------------- |
| `index.html`         | `main.tsx`         | the network, to `apps/api` on `:8787`        |
| `index.browser.html` | `main.browser.tsx` | `backendRoutes(backend).request`, in-process |

The browser root is what GitHub Pages serves. It is the real HTTP path — the same `Http*` services,
the same Hono routes, the same JSON — with no server, because the backend is a TypeScript module.
`Dispatch.integration.test.tsx` boots that root under jsdom and proves the cross-feature flow:
delivering a shipment delivers its order.

```bash
pnpm --filter @humble/api dev            # terminal 1
pnpm --filter @humble/dashboard dev      # terminal 2 → http://localhost:5173
pnpm --filter @humble/dashboard build    # dist/ with both entries; VITE_BASE sets the base path
```
