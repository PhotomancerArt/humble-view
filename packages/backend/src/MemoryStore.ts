import type { Order } from "./domain/Order";
import type { Shipment } from "./domain/Shipment";

/** In-memory tables with sequential ids. One per Backend; nothing is shared between worlds. */
export function MemoryStore() {
  return {
    orders: Table<Order>("ord"),
    shipments: Table<Shipment>("shp"),
  };
}

export type MemoryStore = ReturnType<typeof MemoryStore>;

function Table<Row extends { id: string }>(prefix: string) {
  const rows = new Map<string, Row>();
  let seq = 1000;

  return {
    nextId: () => `${prefix}-${++seq}`,
    list: () => [...rows.values()],
    get: (id: string) => rows.get(id),
    put: (row: Row) => {
      rows.set(row.id, row);
      return row;
    },
  };
}
