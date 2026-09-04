import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { available, disabled, forbidden, unavailable } from "@humble/ux-core";

import { ActionBar } from "./ActionBar";

type Op = { kind: "cancel" } | { kind: "refund" } | { kind: "dispatch" };

const meta = {
  title: "app/ActionBar",
  component: ActionBar<Op>,
  args: {
    onDispatch: fn(),
    testIdPrefix: "orders-1042",
    actions: [
      {
        op: { kind: "cancel" },
        label: "Cancel",
        affordance: available(),
        destructive: true,
        confirm: {
          title: "Cancel order #1042?",
          body: "This cannot be undone.",
          confirmLabel: "Cancel order",
        },
      },
      { op: { kind: "refund" }, label: "Refund", affordance: forbidden("Admins only") },
      { op: { kind: "dispatch" }, label: "Dispatch", affordance: unavailable() },
    ],
  },
} satisfies Meta<typeof ActionBar<Op>>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Shipped: Story = {
  args: {
    actions: [
      {
        op: { kind: "cancel" },
        label: "Cancel",
        affordance: disabled("Only pending orders can be cancelled"),
      },
      { op: { kind: "refund" }, label: "Refund", affordance: available() },
    ],
  },
};
