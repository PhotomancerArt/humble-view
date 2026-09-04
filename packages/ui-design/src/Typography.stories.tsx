import type { Meta, StoryObj } from "@storybook/react-vite";

import { typeScale } from "./tokens";

function Typography() {
  return (
    <div className="grid gap-4">
      {typeScale.map(({ name, className }) => (
        <div key={name} className="grid grid-cols-[10rem_1fr] items-baseline gap-4">
          <span className="font-mono text-xs text-muted-foreground">{name}</span>
          <span className={className}>Dispatch ships 42 orders before noon</span>
        </div>
      ))}
    </div>
  );
}

const meta = {
  title: "design/Typography",
  component: Typography,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Typography>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
