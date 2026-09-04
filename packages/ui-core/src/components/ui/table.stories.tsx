import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "./badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

const rows = [
  { id: "1042", customer: "Radia", total: "$120.00", status: "pending" },
  { id: "1043", customer: "Ada", total: "$64.50", status: "shipped" },
  { id: "1044", customer: "Grace", total: "$310.00", status: "delivered" },
];

function Example() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-mono">#{row.id}</TableCell>
            <TableCell>{row.customer}</TableCell>
            <TableCell>{row.total}</TableCell>
            <TableCell>
              <Badge variant="outline">{row.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const meta = {
  title: "core/Table",
  component: Example,
} satisfies Meta<typeof Example>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
