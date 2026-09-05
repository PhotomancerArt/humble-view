import { InfoIcon, OctagonAlertIcon, XIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button, cn } from "@humble/ui-core";

/** A banner the Ux put in State: an error or a piece of information, dismissable through an op. */
export function Notice(props: {
  tone: "error" | "info";
  children: ReactNode;
  onDismiss?: (() => void) | undefined;
  testId?: string | undefined;
}) {
  const Icon = props.tone === "error" ? OctagonAlertIcon : InfoIcon;
  return (
    <div
      role={props.tone === "error" ? "alert" : "status"}
      data-testid={props.testId}
      data-tone={props.tone}
      className={cn(
        "flex items-center gap-3 rounded-md border px-3 py-2 text-sm",
        props.tone === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-info/30 bg-info/10 text-info",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className="flex-1">{props.children}</span>
      {props.onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-current hover:text-current"
          aria-label="Dismiss"
          onClick={props.onDismiss}
        >
          <XIcon />
        </Button>
      )}
    </div>
  );
}
