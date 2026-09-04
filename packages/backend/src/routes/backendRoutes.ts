import { Hono } from "hono";

import type { Backend } from "../Backend";
import type { BackendError, BackendResult } from "../domain/BackendError";

const statusByCode: Record<BackendError["code"], 403 | 404 | 409 | 502> = {
  not_found: 404,
  forbidden: 403,
  invalid_state: 409,
  carrier_error: 502,
};

/**
 * HTTP in front of the backend. Success returns the row; failure returns the `BackendError` as
 * JSON with a matching status. `backendRoutes(backend).request` is fetch-shaped, so the same
 * routes serve a node server, an in-process contract test, and the in-browser Pages build.
 */
export function backendRoutes(backend: Backend) {
  const app = new Hono();

  const reply = <T>(result: BackendResult<T>) =>
    result.ok
      ? Response.json(result.value)
      : Response.json(result.error, { status: statusByCode[result.error.code] });

  app.get("/orders", async (c) => c.json(await backend.orders.list()));
  app.get("/orders/:id", async (c) => {
    const order = await backend.orders.get(c.req.param("id"));
    return order ? c.json(order) : notFound(`Order ${c.req.param("id")} not found`);
  });
  app.post("/orders/:id/cancel", async (c) =>
    reply(await backend.orders.cancel(c.req.param("id"))),
  );
  app.post("/orders/:id/refund", async (c) =>
    reply(await backend.orders.refund(c.req.param("id"))),
  );

  app.get("/shipments", async (c) => c.json(await backend.shipments.list()));
  app.get("/shipments/:id", async (c) => {
    const shipment = await backend.shipments.get(c.req.param("id"));
    return shipment ? c.json(shipment) : notFound(`Shipment ${c.req.param("id")} not found`);
  });
  app.post("/shipments/:id/dispatch", async (c) =>
    reply(await backend.shipments.dispatch(c.req.param("id"))),
  );
  app.post("/shipments/:id/delivered", async (c) =>
    reply(await backend.shipments.markDelivered(c.req.param("id"))),
  );

  app.get("/session", async (c) => c.json(await backend.session.get()));
  app.put("/session", async (c) => {
    const body = await c.req.json<{ role?: unknown }>();
    if (body.role !== "admin" && body.role !== "agent") {
      return Response.json(
        { code: "invalid_state", message: "role must be admin or agent" },
        { status: 400 },
      );
    }
    await backend.session.setRole(body.role);
    return c.json(await backend.session.get());
  });

  return app;
}

function notFound(message: string) {
  const error: BackendError = { code: "not_found", message };
  return Response.json(error, { status: 404 });
}
