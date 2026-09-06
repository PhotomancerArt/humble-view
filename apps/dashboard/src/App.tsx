import { OrdersPage } from "@humble/feat-orders";
import { ShipmentsPage } from "@humble/feat-shipments";
import { AppShell } from "@humble/ui-app";
import { Button } from "@humble/ui-core";

import { AboutButton, AboutLinks } from "./About";
import type { DispatchCtx } from "./provideDispatchApp";
import { RoleToggle } from "./RoleToggle";
import { type Route, useHashRoute } from "./useHashRoute";

/** The shell around both pages. Takes the app context explicitly; no ambient anything. */
export function App({ ctx }: { ctx: DispatchCtx }) {
  const route = useHashRoute();

  return (
    <AppShell
      title="Dispatch"
      nav={
        <>
          <NavLink to="orders" current={route}>
            Orders
          </NavLink>
          <NavLink to="shipments" current={route}>
            Shipments
          </NavLink>
        </>
      }
      roleSlot={
        <>
          <RoleToggle auth={ctx.auth} events={ctx.events} />
          <AboutButton />
        </>
      }
      footer={<AboutLinks />}
    >
      {route === "orders" ? (
        <OrdersPage ordersUx={ctx.ordersUx} />
      ) : (
        <ShipmentsPage shipmentsUx={ctx.shipmentsUx} />
      )}
    </AppShell>
  );
}

function NavLink(props: { to: Route; current: Route; children: string }) {
  const active = props.to === props.current;
  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      size="sm"
      data-testid={`nav-${props.to}`}
      aria-current={active ? "page" : undefined}
      onClick={() => {
        window.location.hash = `#/${props.to}`;
      }}
    >
      {props.children}
    </Button>
  );
}
