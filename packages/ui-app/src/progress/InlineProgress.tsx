import { Loader2Icon } from "lucide-react";

import { cn } from "@humble/ui-core";

/** A spinner with a label, for progress that belongs inline: inside a button or a table cell. */
export function InlineProgress(props: { label: string; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-muted-foreground", props.className)}
      role="status"
    >
      <Loader2Icon className="size-4 animate-spin" aria-hidden />
      {props.label}
    </span>
  );
}
