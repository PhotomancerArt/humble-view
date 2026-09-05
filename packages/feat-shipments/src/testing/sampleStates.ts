import { available, disabled, unavailable } from "@humble/ux-core";

import type { ShipmentRow, ShipmentsState } from "../ux/ShipmentsState";

/** Hand-built states for component stories. */

function row(
  id: string,
  orderId: string,
  carrier: string,
  status: ShipmentRow["status"],
): ShipmentRow {
  const dispatch = {
    op: { kind: "dispatch", shipmentId: id } as const,
    label: status === "failed" ? "Retry dispatch" : "Dispatch",
    affordance:
      status === "ready" || status === "failed"
        ? available()
        : status === "dispatching"
          ? disabled("Dispatch in progress", { label: "Dispatching…" })
          : unavailable(),
  };
  const markDelivered = {
    op: { kind: "markDelivered", shipmentId: id } as const,
    label: "Mark delivered",
    affordance: status === "in_transit" ? available() : unavailable(),
  };
  return { id, orderId, carrier, status, actions: [dispatch, markDelivered] };
}

const rows: ShipmentRow[] = [
  row("shp-1001", "ord-1001", "Northwind Freight", "ready"),
  row("shp-1002", "ord-1002", "Pelican Post", "in_transit"),
  row("shp-1003", "ord-1003", "Northwind Freight", "delivered"),
  row("shp-1004", "ord-1005", "Pelican Post", "failed"),
];

export const sampleStates = {
  loading: { phase: "loading", rows: [] } satisfies ShipmentsState,
  empty: { phase: "ready", rows: [] } satisfies ShipmentsState,
  ready: { phase: "ready", rows } satisfies ShipmentsState,
  dispatching: {
    phase: "ready",
    rows: rows.map((r, i) => (i === 0 ? row(r.id, r.orderId, r.carrier, "dispatching") : r)),
  } satisfies ShipmentsState,
  carrierFailed: {
    phase: "ready",
    rows,
    notice: { tone: "error", message: "Pelican Post refused shipment shp-1004" },
  } satisfies ShipmentsState,
};
