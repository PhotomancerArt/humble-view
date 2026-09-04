import type { ReactNode } from "react";

/** The detail page shape: a title, a row of metadata, and titled sections. */
export function DetailLayout(props: {
  title: string;
  meta?: Array<{ label: string; value: ReactNode }>;
  sections: Array<{ title: string; content: ReactNode }>;
}) {
  return (
    <article className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{props.title}</h1>
        {props.meta && props.meta.length > 0 && (
          <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
            {props.meta.map((item) => (
              <div key={item.label} className="flex gap-2">
                <dt className="text-muted-foreground">{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      {props.sections.map((section) => (
        <section key={section.title} className="grid gap-2">
          <h2 className="text-lg font-semibold">{section.title}</h2>
          {section.content}
        </section>
      ))}
    </article>
  );
}
