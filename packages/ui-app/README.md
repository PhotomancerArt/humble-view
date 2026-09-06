# @humble/ui-app

The app layer: Dispatch's common visual language, built from `ui-base` primitives. This is the only
UI package that knows what an `Affordance` is, so the presentation decision for each affordance
state lives here, once, in `ActionButton`:

| Affordance    | Default presentation                                                                    |
| ------------- | --------------------------------------------------------------------------------------- |
| `available`   | enabled button; destructive variant when the action says so                             |
| `disabled`    | disabled button; reason on hover and in `aria-description`; progress replaces the label |
| `forbidden`   | disabled button with a lock and the reason                                              |
| `unavailable` | omitted                                                                                 |

`confirm` on an action is presentation too: `ActionButton` opens `ConfirmDialog` and dispatches the
op on confirm. The Ux never models a pending confirmation.

Components: `AppShell`, `ListLayout`, `DetailLayout`, `DataTable`, `RecordCard`, `StatusBadge`,
`ActionButton`, `ActionBar`, `ConfirmDialog`, `InlineProgress`, `Notice`. Every one has a story under
`app/…`; `ActionButton` and `ConfirmDialog` carry `Test:` play stories.

- May import: `ui-base`, `ux-core`.
- Imported by: `feat-*`, apps.
