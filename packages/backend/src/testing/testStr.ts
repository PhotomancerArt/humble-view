const counters = new Map<string, number>();

/** Unique, readable fixture strings: `customer-1`, `customer-2`, … */
export function testStr(prefix: string): string {
  const n = (counters.get(prefix) ?? 0) + 1;
  counters.set(prefix, n);
  return `${prefix}-${n}`;
}
