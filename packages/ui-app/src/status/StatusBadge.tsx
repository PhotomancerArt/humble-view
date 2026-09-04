import type { ReactNode } from "react";

import { Badge, cn } from "@humble/ui-core";

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

const toneClass: Record<StatusTone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  info: "border-info/30 bg-info/10 text-info",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/40 bg-warning/15 text-warning",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
};

/** A status as a badge. Features map their own statuses onto the five tones. */
export function StatusBadge(props: { tone: StatusTone; children: ReactNode; testId?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("capitalize", toneClass[props.tone])}
      data-testid={props.testId}
      data-tone={props.tone}
    >
      {props.children}
    </Badge>
  );
}
