import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatusBadge } from "../status/StatusBadge";
import { DetailLayout } from "./DetailLayout";

const meta = {
  title: "app/DetailLayout",
  component: DetailLayout,
  parameters: { layout: "padded" },
  args: {
    title: "Order #1042",
    meta: [
      { label: "Customer", value: "Radia" },
      { label: "Status", value: <StatusBadge tone="info">Shipped</StatusBadge> },
      { label: "Total", value: "$120.00" },
    ],
    sections: [
      { title: "Shipments", content: <p className="text-sm">1 shipment in transit.</p> },
      { title: "History", content: <p className="text-sm text-muted-foreground">No events.</p> },
    ],
  },
} satisfies Meta<typeof DetailLayout>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
