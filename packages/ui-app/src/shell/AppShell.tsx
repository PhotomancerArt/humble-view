import type { ReactNode } from "react";

import { TooltipProvider } from "@humble/ui-core";

/** The app frame: a header with the title, a nav slot, and a role slot; then the page. */
export function AppShell(props: {
  title: string;
  nav?: ReactNode;
  roleSlot?: ReactNode;
  children: ReactNode;
}) {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b">
          <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-6">
            <span className="text-base font-semibold tracking-tight">{props.title}</span>
            {props.nav && <nav className="flex items-center gap-1 text-sm">{props.nav}</nav>}
            <div className="ml-auto flex items-center gap-2">{props.roleSlot}</div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">{props.children}</main>
      </div>
    </TooltipProvider>
  );
}
