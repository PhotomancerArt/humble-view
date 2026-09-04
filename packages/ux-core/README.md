# @humble/ux-core

The pattern, with no Dispatch in it. Every other package builds on this one; it depends on nothing
in the workspace.

- **`Providers`** (`provider/`) and **`test()`** (`/ux-core/test`) — vendored from
  [ts-provide](https://github.com/PhotomancerArt/ts-provide) and the
  [providers post](https://lab.photomancer.art/post/2026-08-04-providers/). A provider is
  `(ctx) => moreCtx`; `Providers(a, b, c)` folds a typed chain into `() => Promise<ctx>`, and the
  order is checked at compile time. `test(name, world, fn)` builds the world, runs the body, and
  disposes it. Ambient context (`AsyncLocalStorage`) is not vendored: in the browser the Ux takes
  its context explicitly.
- **`UxStore`** (`ux/UxStore.ts`) — `getState` / `subscribe` / `setState`. The read side of a Ux.
- **`Ux`, `DispatchResult`** (`ux/Ux.ts`) — a Ux owns its services, emits a data-only State, and
  accepts Ops through `dispatch`, which re-validates the op's affordance before acting.
- **`Affordance`** (`ux/Affordance.ts`) — `available` / `disabled(reason)` / `forbidden(reason)` /
  `unavailable`. Semantic state only; the surface decides presentation.
- **`Action`** (`ux/Action.ts`) — an op, its affordance, a label, and presentation data
  (`destructive`, `confirm`). Carried by State.
- **`EventBus`** (`events/`) — synchronous typed publish/subscribe, the only channel between
  features.
- **`Clock`, `SystemClock`, `FakeClock`** (`clock/`) — time as a service. `FakeClock.advance(ms)`
  resolves due sleeps in order; `settle()` lets pending work run.
- **`@humble/ux-core/react`** — `useUx(ux)` (one `useSyncExternalStore`) and `World`, which boots
  a provider chain and renders children with the context. The only React in the package.

## Doctrine

- The Ux reports semantic state; the surface decides how to show it.
- Re-validate on dispatch: a stale View cannot make the Ux act on an op it no longer allows.
- Confirmation is presentation. An action carries `confirm`; the surface asks; the Ux never models a
  pending confirmation.
- Progress is data. An in-flight op is `disabled` with `progress: { label }`.
