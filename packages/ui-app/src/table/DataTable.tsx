import type { ReactNode } from "react";

import { cn, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@humble/ui-core";

export type Column<Row> = {
  key: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  className?: string;
};

/** A typed table with no sorting, paging, or virtualization. Rows get a test id for play tests. */
export function DataTable<Row>(props: {
  rows: Row[];
  columns: Column<Row>[];
  rowKey: (row: Row) => string;
  rowTestId?: (row: Row) => string;
  emptyMessage?: string;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {props.columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={props.columns.length}
                className="h-20 text-center text-muted-foreground"
              >
                {props.emptyMessage ?? "Nothing here."}
              </TableCell>
            </TableRow>
          ) : (
            props.rows.map((row) => (
              <TableRow key={props.rowKey(row)} data-testid={props.rowTestId?.(row)}>
                {props.columns.map((column) => (
                  <TableCell key={column.key} className={cn(column.className)}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
