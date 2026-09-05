# @humble/ui-design

The design layer: tokens only. `theme.css` is the Tailwind 4 theme plus the shadcn CSS variables for
light (`:root`) and dark (`.dark`), with three Dispatch additions — `success`, `warning`, `info` — for
status colours. `tokens.ts` mirrors the token names for stories and docs. No components live here.

- May import: nothing in the workspace.
- Imported by: `ui-core` (and any app that needs the stylesheet: `@humble/ui-design/theme.css`).
- Stories: `design/Swatches` (every colour token in both themes), `design/Typography`.
