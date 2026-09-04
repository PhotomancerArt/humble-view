# AGENTS.md

Doctrine and checklist for agents working in this repository. Under construction; the vocabulary and
the dependency rule below are final.

## Vocabulary

| Term       | Meaning                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Service    | Interface to something outside the Ux. Real (`Http*`) + fake (`Fake*`) + one contract suite run against both.                         |
| Provider   | `(ctx) => moreCtx`, composed with `Providers(...)`. The only way anything gets a service.                                             |
| World      | A provider chain used as a test's or story's environment.                                                                             |
| Builder    | `TestOrder.create(overrides)` — creates rows through the backend, returns a live handle.                                              |
| Op         | Typed command the Ux accepts. Plain data.                                                                                             |
| Affordance | Semantic availability of an op: `available` / `disabled(reason)` / `forbidden(reason)` / `unavailable`.                               |
| Action     | An op + its affordance + label (+ confirm, destructive, progress). Carried by State.                                                  |
| State      | The read model the Ux emits: serializable, complete, no functions.                                                                    |
| Ux         | Controller factory over ctx: `getState`, `subscribe`, `dispatch(op)`, `dispose`. Framework-free. Re-validates affordance on dispatch. |
| View       | React component of `{ state, dispatch }`. Renders, dispatches, decides nothing.                                                       |
| Page       | Where React meets a Ux: `useUx(ux)` feeding a View.                                                                                   |
| Event      | Cross-feature message on the bus. Features never import each other.                                                                   |

## Dependency graph

Arrows mean "may import".

```text
ui-design ← ui-core ← ui-app ← feat-* → app-core → ux-core
                       ↑ ux-core         ↑ backend (fakes, routes, worlds)
apps → feat-*, ui-app, app-core, backend, ux-core
```

Features never import each other or apps. `ui-core` never imports `ux-core`.

## Validation

```bash
pnpm install
pnpm validate
```
