// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { App } from "./App";
import { provideBrowserBackend } from "./provideBrowserBackend";
import { provideDispatchApp } from "./provideDispatchApp";

afterEach(cleanup);

/** The browser composition root, end to end: delivering a shipment delivers its order. */
describe("Dispatch (browser root)", () => {
  test("delivering Ada's shipment marks Ada's order delivered", async () => {
    const { fetch, backend } = await provideBrowserBackend();
    const ctx = await provideDispatchApp({ fetch })();
    window.location.hash = "#/shipments";
    render(<App ctx={ctx} />);

    const orders = await backend.orders.list();
    const ada = orders.find((o) => o.customer === "Ada Lovelace")!;
    const shipment = (await backend.shipments.list()).find((s) => s.orderId === ada.id)!;
    expect(ada.status).toBe("shipped");

    (await screen.findByTestId(`shipments-markDelivered-${shipment.id}`)).click();
    await waitFor(() =>
      expect(screen.getByTestId(`shipments-status-${shipment.id}`).textContent).toBe("delivered"),
    );

    act(() => {
      window.location.hash = "#/orders";
    });

    await waitFor(() =>
      expect(screen.getByTestId(`orders-status-${ada.id}`).textContent).toBe("delivered"),
    );
    expect((await backend.orders.get(ada.id))?.status).toBe("delivered");
  });
});
