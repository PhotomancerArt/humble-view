import { useEffect } from "react";

import { useUx } from "@humble/ux-core/react";

import type { ShipmentsUx } from "../ux/ShipmentsUx";
import { ShipmentsView } from "./ShipmentsView";

/** Where React meets the shipments Ux. */
export function ShipmentsPage({ shipmentsUx }: { shipmentsUx: ShipmentsUx }) {
  const { state, dispatch } = useUx(shipmentsUx);

  useEffect(() => {
    void dispatch({ kind: "load" });
  }, [dispatch]);

  return <ShipmentsView state={state} dispatch={dispatch} />;
}
