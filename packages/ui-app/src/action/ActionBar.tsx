import type { Action } from "@humble/ux-core";

import { ActionButton } from "./ActionButton";

/** A row of ActionButtons. Test ids are `<prefix>-<op.kind>`. */
export function ActionBar<Op extends { kind: string }>(props: {
  actions: Action<Op>[];
  onDispatch: (op: Op) => void | Promise<unknown>;
  testIdPrefix?: string | undefined;
  size?: "sm" | "md" | undefined;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {props.actions.map((action) => (
        <ActionButton
          key={action.op.kind}
          action={action}
          onDispatch={props.onDispatch}
          size={props.size ?? "sm"}
          testId={props.testIdPrefix ? `${props.testIdPrefix}-${action.op.kind}` : undefined}
        />
      ))}
    </div>
  );
}
