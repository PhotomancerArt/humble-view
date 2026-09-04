import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Notice } from "./Notice";

const meta = {
  title: "app/Notice",
  component: Notice,
  parameters: { layout: "padded" },
  args: { tone: "error", children: "Northwind Freight refused shipment #2001." },
} satisfies Meta<typeof Notice>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Error: Story = {
  args: { onDismiss: fn() },
};

export const Info: Story = {
  args: { tone: "info", children: "Order #1042 was delivered while you were looking." },
};

export const NotDismissable: Story = {};
