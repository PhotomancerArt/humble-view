import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@humble/ui-core";

import { AppShell } from "./AppShell";

const meta = {
  title: "app/AppShell",
  component: AppShell,
  parameters: { layout: "fullscreen" },
  args: {
    title: "Dispatch",
    nav: (
      <>
        <Button variant="ghost" size="sm">
          Orders
        </Button>
        <Button variant="ghost" size="sm">
          Shipments
        </Button>
      </>
    ),
    roleSlot: (
      <Button variant="outline" size="sm">
        Role: admin
      </Button>
    ),
    children: <p className="text-sm text-muted-foreground">Page content goes here.</p>,
  },
} satisfies Meta<typeof AppShell>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
