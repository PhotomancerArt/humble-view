# Dispatch — a humble-view demo

Dispatch is a small shipping dashboard — orders you can cancel or refund, shipments you can hand to
a carrier and mark delivered — built to show a three-layer frontend architecture: **Service / Ux /
View**. The logic of each feature lives in a plain TypeScript object that gets ordinary unit tests
with no DOM; the components get Storybook stories with no backend; and both proofs run on the same
fake services.

- **Live dashboard:** https://photomancerart.github.io/humble-view/
- **Storybook:** https://photomancerart.github.io/humble-view/storybook/
- **The post:** [The Humble View](https://lab.photomancer.art/post/2026-09-humble-view/), which
  builds on [Providers](https://lab.photomancer.art/post/2026-08-04-providers/) and
  [Fixture builders](https://lab.photomancer.art/post/2026-08-04-fixture-builders/).
- **For agents:** start at [AGENTS.md](./AGENTS.md). The decision record is
  [ADR 0001](./docs/adr/0001-service-ux-view-layers.md).

Here is the whole idea in one test. It drives the orders feature — services, rules, state — with
nothing rendered and nothing mocked:

```ts
test(
  "cancelling a pending order",
  Providers(
    provideFakeClock,
    provideFakeBackend(),
    provideAdmin,
    provideOrders([{ customer: "Radia", status: "pending" }]),
    provideFakeOrderService,
    provideOrdersUx,
  ),
  async ({ ordersUx, orders }) => {
    await ordersUx.dispatch({ kind: "load" });
    const [row] = ordersUx.getState().rows;
    expect(row?.actions.find((a) => a.op.kind === "cancel")?.affordance.status).toBe("available");

    await ordersUx.dispatch({ kind: "cancel", orderId: orders[0]!.id });

    expect(ordersUx.getState().rows[0]?.status).toBe("cancelled");
  },
);
```

The [page story](./packages/feat-orders/src/view/OrdersPage.stories.tsx) boots the real screen on
the same six-link chain and drives the same flow with a play test.

## Why so many layers

Each idea below costs something. Here is what each one buys.

### Hexagonal: ports and adapters

Every feature reaches the outside through a **Service** interface with two implementations — one
over HTTP, one over the simulated backend — and one contract suite run against both. Costs: an
interface and a second implementation per service. Buys: testing first of all, since the fake is
proven equivalent rather than trusted; and then freedom to change the transport. A mobile app, a
second protocol, or a backend running in the browser (see below) is a new adapter, and the Ux never
notices.

### The humble view

UIs are hard to test. Instead of making the UI testable, we make it small: the **View** renders
state and dispatches ops, and decides nothing. Everything that decides — which actions apply, to
whom, what happens while one is in flight, how a refusal comes back — is in the **Ux**, a factory
function over an explicit context with no framework in it. Costs: the discipline of never putting
an `if` about the domain in JSX. Buys: most of the logic becomes ordinary unit tests, which is good
for humans and especially good for agents, who can run the whole feature in a test loop without a
browser.

### Stories

Some parts of an app are hard to reach — an error banner, a carrier that fails, a role that may not
refund — and some need isolation from everything else. **Component stories** render hand-built
state; **page stories** boot the Ux on a fake world and carry play tests. Costs: a story file per
component. Buys: every state of every screen is one click away, and the page stories are a second
test suite that runs in a real browser in CI.

### Component layers

UI code lives in four layers: **design** (tokens, colours, treatments), **core** (buttons, dialogs;
knows nothing of the app), **app** (tables, layouts, status badges, action buttons — the app's
common language), and **page** (the actual screens, inside each feature). They are separate
packages, so the boundary is enforced by the build. Costs: four packages. Buys: the theme changes
in one place; an app-level component cannot quietly absorb a domain rule; and the one place that
decides how a forbidden action looks is [`ActionButton`](./packages/ui-app/src/action/ActionButton.tsx).

### Naming conventions

The same thing exists in many layers — an order is a row in the backend, a `ServiceResult`, a
field of `OrdersState`, a `DataTable` row — so it must be obvious which one you are looking at.
The vocabulary is fixed and filenames follow it:

| Term       | Meaning                                                                                                    |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| Service    | Interface to something outside the Ux. `Http*` + `Fake*` + one contract suite run against both.            |
| Provider   | `(ctx) => moreCtx`, composed with `Providers(...)`. The only way anything gets a service.                  |
| World      | A provider chain used as a test's or story's environment.                                                  |
| Builder    | `TestOrder(backend).create(overrides)`: creates rows through the backend, returns a live handle.           |
| Op         | Typed command the Ux accepts. Plain data.                                                                  |
| Affordance | Semantic availability of an op: `available` / `disabled(reason)` / `forbidden(reason)` / `unavailable`.    |
| Action     | An op + its affordance + label (+ `confirm`, `destructive`, `progress`). Carried by State.                 |
| State      | The read model the Ux emits: serializable, complete, no functions.                                         |
| Ux         | Controller factory over ctx: `getState`, `subscribe`, `dispatch(op)`, `dispose`. Re-validates on dispatch. |
| View       | React component of `{ state, dispatch }`. Renders, dispatches, decides nothing.                            |
| Page       | Where React meets a Ux: `useUx(ux)` feeding a View.                                                        |
| Event      | Cross-feature message on the bus. Features never import each other.                                        |

Costs: a table to remember. Buys: `OrdersUx.ts`, `OrdersView.tsx`, `OrdersPage.stories.tsx`,
`OrderService.contract.ts` tell you what they are before you open them.

### Feature modules

`feat-orders` and `feat-shipments` are packages that never import each other or the apps. Costs:
cross-feature reactions go through an event bus and a refetch instead of a function call. Buys:
builds stay fast, each package's tests run alone and in parallel in CI, and a feature can be
understood — or written by an agent — without the rest of the app open.

### Providers and worlds

Dependency injection here is a function: a provider takes the context built so far and returns
more. `Providers(a, b, c)` folds a typed chain, checked at compile time. The chain a Ux test runs in
is the chain its page story boots; builders create rows through the backend's own code path and
hand back live handles. Costs: about a hundred vendored lines and the habit of passing `ctx`. Buys:
one world for a test and a story, no `vi.mock`, no shared fixture state, and a test that fails to
compile when its world is missing a service.

### The backend is a module

`packages/backend` is the backend, simulated: domain, store, rules, and Hono routes, in
TypeScript. The rules — cancel only while pending, refund only as admin, a delivered shipment
delivers its order — live there, once. Costs: a package that a real product would replace. Buys:
fakes that are the backend without the network, contract tests that run in-process with no port,
and a deployed dashboard that runs the real HTTP path in the browser with no server.

## The repo

```text
packages/
  ux-core/        the pattern: Providers, test(), UxStore, Ux, Affordance, Action, EventBus, Clock;
                  ux-core/react: useUx, World
  ui-design/      Tailwind 4 theme + CSS variables (light/dark), typography; swatch stories
  ui-core/        shadcn/ui primitives copied in; ResponsivePreview
  ui-app/         AppShell, ListLayout, DetailLayout, DataTable, RecordCard, StatusBadge,
                  ActionButton, ActionBar, ConfirmDialog, InlineProgress, Notice
  backend/        the simulated backend: domain, MemoryStore, rules, Hono routes;
                  testing/: TestOrder, TestShipment, worlds, seedDemo
  app-core/       AuthService (Http + Fake), HttpClient, DispatchEvent, provideEvents, AppContext;
                  testing/: provideFakeBackend, FakeScript
  feat-orders/    service/ ux/ view/ testing/
  feat-shipments/ service/ ux/ view/ testing/
apps/
  api/            node server: backendRoutes + /session role switch
  dashboard/      Vite + React; two composition roots: main.tsx (api over the network) and
                  main.browser.tsx (routes in the browser; what Pages serves)
  storybook/      Storybook 10 for every package's stories, plus the full-app story
```

Arrows mean "may import":

```text
ui-design ← ui-core ← ui-app ← feat-* → app-core → ux-core
                       ↑ ux-core         ↑ backend (fakes, routes, worlds)
apps → feat-*, ui-app, app-core, backend, ux-core   (storybook → dashboard, to render it)
```

`pnpm check:deps` fails on a violation, locally and in CI. Each package's README says what it may
import and who imports it.

## Add a feature in eight steps

1. Copy `packages/feat-orders` to `packages/feat-<name>` and rename by the vocabulary table.
2. Write the service interface, then the contract suite, then `Http*` and `Fake*` until it passes
   twice.
3. If the backend needs new rules, add them to `packages/backend/src/rules/` with a test; the fake
   gets them for free.
4. Write `<Name>Op`, `<Name>State`, and `<Name>Ux`, one test per rule, the flagship test first.
5. Write `<Name>View` from `ui-app` components, and `<Name>Page` with `useUx`.
6. Component stories on hand-built states in `testing/`; page stories on the test's world with
   `World`, and a `Test:` play story per flow.
7. If another feature must react, publish a `DispatchEvent`; never import the other feature.
8. Add the package to `scripts/check-deps.mjs`, mount the page in `apps/dashboard`, run
   `pnpm validate`.

## Running it

```bash
pnpm install
pnpm validate                            # format check, lint, typecheck, tests, builds, play tests

pnpm --filter @humble/storybook dev      # http://localhost:6006
pnpm --filter @humble/api dev            # http://localhost:8787
pnpm --filter @humble/dashboard dev      # http://localhost:5173, talks to the api
pnpm --filter @humble/storybook test:storybook   # play tests, headless (pnpm --filter @humble/storybook exec playwright install chromium once)
```

The deployed dashboard needs no api: its composition root runs the backend routes in the browser.

## Honest notes

- Everything server-side is simulated: no persistence, no login (the role is a switch), one process.
- Ambient context (`AsyncLocalStorage`) is a server-side trick and is not vendored; in the browser
  every Ux takes its context explicitly, which is also why the tests read the way they do.
- Features may keep their own components at any layer — a local token, primitive, or app-style
  component — when they need one. The shared packages are the default home, not a rule against
  local UI.
- Authorization is checked twice, in the Ux (so the UI can explain) and in the backend (so it is
  enforced). That is deliberate.
- The vendored `Providers` supports eight typed links. `provideDispatchApp` uses all eight.
