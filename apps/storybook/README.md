# @humble/storybook

Storybook 10 (`@storybook/react-vite`) for every package's stories, plus the full-app `dispatch/`
story. Play tests run in Playwright's Chromium through `@storybook/addon-vitest`.

```bash
pnpm --filter @humble/storybook dev             # http://localhost:6006
pnpm --filter @humble/storybook build           # storybook-static/
pnpm --filter @humble/storybook test:storybook  # play tests, headless
pnpm --filter @humble/storybook exec playwright install chromium   # once, before test:storybook
```

Story titles follow the layer: `design/…`, `core/…`, `app/…`, `orders/…`, `shipments/…`,
`dispatch/…`. Play-test stories are named `Test: …`. The theme toolbar toggles the `dark` class; the
"Preview" toolbar renders any story at sm / md / lg in light and dark at once (`ResponsivePreview`
from `ui-core`, which stories can also use directly).
