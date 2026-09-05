# AGENTS.md

Doctrine and checklist for agents working in this repository. Read this, then
[README.md](./README.md) for the reasoning, then [ADR 0001](./docs/adr/0001-service-ux-view-layers.md).

## Where code goes

| Kind of code                               | Package / path                        | Filename                                                               |
| ------------------------------------------ | ------------------------------------- | ---------------------------------------------------------------------- |
| Design tokens, theme, CSS variables        | `packages/ui-design/src/theme.css`    |                                                                        |
| Primitive component (no app knowledge)     | `packages/ui-core/src/components/ui/` | `<name>.tsx` (shadcn layout), story beside it                          |
| App-level component, layout, affordance UI | `packages/ui-app/src/<area>/`         | `<Name>.tsx`, `<Name>.stories.tsx`                                     |
| Domain model, store, rules, routes         | `packages/backend/src/`               | `domain/*.ts`, `rules/*.ts`, `routes/*.ts`                             |
| Builders, world providers, demo seed       | `packages/backend/src/testing/`       | `Test<Name>.ts`, `worlds.ts`, `demo.ts`                                |
| Dispatch-wide client service               | `packages/app-core/src/<area>/`       | `<Name>Service.ts`, `Http<Name>Service.ts`, …                          |
| Feature service, fake, contract suite      | `packages/feat-<name>/src/service/`   | `<Name>Service.ts`, `<Name>Service.contract.ts`                        |
| Feature logic                              | `packages/feat-<name>/src/ux/`        | `<Names>Op.ts`, `<Names>State.ts`, `<Names>Ux.ts`, `<Names>Ux.test.ts` |
| Feature screen                             | `packages/feat-<name>/src/view/`      | `<Names>View.tsx`, `<Names>Page.tsx`, `*.stories.tsx`                  |
| Sample states, demo data for stories       | `packages/feat-<name>/src/testing/`   | `sampleStates.ts`, `demo<Names>.ts`                                    |
| Composition roots, shell, routing          | `apps/dashboard/src/`                 | `provideDispatchApp.ts`, `main*.tsx`, `App.tsx`                        |
| Full-app story                             | `apps/storybook/src/`                 | `Dispatch.stories.tsx`                                                 |

A feature may keep a local component at any layer when it needs one. The shared packages are the
default home, not a prohibition.

## The dependency rule

Arrows mean "may import".

```text
ui-design ← ui-core ← ui-app ← feat-* → app-core → ux-core
                       ↑ ux-core         ↑ backend (fakes, routes, worlds)
apps → feat-*, ui-app, app-core, backend, ux-core   (storybook → dashboard, to render it)
```

- Features never import each other or apps. They talk through `DispatchEvent` on the bus.
- `ui-core` never imports `ux-core`: a button does not know what an affordance is.
- Test-only code (`vitest`, contract suites) is never exported from a package's main or `testing`
  entry; `test`, `describe`, `expect` come from `@humble/ux-core/test`.
- `pnpm check:deps` enforces the edges and the declared-dependency rule; `pnpm validate` runs it.

## Naming

| Term       | Files and symbols                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------- |
| Service    | `OrderService` (interface), `HttpOrderService`, `FakeOrderService`, `describeOrderService`      |
| Provider   | `provideOrderService`, `provideFakeOrderService`, `provideOrdersUx`; worlds are chains of these |
| Builder    | `TestOrder(backend).create(overrides)`; `provideOrders([...])` composes it                      |
| Op         | `OrdersOp` — `{ kind: "cancel"; orderId }`                                                      |
| Affordance | `available()` / `disabled(reason, progress?)` / `forbidden(reason)` / `unavailable()`           |
| Action     | `OrdersAction = Action<OrdersOp>`                                                               |
| State      | `OrdersState` (+ `OrderRow`)                                                                    |
| Ux         | `OrdersUx(ctx)` returning `{ getState, subscribe, dispatch, dispose }`; `type OrdersUx`         |
| View       | `OrdersView({ state, dispatch })`                                                               |
| Page       | `OrdersPage({ ordersUx })`                                                                      |
| Event      | `DispatchEvent` union in `app-core`                                                             |
| Fake       | `Fake*Service` over the backend plus a `FakeScript` handle (`ordersScript`) in the world        |
| Ux test    | `OrdersUx.test.ts`: `test(name, world, async (ctx) => …)`                                       |
| Stories    | `OrdersView.stories.tsx` (hand-built state), `OrdersPage.stories.tsx` (`World` + play tests)    |

Conventions: no classes, factory functions returning plain objects; the primary export is the first
declaration after imports; filenames match the primary export; tests and stories are co-located;
story titles follow the layer (`design/`, `core/`, `app/`, `orders/`, `shipments/`, `dispatch/`);
play stories are named `Test: …`; `data-testid` on every element a play test touches, named
`<feature>-<thing>-<id>`; conventional commits (`feat(orders): …`).

## Rules

- **The View decides nothing.** No domain `if` in JSX; no import from `service/` or `app-core` in
  a View. If a View needs a fact, the Ux puts it in State.
- **State is data.** Serializable, complete, no functions. It must survive `JSON.parse(JSON.stringify(s))`.
- **Every rule lives in the Ux, once, with a test.** Which ops apply to which row for whom; what
  happens in flight; how refusals come back.
- **Re-validate on dispatch.** A non-available op returns `{ ok: false, reason }` without calling
  the service.
- **No action field without a renderer and a story that honors it.** `ActionButton` in `ui-app` is
  the renderer; its `AllStates` story is the proof.
- **Confirmation is presentation.** An action carries `confirm`; the surface asks; the Ux never
  models a pending confirmation.
- **Progress is data.** An in-flight op is `disabled` with `progress: { label }`.
- **Authorization twice.** The Ux computes `forbidden` with a reason; the backend enforces and
  refuses; the Ux turns the refusal into a notice and a refetch.
- **Every service ships Fake + Http + one contract suite run against both.**
- **Ux tests and page stories share worlds.** The chain in the test is the chain in the story.
- **Backend owns the rules.** Cross-feature rules run there; features react to events.
- **Context is explicit.** No ambient context in the browser; a Ux takes `ctx`.

## To add a feature

1. Copy `packages/feat-orders` to `packages/feat-<name>`; rename by the naming table.
2. Service interface → contract suite → `Http*` and `Fake*` until the suite passes twice.
3. Backend rules (with tests) in `packages/backend/src/rules/` if the domain grows.
4. `Op`, `State`, `Ux`: one test per rule; the flagship flow first in the test file.
5. `View` from `ui-app` components; `Page` with `useUx` and `load` on mount.
6. `sampleStates` + component stories; page stories on the test's world with `World`; a `Test:`
   story per flow.
7. Events: publish a `DispatchEvent` for anything another feature must know; subscribe in the Ux;
   unsubscribe in `dispose`.
8. Add the package to `scripts/check-deps.mjs`, mount the page in `apps/dashboard/src/App.tsx`,
   seed demo rows in `packages/backend/src/testing/demo.ts`, write the package README.

## To add a service

1. Interface in `<Name>Service.ts`, results as `ServiceResult<T>`.
2. `describe<Name>Service(name, world)` in `<Name>Service.contract.ts`, importing from
   `@humble/ux-core/test`. Cases: the happy path, each refusal, unknown id.
3. `Http<Name>Service({ http })` using `readJson` / `readResult`; a route in
   `packages/backend/src/routes/backendRoutes.ts` if none exists.
4. `Fake<Name>Service({ backend, script })` using `FakeScript.run`.
5. `provide<Name>Service` (Http) and `provideFake<Name>Service` (Fake + script handle).
6. `<Name>Service.contract.test.ts` runs the suite for the fake and for Http over
   `provideInProcessHttp`.

## Validation

```bash
pnpm validate                  # what CI runs: format:check, check:deps, lint, typecheck, test, build, test:storybook
pnpm --filter @humble/<pkg> test
pnpm --filter @humble/storybook test:storybook
pnpm fix                       # prettier + eslint --fix
```

CI runs `pnpm validate` on every pull request and on `main`; a push to `main` also deploys the
dashboard and Storybook to GitHub Pages. Do not suppress warnings, skip tests, or loosen tsconfig
to get green; report the problem instead.
