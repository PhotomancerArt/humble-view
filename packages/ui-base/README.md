# @humble/ui-base

Base components: shadcn/ui primitives (new-york style, Radix) copied in with `shadcn add`, so the
repo owns them. Button, Badge, Dialog, DropdownMenu, Table, Tooltip, Toaster (sonner), and `cn`.
Plus `ResponsivePreview`, a story wrapper that renders its children at several widths, light and
dark, side by side; the Storybook toolbar's "Preview" toggle wraps any story in it.

- May import: `ui-design` only. A button does not know what an affordance is, so this package never
  imports `ux-core`.
- Imported by: `ui-app`.
- Stories: `core/…`, one file per component showing every variant; `core/Dialog` carries the
  `Test: opens and closes` play test.
- Adding a primitive: `pnpm dlx shadcn@latest add <name>` in this directory (the `components.json`
  is here), then re-export it from `src/index.ts` and point its `cn` import at `../../lib/cn`.
