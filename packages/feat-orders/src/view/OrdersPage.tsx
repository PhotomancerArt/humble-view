import { useEffect } from "react";

import { useUx } from "@humble/ux-core/react";

import type { OrdersUx } from "../ux/OrdersUx";
import { OrdersView } from "./OrdersView";

/** Where React meets the orders Ux: subscribe, load on mount, hand state and dispatch to the View. */
export function OrdersPage({ ordersUx }: { ordersUx: OrdersUx }) {
  const { state, dispatch } = useUx(ordersUx);

  useEffect(() => {
    void dispatch({ kind: "load" });
  }, [dispatch]);

  return <OrdersView state={state} dispatch={dispatch} />;
}
