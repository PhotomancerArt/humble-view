import type { OrderStatus } from "@humble/backend";
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

import type { OrdersOp } from "../ux/OrdersOp";
import type { OrderRow, OrdersState } from "../ux/OrdersState";

const tone: Record<OrderStatus, StatusTone> = {
  pending: "neutral",
  shipped: "info",
  delivered: "success",
  cancelled: "warning",
  refunded: "danger",
};

/** Renders OrdersState, dispatches OrdersOps, decides nothing. */
export function OrdersView(props: {
  state: OrdersState;
  dispatch: (op: OrdersOp) => Promise<unknown>;
}) {
  const { state, dispatch } = props;

  const columns: Column<OrderRow>[] = [
    { key: "id", header: "Order", cell: (row) => <span className="font-mono">{row.id}</span> },
    { key: "customer", header: "Customer", cell: (row) => row.customer },
    { key: "total", header: "Total", className: "text-right", cell: (row) => row.total },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge tone={tone[row.status]} testId={`orders-status-${row.id}`}>
          {row.status}
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
            testIdFor={(op) => `orders-${op.kind}-${row.id}`}
          />
        </div>
      ),
    },
  ];

  return (
    <ListLayout title="Orders" description="Cancel while pending; refund once delivered.">
      {state.notice && (
        <Notice
          tone={state.notice.tone}
          onDismiss={() => void dispatch({ kind: "dismissNotice" })}
          testId="orders-notice"
        >
          {state.notice.message}
        </Notice>
      )}
      {state.phase === "loading" && state.rows.length === 0 ? (
        <InlineProgress label="Loading orders…" />
      ) : (
        <DataTable
          rows={state.rows}
          columns={columns}
          rowKey={(row) => row.id}
          rowTestId={(row) => `orders-row-${row.id}`}
          emptyMessage="No orders."
        />
      )}
    </ListLayout>
  );
}
