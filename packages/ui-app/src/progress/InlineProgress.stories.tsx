import type { Meta, StoryObj } from "@storybook/react-vite";

import { InlineProgress } from "./InlineProgress";

const meta = {
  title: "app/InlineProgress",
  component: InlineProgress,
  args: { label: "Dispatching…" },
} satisfies Meta<typeof InlineProgress>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
