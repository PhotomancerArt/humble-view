import type { Meta, StoryObj } from "@storybook/react-vite";

import { About } from "@humble/dashboard/About";

// First in the sidebar: what this Storybook belongs to, and where the rest of the project lives.
const meta = {
  title: "dispatch/About",
  component: About,
  parameters: { layout: "padded" },
} satisfies Meta<typeof About>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
