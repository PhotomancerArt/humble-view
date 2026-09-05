import type { Shipment } from "@humble/backend";
import type { DispatchEvent } from "@humble/app-core";
import {
  available,
  type DispatchResult,
  disabled,
  type EventBus,
  unavailable,
  type Ux,
  UxStore,
} from "@humble/ux-core";

import type { ShipmentService } from "../service/ShipmentService";
import type { ShipmentsOp } from "./ShipmentsOp";
import type { ShipmentRow, ShipmentsAction, ShipmentsState } from "./ShipmentsState";

export type ShipmentsUxCtx = {
  shipmentService: ShipmentService;
  events: EventBus<DispatchEvent>;
};

/**
 * The shipments feature's logic: dispatch is async and can fail at the carrier; a delivered
 * shipment is announced on the bus so the orders feature can react without either importing the
 * other. Framework-free.
 */
export function ShipmentsUx(ctx: ShipmentsUxCtx): Ux<ShipmentsState, ShipmentsOp> {
  const { shipmentService, events } = ctx;
  const store = UxStore<ShipmentsState>({ phase: "loading", rows: [] });

  let shipments: Shipment[] = [];
  let phase: ShipmentsState["phase"] = "loading";
  let notice: ShipmentsState["notice"];
  const inFlight = new Map<string, "dispatch" | "markDelivered">();

  function publish() {
    const rows = shipments.map(toRow);
    store.setState(notice ? { phase, rows, notice } : { phase, rows });
  }

  function toRow(shipment: Shipment): ShipmentRow {
    return {
      id: shipment.id,
      orderId: shipment.orderId,
      carrier: shipment.carrier,
      status: shipment.status,
      actions: [dispatchAction(shipment), deliveredAction(shipment)],
    };
  }

  function dispatchAction(shipment: Shipment): ShipmentsAction {
    const base = { op: { kind: "dispatch", shipmentId: shipment.id } as const, label: "Dispatch" };
    if (inFlight.get(shipment.id) === "dispatch") {
      return { ...base, affordance: disabled("Dispatch in progress", { label: "Dispatching…" }) };
    }
    if (shipment.status === "ready") return { ...base, affordance: available() };
    if (shipment.status === "failed")
      return { ...base, label: "Retry dispatch", affordance: available() };
    if (shipment.status === "dispatching") {
      return { ...base, affordance: disabled("Dispatch in progress", { label: "Dispatching…" }) };
    }
    return { ...base, affordance: unavailable() };
  }

  function deliveredAction(shipment: Shipment): ShipmentsAction {
    const base = {
      op: { kind: "markDelivered", shipmentId: shipment.id } as const,
      label: "Mark delivered",
    };
    if (inFlight.get(shipment.id) === "markDelivered") {
      return { ...base, affordance: disabled("Delivering", { label: "Delivering…" }) };
    }
    if (shipment.status === "in_transit") return { ...base, affordance: available() };
    return { ...base, affordance: unavailable() };
  }

  async function load(): Promise<DispatchResult> {
    phase = "loading";
    publish();
    try {
      shipments = await shipmentService.list();
      phase = "ready";
      publish();
      return { ok: true };
    } catch (error) {
      phase = "error";
      notice = { tone: "error", message: `Could not load shipments: ${describe(error)}` };
      publish();
      return { ok: false, reason: "failed", message: describe(error) };
    }
  }

  async function refetch(shipmentId: string) {
    const fresh = await shipmentService.get(shipmentId);
    shipments = fresh
      ? shipments.map((s) => (s.id === shipmentId ? fresh : s))
      : shipments.filter((s) => s.id !== shipmentId);
    publish();
  }

  async function mutate(
    op: Extract<ShipmentsOp, { kind: "dispatch" | "markDelivered" }>,
  ): Promise<DispatchResult> {
    const row = store.getState().rows.find((r) => r.id === op.shipmentId);
    const action = row?.actions.find((a) => a.op.kind === op.kind);
    const affordance = action?.affordance ?? unavailable();
    if (affordance.status !== "available") {
      const message = "reason" in affordance ? affordance.reason : "Not applicable";
      return { ok: false, reason: affordance.status, message };
    }

    inFlight.set(op.shipmentId, op.kind);
    publish();
    try {
      const result = await (op.kind === "dispatch"
        ? shipmentService.dispatch(op.shipmentId)
        : shipmentService.markDelivered(op.shipmentId));
      inFlight.delete(op.shipmentId);
      if (result.ok) {
        shipments = shipments.map((s) => (s.id === result.value.id ? result.value : s));
        publish();
        events.publish({
          type: op.kind === "dispatch" ? "shipment.dispatched" : "shipment.delivered",
          orderId: result.value.orderId,
        });
        return { ok: true };
      }
      notice = { tone: "error", message: result.error.message };
      await refetch(op.shipmentId);
      return {
        ok: false,
        reason: result.error.code === "forbidden" ? "forbidden" : "failed",
        message: result.error.message,
      };
    } catch (error) {
      inFlight.delete(op.shipmentId);
      notice = { tone: "error", message: describe(error) };
      publish();
      return { ok: false, reason: "failed", message: describe(error) };
    }
  }

  return {
    getState: store.getState,
    subscribe: store.subscribe,
    dispatch: (op) => {
      switch (op.kind) {
        case "load":
          return load();
        case "dispatch":
        case "markDelivered":
          return mutate(op);
        case "dismissNotice":
          notice = undefined;
          publish();
          return Promise.resolve({ ok: true });
      }
    },
    dispose: () => undefined,
  };
}

export type ShipmentsUx = ReturnType<typeof ShipmentsUx>;

function describe(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
