import { ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";

import type { Role } from "@humble/backend";
import type { AuthService, DispatchEvent } from "@humble/app-core";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@humble/ui-core";
import type { EventBus } from "@humble/ux-core";

/** Dispatch has no login: the role is a switch. Changing it tells every Ux through the bus. */
export function RoleToggle(props: { auth: AuthService; events: EventBus<DispatchEvent> }) {
  const { auth, events } = props;
  const [role, setRole] = useState<Role | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    void auth.current().then((session) => {
      if (!cancelled) setRole(session.role);
    });
    return () => {
      cancelled = true;
    };
  }, [auth]);

  async function choose(next: Role) {
    await auth.setRole(next);
    setRole(next);
    events.publish({ type: "session.changed", role: next });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" data-testid="role-toggle">
          Role: {role ?? "…"}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Act as</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void choose("admin")} data-testid="role-admin">
          Admin
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void choose("agent")} data-testid="role-agent">
          Agent
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
