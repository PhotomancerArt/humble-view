import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { ResponsivePreview } from "@humble/ui-core";

import { sampleStates } from "../testing/sampleStates";
import { OrdersView } from "./OrdersView";

const meta = {
  title: "orders/OrdersView",
  component: OrdersView,
  parameters: { layout: "padded" },
  args: { dispatch: fn(), state: sampleStates.readyAsAdmin },
} satisfies Meta<typeof OrdersView>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = { args: { state: sampleStates.loading } };
export const Empty: Story = { args: { state: sampleStates.empty } };
export const ReadyAsAdmin: Story = { name: "Ready (admin)" };
export const ReadyAsAgent: Story = {
  name: "Ready (agent — refunds forbidden)",
  args: { state: sampleStates.readyAsAgent },
};
export const InFlight: Story = { name: "Cancel in flight", args: { state: sampleStates.inFlight } };
export const ErrorNotice: Story = { args: { state: sampleStates.withErrorNotice } };
export const LoadFailed: Story = { args: { state: sampleStates.loadFailed } };

export const Responsive: Story = {
  name: "Responsive (sm · md · lg)",
  render: (args) => (
    <ResponsivePreview breakpoints={["sm", "md", "lg"]}>
      <OrdersView {...args} />
    </ResponsivePreview>
  ),
};
