import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@humble/ui-core";

import { ListLayout } from "./ListLayout";

const meta = {
  title: "app/ListLayout",
  component: ListLayout,
  parameters: { layout: "padded" },
  args: {
    title: "Orders",
    description: "Everything waiting on a decision.",
    toolbar: (
      <Button variant="outline" size="sm">
        Refresh
      </Button>
    ),
    children: <div className="rounded-md border p-6 text-sm text-muted-foreground">content</div>,
  },
} satisfies Meta<typeof ListLayout>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TitleOnly: Story = {
  args: { description: undefined, toolbar: undefined },
};
