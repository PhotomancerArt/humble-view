import type { ReactNode } from "react";

import { cn } from "../lib/cn";

type NamedBreakpoint = "sm" | "md" | "lg" | "xl";
/** `sm`, `lg-dark`, `400`, `400-dark`: a named or pixel width, optionally in the dark theme. */
export type Breakpoint =
  NamedBreakpoint | `${NamedBreakpoint}-dark` | number | `${number}` | `${number}-dark`;

const namedWidths: Record<NamedBreakpoint, number> = { sm: 320, md: 480, lg: 768, xl: 1024 };
const namedLabels: Record<NamedBreakpoint, string> = {
  sm: "Small",
  md: "Medium",
  lg: "Large",
  xl: "XL",
};

export const defaultBreakpoints: Breakpoint[] = ["sm", "md", "lg", "sm-dark", "md-dark", "lg-dark"];

function parse(breakpoint: Breakpoint): { width: number; label: string; dark: boolean } {
  const text = String(breakpoint);
  const dark = text.endsWith("-dark");
  const base = dark ? text.slice(0, -"-dark".length) : text;
  const width = base in namedWidths ? namedWidths[base as NamedBreakpoint] : Number(base);
  const name =
    base in namedLabels ? `${namedLabels[base as NamedBreakpoint]} (${width}px)` : `${width}px`;
  return { width, label: dark ? `${name} · dark` : name, dark };
}

/**
 * Renders its children once per breakpoint, side by side, in light and dark, each inside a
 * container-query frame. For stories: one story shows how a screen behaves at every width.
 */
export function ResponsivePreview(props: {
  breakpoints?: Breakpoint[] | undefined;
  children: ReactNode | ((breakpoint: string) => ReactNode);
}) {
  const breakpoints = props.breakpoints ?? defaultBreakpoints;
  return (
    <div className="flex flex-wrap items-start gap-4">
      {breakpoints.map((breakpoint) => {
        const { width, label, dark } = parse(breakpoint);
        const testId = `container-${width}px${dark ? "-dark" : ""}`;
        return (
          <div
            key={String(breakpoint)}
            className={cn(
              "@container box-content rounded border-8 border-border",
              dark && "dark bg-background text-foreground",
            )}
            style={{ width }}
            data-testid={testId}
          >
            <div className="border-b-8 border-border bg-muted px-2 py-1 text-xs font-semibold text-foreground">
              {label}
            </div>
            <div className="overflow-x-auto bg-background text-foreground">
              {typeof props.children === "function"
                ? props.children(String(breakpoint))
                : props.children}
            </div>
          </div>
        );
      })}
    </div>
  );
}
