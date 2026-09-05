import { LockIcon } from "lucide-react";
import { useState } from "react";

import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@humble/ui-core";
import type { Action } from "@humble/ux-core";

import { InlineProgress } from "../progress/InlineProgress";
import { ConfirmDialog } from "./ConfirmDialog";

/**
 * An Action, rendered. This is where the default surface decides how each affordance looks:
 *
 * - `available`: an enabled button (destructive variant when the action says so).
 * - `disabled`: a disabled button; the reason on hover and in `aria-description`; in-flight
 *   progress replaces the label.
 * - `forbidden`: a disabled button with a lock and the reason — the user learns what they lack.
 * - `unavailable`: nothing. The op does not apply, so the surface omits it.
 *
 * `confirm` is presentation: the button opens a ConfirmDialog and dispatches on confirm.
 */
export function ActionButton<Op>(props: {
  action: Action<Op>;
  onDispatch: (op: Op) => void | Promise<unknown>;
  size?: "sm" | "md" | undefined;
  testId?: string | undefined;
}) {
  const { action } = props;
  const [confirming, setConfirming] = useState(false);
  const { affordance } = action;

  if (affordance.status === "unavailable") return null;

  const size = props.size === "md" ? "default" : "sm";
  const variant = action.destructive ? "destructive" : "outline";
  const dispatch = () => void props.onDispatch(action.op);

  if (affordance.status === "available") {
    return (
      <>
        <Button
          variant={variant}
          size={size}
          data-testid={props.testId}
          data-affordance="available"
          onClick={action.confirm ? () => setConfirming(true) : dispatch}
        >
          {action.label}
        </Button>
        {action.confirm && (
          <ConfirmDialog
            open={confirming}
            onOpenChange={setConfirming}
            title={action.confirm.title}
            body={action.confirm.body}
            confirmLabel={action.confirm.confirmLabel}
            destructive={action.destructive ?? false}
            onConfirm={dispatch}
            testId={props.testId ? `${props.testId}-confirm` : undefined}
          />
        )}
      </>
    );
  }

  const progress = affordance.status === "disabled" ? affordance.progress : undefined;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex" tabIndex={0}>
          <Button
            variant={variant}
            size={size}
            disabled
            aria-disabled
            aria-description={affordance.reason}
            data-testid={props.testId}
            data-affordance={affordance.status}
            className="pointer-events-none"
          >
            {affordance.status === "forbidden" && <LockIcon aria-hidden />}
            {progress ? (
              <InlineProgress label={progress.label} className="text-inherit" />
            ) : (
              action.label
            )}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{affordance.reason}</TooltipContent>
    </Tooltip>
  );
}
