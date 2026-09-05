import { useSyncExternalStore } from "react";

export type Route = "orders" | "shipments";

function read(): Route {
  return window.location.hash === "#/shipments" ? "shipments" : "orders";
}

function subscribe(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}

/** Two pages need no router: the hash is the route. */
export function useHashRoute(): Route {
  return useSyncExternalStore(subscribe, read, () => "orders");
}
