export type ShipmentStatus = "ready" | "dispatching" | "in_transit" | "delivered" | "failed";

export type Shipment = {
  id: string;
  orderId: string;
  carrier: string;
  status: ShipmentStatus;
  updatedAt: number;
};

export type ShipmentInput = {
  orderId: string;
  carrier?: string;
  status?: ShipmentStatus;
};
