# ADR 0001: Service / Ux / View layers, with tests and stories on shared fakes

- Status: accepted
- Date: 2026-09-04

## Context

A React feature usually grows the same way: data loading in effects, decisions in hooks, and
"may the user do this" spread across components. Every test then needs the DOM (React Testing
Library) and every story needs network mocks (`msw` handlers copied per story). The rules that
decide what a screen may do are only reachable by rendering the screen. Nothing is reusable from a
CLI, an agent, or a second framework.

Dispatch exists to be the reference for a different arrangement, so its layering is a decision to
record rather than an accident to explain later.

## Decision

**Three layers per feature.**

- **Service**: the port to the outside. An interface, an `Http*` implementation over a fetch-shaped
  client, a `Fake*` implementation over the simulated backend, and one contract suite run against
  both. The fake is proven equivalent, not assumed.
- **Ux**: a framework-free controller factory over an explicit context. It owns its services,
  emits a data-only `State`, accepts `Op`s through `dispatch`, and re-validates the op's affordance
  before acting. Every rule about what the user may do lives here, once.
- **View**: a React component of `{ state, dispatch }`. It renders, dispatches, and decides
  nothing. A `Page` is the one place React meets a Ux (`useUx`).

**Four UI layers as packages**, so the boundaries are the dependency graph, not a convention:
`ui-design` (tokens), `ui-base` (primitives, no app knowledge), `ui-app` (the app's common language,
the only UI package that knows `Affordance`), and the page layer inside each feature's `view/`.

**The dependency rule.** Arrows mean "may import".

```text
ui-design ← ui-base ← ui-app ← feat-* → app-core → ux-core
                       ↑ ux-core         ↑ backend (fakes, routes, worlds)
apps → feat-*, ui-app, app-core, backend, ux-core   (storybook → dashboard, to render it)
```

Features never import each other or apps. `ui-base` never imports `ux-core`. `scripts/check-deps.mjs`
fails CI on a violation.

**Two proofs, one set of fakes.** Ux tests are plain vitest tests with no DOM whose second argument
is a provider chain — the _world_. Page stories boot the Ux on the same chain inside `World` and
carry play tests. Component stories render hand-built states. Builders (`TestOrder`,
`TestShipment`) create rows through the backend's own code path and compose as providers
(`provideOrders([...])`).

**Actions are data.** `Affordance` is `available` / `disabled(reason)` / `forbidden(reason)` /
`unavailable` — semantic state; the surface decides presentation. An `Action` is an op, a label, an
affordance, and presentation data (`destructive`, `confirm`). Confirmation is presentation: the
surface asks, the Ux never models a pending confirmation. Progress is data: an in-flight op is
`disabled` with `progress`. No action field exists without a renderer and a story that honors it.

**Authorization twice, on purpose.** The Ux computes affordances from `AuthService` so the UI can
explain itself; the backend enforces the same rules and refuses. The Ux turns the refusal into a
notice and a refetch, so a stale UI degrades correctly.

**The backend is simulated, and it owns the rules.** `packages/backend` is a TypeScript module:
domain, in-memory store, rules (including the cross-feature rule "delivered shipment ⇒ delivered
order"), and Hono routes. Fakes call it directly; `Http*` services call the routes through a
fetch-shaped function — the network, or `routes.request` in-process. The deployed dashboard mounts
the routes in the browser, so GitHub Pages runs the real HTTP path with no server.

**Cross-feature reaction is an event plus a refetch.** `feat-shipments` publishes
`shipment.delivered { orderId }`; `feat-orders` refetches that order. The rule itself ran in the
backend.

**Context is explicit in the browser.** `Providers` is vendored from ts-provide without its ambient
context; a Ux takes `ctx` as an argument.

## Alternatives considered

- **Logic in hooks, React Testing Library, `msw`.** The default. Rejected: every test and every
  story pays for the DOM and the network, and the rules stay reachable only through rendering.
- **A state-management library with its own testing story.** Rejected: it buys a store and sells a
  vocabulary; the Ux here is a factory function and `useSyncExternalStore`, about twenty lines.
- **One UI package with lint-enforced boundaries.** Rejected: a lint rule is a convention with a
  linter; a package boundary is a build failure.
- **Feature-owned backend slices with hooks between them** (each feature's memory store calls the
  other's on delivery). Rejected: the cross-feature rule would live in the composition root, and no
  feature test could see it. One simulated backend keeps the rule in one place and lets
  `feat-orders` test the reaction alone.

## Consequences

- Cheaper: a feature's rules are unit-testable in a few lines; stories need no backend; the same
  world serves a test and a story; a second view framework is an adapter, not a rewrite.
- More verbose: a feature is ~15 files with a naming convention to keep; `State` must be projected
  on every change; the backend rules and the Ux affordances say the same thing twice.
- To add a feature an agent copies `packages/feat-orders`, renames by the vocabulary, writes the
  contract suite first, and adds the package to the dependency check. `AGENTS.md` is the checklist.

## References

- [A Humble UI Stack](https://lab.photomancer.art/post/2026-09-humble-ui-stack/) (the post this repo
  leads), [Providers](https://lab.photomancer.art/post/2026-08-04-providers/),
  [Fixture builders](https://lab.photomancer.art/post/2026-08-04-fixture-builders/),
  [ts-provide](https://github.com/PhotomancerArt/ts-provide).
