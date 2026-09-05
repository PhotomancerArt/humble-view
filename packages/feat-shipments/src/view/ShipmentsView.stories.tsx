import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { ResponsivePreview } from "@humble/ui-core";

import { sampleStates } from "../testing/sampleStates";
import { ShipmentsView } from "./ShipmentsView";

const meta = {
  title: "shipments/ShipmentsView",
  component: ShipmentsView,
  parameters: { layout: "padded" },
  args: { dispatch: fn(), state: sampleStates.ready },
} satisfies Meta<typeof ShipmentsView>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = { args: { state: sampleStates.loading } };
export const Empty: Story = { args: { state: sampleStates.empty } };
export const Ready: Story = {};
export const Dispatching: Story = { args: { state: sampleStates.dispatching } };
export const CarrierFailed: Story = {
  name: "Carrier failed (notice + retry)",
  args: { state: sampleStates.carrierFailed },
};
export const Responsive: Story = {
  name: "Responsive (sm · md · lg)",
  render: (args) => (
    <ResponsivePreview breakpoints={["sm", "md", "lg"]}>
      <ShipmentsView {...args} />
    </ResponsivePreview>
  ),
};
