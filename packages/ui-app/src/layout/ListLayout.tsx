import type { ReactNode } from "react";

/** The list page shape: a title row with a toolbar, then the content. */
export function ListLayout(props: {
  title: string;
  description?: string | undefined;
  toolbar?: ReactNode | undefined;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{props.title}</h1>
          {props.description && (
            <p className="mt-1 text-sm text-muted-foreground">{props.description}</p>
          )}
        </div>
        {props.toolbar && <div className="flex items-center gap-2">{props.toolbar}</div>}
      </div>
      {props.children}
    </section>
  );
}
