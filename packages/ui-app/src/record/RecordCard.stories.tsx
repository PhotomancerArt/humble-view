import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@humble/ui-core";

import { StatusBadge } from "../status/StatusBadge";
import { RecordCard } from "./RecordCard";

const meta = {
  title: "app/RecordCard",
  component: RecordCard,
  args: {
    title: "Shipment #2001",
    subtitle: "Northwind Freight",
    fields: [
      { label: "Order", value: "#1042" },
      { label: "Status", value: <StatusBadge tone="success">Delivered</StatusBadge> },
    ],
    actions: (
      <Button size="sm" variant="outline">
        Track
      </Button>
    ),
  },
} satisfies Meta<typeof RecordCard>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
