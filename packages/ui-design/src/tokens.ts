/** TypeScript mirror of the tokens in theme.css, for stories and docs. Not used at runtime. */
export const colorTokens = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "success",
  "warning",
  "info",
  "border",
  "input",
  "ring",
] as const;

export type ColorToken = (typeof colorTokens)[number];

export const typeScale = [
  { name: "Page title", className: "text-2xl font-semibold tracking-tight" },
  { name: "Section title", className: "text-lg font-semibold" },
  { name: "Body", className: "text-sm" },
  { name: "Body muted", className: "text-sm text-muted-foreground" },
  { name: "Label", className: "text-xs font-medium uppercase tracking-wide text-muted-foreground" },
  { name: "Mono", className: "font-mono text-sm" },
] as const;

export const radiusTokens = ["sm", "md", "lg", "xl"] as const;
