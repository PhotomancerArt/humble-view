import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

import { provideAgent, provideFakeBackend, provideShipments } from "@humble/app-core/testing";
import { InlineProgress } from "@humble/ui-app";
import { type Clock, provideFakeClock, Providers } from "@humble/ux-core";
import { World } from "@humble/ux-core/react";

import { provideFakeShipmentService } from "../service/provideShipmentService";
import { demoShipments } from "../testing/demoShipments";
import { provideShipmentsUx } from "../ux/provideShipmentsUx";
import { ShipmentsPage } from "./ShipmentsPage";

// Page stories keep carrierLatencyMs at 0: the fake clock never needs advancing from a play test.
const asAgent = Providers(
  provideFakeClock,
  provideFakeBackend(),
  provideAgent,
  provideShipments(demoShipments),
  provideFakeShipmentService,
  provideShipmentsUx,
);

function failingOnce() {
  let attempts = 0;
  return { fail: () => attempts++ === 0 };
}

// A fresh carrier per world: the counter must not leak between renders.
const provideFlakyBackend = (ctx: { clock: Clock }) =>
  provideFakeBackend({ carrier: failingOnce() })(ctx);

const carrierFailure = Providers(
  provideFakeClock,
  provideFlakyBackend,
  provideAgent,
  provideShipments(demoShipments),
  provideFakeShipmentService,
  provideShipmentsUx,
);

function Booted(props: {
  world: () => Promise<{ shipmentsUx: Parameters<typeof ShipmentsPage>[0]["shipmentsUx"] }>;
}) {
  return (
    <World provider={props.world} fallback={<InlineProgress label="Booting world…" />}>
      {({ shipmentsUx }) => <ShipmentsPage shipmentsUx={shipmentsUx} />}
    </World>
  );
}

const meta = {
  title: "shipments/ShipmentsPage",
  component: Booted,
  parameters: { layout: "padded" },
  args: { world: asAgent },
} satisfies Meta<typeof Booted>;
export default meta;

type Story = StoryObj<typeof meta>;

export const AsAgent: Story = { name: "As agent" };
export const CarrierFailure: Story = {
  name: "Carrier failure (first dispatch is refused)",
  args: { world: carrierFailure },
};

export const TestDispatchReadyShipment: Story = {
  name: "Test: dispatch a ready shipment",
  play: async ({ canvas, userEvent }) => {
    await expect(await canvas.findByTestId("shipments-status-shp-1001")).toHaveTextContent("ready");

    await userEvent.click(await canvas.findByTestId("shipments-dispatch-shp-1001"));

    await waitFor(() =>
      expect(canvas.getByTestId("shipments-status-shp-1001")).toHaveTextContent("in transit"),
    );
    await expect(canvas.getByTestId("shipments-markDelivered-shp-1001")).toHaveAttribute(
      "data-affordance",
      "available",
    );
  },
};

export const TestCarrierFailureAllowsRetry: Story = {
  name: "Test: carrier failure shows a notice and allows retry",
  args: { world: carrierFailure },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByTestId("shipments-dispatch-shp-1001"));

    await expect(await canvas.findByTestId("shipments-notice")).toHaveTextContent(
      "refused shipment",
    );
    await waitFor(() =>
      expect(canvas.getByTestId("shipments-status-shp-1001")).toHaveTextContent("failed"),
    );
    const retry = canvas.getByTestId("shipments-dispatch-shp-1001");
    await expect(retry).toHaveTextContent("Retry dispatch");
    await expect(retry).toHaveAttribute("data-affordance", "available");

    await userEvent.click(retry);

    await waitFor(() =>
      expect(canvas.getByTestId("shipments-status-shp-1001")).toHaveTextContent("in transit"),
    );
  },
};
