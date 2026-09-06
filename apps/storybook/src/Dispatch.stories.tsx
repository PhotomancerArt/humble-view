import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, waitFor, within } from "storybook/test";

import { Backend, backendRoutes } from "@humble/backend";
import { seedDemo } from "@humble/backend/testing";
import { links } from "@humble/dashboard/About";
import { App } from "@humble/dashboard/App";
import { provideDispatchApp } from "@humble/dashboard/provideDispatchApp";
import { InlineProgress } from "@humble/ui-app";
import { SystemClock } from "@humble/ux-core";
import { World } from "@humble/ux-core/react";

// The whole app, exactly as Pages serves it: the real composition root over the backend's routes
// answering in-process on a freshly seeded backend. Every render is a new world.
async function dispatchWorld() {
  const backend = Backend({ clock: SystemClock(), carrierLatencyMs: 800 });
  await seedDemo(backend);
  const routes = backendRoutes(backend);
  return provideDispatchApp({ fetch: (path, init) => routes.request(path, init) })();
}

function Dispatch() {
  return (
    <World provider={dispatchWorld} fallback={<InlineProgress label="Booting…" className="m-6" />}>
      {(ctx) => <App ctx={ctx} />}
    </World>
  );
}

const meta = {
  title: "dispatch/Dispatch",
  component: Dispatch,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Dispatch>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TestDeliveringUpdatesOrder: Story = {
  name: "Test: delivering a shipment updates its order",
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByTestId("nav-shipments"));
    await expect(await canvas.findByTestId("shipments-status-shp-1002")).toHaveTextContent(
      "in transit",
    );

    await userEvent.click(canvas.getByTestId("shipments-markDelivered-shp-1002"));
    await waitFor(() =>
      expect(canvas.getByTestId("shipments-status-shp-1002")).toHaveTextContent("delivered"),
    );

    await userEvent.click(canvas.getByTestId("nav-orders"));
    await waitFor(() =>
      expect(canvas.getByTestId("orders-status-ord-1002")).toHaveTextContent("delivered"),
    );
  },
};

export const TestAboutLinksToTheRest: Story = {
  name: "Test: About links to the post, the repo, and Storybook",
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByTestId("about-open"));
    const dialog = await screen.findByTestId("about-dialog");

    for (const link of links) {
      await expect(within(dialog).getByTestId(`about-link-${link.id}`)).toHaveAttribute(
        "href",
        link.href,
      );
    }
    await expect(canvas.getByTestId("footer-link-post")).toHaveAttribute("href", links[0].href);
  },
};
