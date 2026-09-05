import type { Meta, StoryObj } from "@storybook/react-vite";

import { colorTokens, radiusTokens } from "./tokens";

function Swatches() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-3">
      {colorTokens.map((token) => (
        <div key={token} className="flex items-center gap-3 rounded-md border p-2">
          <div
            className="size-10 shrink-0 rounded-md border"
            style={{ background: `var(--${token})` }}
          />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{token}</div>
            <div className="truncate font-mono text-xs text-muted-foreground">--{token}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Radii() {
  return (
    <div className="flex gap-4">
      {radiusTokens.map((r) => (
        <div key={r} className="flex flex-col items-center gap-1">
          <div className="size-12 bg-primary" style={{ borderRadius: `var(--radius-${r})` }} />
          <span className="font-mono text-xs text-muted-foreground">radius-{r}</span>
        </div>
      ))}
    </div>
  );
}

function BothThemes() {
  return (
    <div className="grid gap-6">
      <section className="rounded-lg border bg-background p-4 text-foreground">
        <h2 className="mb-3 text-lg font-semibold">Light</h2>
        <Swatches />
        <div className="mt-4">
          <Radii />
        </div>
      </section>
      <section className="dark rounded-lg border bg-background p-4 text-foreground">
        <h2 className="mb-3 text-lg font-semibold">Dark</h2>
        <Swatches />
        <div className="mt-4">
          <Radii />
        </div>
      </section>
    </div>
  );
}

const meta = {
  title: "design/Swatches",
  component: BothThemes,
  parameters: { layout: "padded" },
} satisfies Meta<typeof BothThemes>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
