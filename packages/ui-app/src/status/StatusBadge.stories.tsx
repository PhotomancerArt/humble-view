import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatusBadge, type StatusTone } from "./StatusBadge";

const tones: StatusTone[] = ["neutral", "info", "success", "warning", "danger"];

const meta = {
  title: "app/StatusBadge",
  component: StatusBadge,
  args: { tone: "info", children: "Shipped" },
} satisfies Meta<typeof StatusBadge>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {tones.map((tone) => (
        <StatusBadge key={tone} tone={tone}>
          {tone}
        </StatusBadge>
      ))}
    </div>
  ),
};
