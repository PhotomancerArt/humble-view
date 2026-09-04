import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatusBadge } from "../status/StatusBadge";
import { type Column, DataTable } from "./DataTable";

type Row = { id: string; customer: string; total: string; status: "pending" | "shipped" };

const rows: Row[] = [
  { id: "1042", customer: "Radia", total: "$120.00", status: "pending" },
  { id: "1043", customer: "Ada", total: "$64.50", status: "shipped" },
];

const columns: Column<Row>[] = [
  { key: "id", header: "Order", cell: (r) => <span className="font-mono">#{r.id}</span> },
  { key: "customer", header: "Customer", cell: (r) => r.customer },
  { key: "total", header: "Total", className: "text-right", cell: (r) => r.total },
  {
    key: "status",
    header: "Status",
    cell: (r) => (
      <StatusBadge tone={r.status === "shipped" ? "info" : "neutral"}>{r.status}</StatusBadge>
    ),
  },
];

const meta = {
  title: "app/DataTable",
  component: DataTable<Row>,
  parameters: { layout: "padded" },
  args: { rows, columns, rowKey: (r: Row) => r.id, rowTestId: (r: Row) => `orders-row-${r.id}` },
} satisfies Meta<typeof DataTable<Row>>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { rows: [], emptyMessage: "No orders yet." },
};
