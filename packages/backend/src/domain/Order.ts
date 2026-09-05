export type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled" | "refunded";

export type Order = {
  id: string;
  customer: string;
  totalCents: number;
  status: OrderStatus;
  createdAt: number;
};

/** What creates an order. The simulated backend lets fixtures start in any status. */
export type OrderInput = {
  customer: string;
  totalCents: number;
  status?: OrderStatus;
};
