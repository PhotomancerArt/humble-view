import type { ShipmentStatus } from "@humble/backend";
import {
  ActionBar,
  type Column,
  DataTable,
  InlineProgress,
  ListLayout,
  Notice,
  StatusBadge,
  type StatusTone,
} from "@humble/ui-app";

import type { ShipmentsOp } from "../ux/ShipmentsOp";
import type { ShipmentRow, ShipmentsState } from "../ux/ShipmentsState";

const tone: Record<ShipmentStatus, StatusTone> = {
  ready: "neutral",
  dispatching: "info",
  in_transit: "info",
  delivered: "success",
  failed: "danger",
};

const label: Record<ShipmentStatus, string> = {
  ready: "ready",
  dispatching: "dispatching",
  in_transit: "in transit",
  delivered: "delivered",
  failed: "failed",
};

/** Renders ShipmentsState, dispatches ShipmentsOps, decides nothing. */
export function ShipmentsView(props: {
  state: ShipmentsState;
  dispatch: (op: ShipmentsOp) => Promise<unknown>;
}) {
  const { state, dispatch } = props;

  const columns: Column<ShipmentRow>[] = [
    { key: "id", header: "Shipment", cell: (row) => <span className="font-mono">{row.id}</span> },
    {
      key: "order",
      header: "Order",
      cell: (row) => <span className="font-mono">{row.orderId}</span>,
    },
    { key: "carrier", header: "Carrier", cell: (row) => row.carrier },
    {
      key: "status",
      header: "Status",
      cell: (row) =>
        row.status === "dispatching" ? (
          <InlineProgress label="Dispatching…" />
        ) : (
          <StatusBadge tone={tone[row.status]} testId={`shipments-status-${row.id}`}>
            {label[row.status]}
          </StatusBadge>
        ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end">
          <ActionBar
            actions={row.actions}
            onDispatch={dispatch}
            testIdFor={(op) => `shipments-${op.kind}-${row.id}`}
          />
        </div>
      ),
    },
  ];

  return (
    <ListLayout
      title="Shipments"
      description="Hand ready shipments to the carrier; confirm delivery."
    >
      {state.notice && (
        <Notice
          tone={state.notice.tone}
          onDismiss={() => void dispatch({ kind: "dismissNotice" })}
          testId="shipments-notice"
        >
          {state.notice.message}
        </Notice>
      )}
      {state.phase === "loading" && state.rows.length === 0 ? (
        <InlineProgress label="Loading shipments…" />
      ) : (
        <DataTable
          rows={state.rows}
          columns={columns}
          rowKey={(row) => row.id}
          rowTestId={(row) => `shipments-row-${row.id}`}
          emptyMessage="No shipments."
        />
      )}
    </ListLayout>
  );
}
