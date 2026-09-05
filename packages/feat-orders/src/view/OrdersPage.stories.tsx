import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, waitFor } from "storybook/test";

import {
  provideAdmin,
  provideAgent,
  provideFakeBackend,
  provideOrders,
} from "@humble/app-core/testing";
import { InlineProgress } from "@humble/ui-app";
import { provideFakeClock, Providers } from "@humble/ux-core";
import { World } from "@humble/ux-core/react";

import { provideFakeOrderService } from "../service/provideOrderService";
import { demoOrders } from "../testing/demoOrders";
import { provideOrdersUx } from "../ux/provideOrdersUx";
import { OrdersPage } from "./OrdersPage";

// The same chain the cold-open Ux test uses; only the last link renders.
const asAdmin = Providers(
  provideFakeClock,
  provideFakeBackend(),
  provideAdmin,
  provideOrders(demoOrders),
  provideFakeOrderService,
  provideOrdersUx,
);

const asAgent = Providers(
  provideFakeClock,
  provideFakeBackend(),
  provideAgent,
  provideOrders(demoOrders),
  provideFakeOrderService,
  provideOrdersUx,
);

const cancelRefused = Providers(asAdmin, ({ ordersScript }) => {
  ordersScript.failNext("cancel", {
    code: "invalid_state",
    message: "Order ord-1001 changed on the server; reload and try again",
  });
  return {};
});

function Booted(props: {
  world: () => Promise<{ ordersUx: Parameters<typeof OrdersPage>[0]["ordersUx"] }>;
}) {
  return (
    <World provider={props.world} fallback={<InlineProgress label="Booting world…" />}>
      {({ ordersUx }) => <OrdersPage ordersUx={ordersUx} />}
    </World>
  );
}

const meta = {
  title: "orders/OrdersPage",
  component: Booted,
  parameters: { layout: "padded" },
  args: { world: asAdmin },
} satisfies Meta<typeof Booted>;
export default meta;

type Story = StoryObj<typeof meta>;

export const AsAdmin: Story = { name: "As admin" };
export const AsAgent: Story = { name: "As agent", args: { world: asAgent } };
export const ScriptedFailure: Story = {
  name: "Scripted failure (cancel refused by the server)",
  args: { world: cancelRefused },
};

export const TestCancelPendingOrder: Story = {
  name: "Test: cancel a pending order",
  play: async ({ canvas, userEvent }) => {
    await expect(await canvas.findByTestId("orders-status-ord-1001")).toHaveTextContent("pending");

    await userEvent.click(await canvas.findByTestId("orders-cancel-ord-1001"));
    await userEvent.click(await screen.findByTestId("orders-cancel-ord-1001-confirm-confirm"));

    await waitFor(() =>
      expect(canvas.getByTestId("orders-status-ord-1001")).toHaveTextContent("cancelled"),
    );
    await expect(canvas.getByTestId("orders-cancel-ord-1001")).toHaveAttribute(
      "data-affordance",
      "disabled",
    );
  },
};

export const TestRefundForbiddenForAgents: Story = {
  name: "Test: refund is forbidden for agents",
  args: { world: asAgent },
  play: async ({ canvas }) => {
    const refund = await canvas.findByTestId("orders-refund-ord-1003");

    await expect(refund).toHaveAttribute("data-affordance", "forbidden");
    await expect(refund).toBeDisabled();
    await expect(refund).toHaveAttribute("aria-description", "Admins only");
  },
};

export const TestScriptedFailureShowsNotice: Story = {
  name: "Test: a refused cancel shows a notice",
  args: { world: cancelRefused },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByTestId("orders-cancel-ord-1001"));
    await userEvent.click(await screen.findByTestId("orders-cancel-ord-1001-confirm-confirm"));

    await expect(await canvas.findByTestId("orders-notice")).toHaveTextContent(
      "changed on the server",
    );
    await expect(canvas.getByTestId("orders-status-ord-1001")).toHaveTextContent("pending");
  },
};
