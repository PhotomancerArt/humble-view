import type { ReactNode } from "react";

/** One record as a card: a title, a subtitle, labelled fields, and an actions slot. */
export function RecordCard(props: {
  title: ReactNode;
  subtitle?: ReactNode;
  fields: Array<{ label: string; value: ReactNode }>;
  actions?: ReactNode;
  testId?: string;
}) {
  return (
    <div
      className="grid gap-3 rounded-lg border bg-card p-4 text-card-foreground"
      data-testid={props.testId}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-medium">{props.title}</div>
          {props.subtitle && <div className="text-sm text-muted-foreground">{props.subtitle}</div>}
        </div>
        {props.actions}
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {props.fields.map((field) => (
          <div key={field.label} className="contents">
            <dt className="text-muted-foreground">{field.label}</dt>
            <dd>{field.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
