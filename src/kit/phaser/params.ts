export interface UrlParams {
  /** True when the parameter is present (even if empty). */
  has(name: string): boolean;
  /** Raw string, or `def` when missing or empty. */
  str(name: string, def: string): string;
  /**
   * Whole number. Missing, empty, NaN, fractional or non-numeric -> `def`.
   * Out of range -> clamped to [min, max]. `min` defaults to 0, so negatives are never returned unless min allows them.
   */
  int(name: string, def: number, min?: number, max?: number): number;
  /** Comma-separated list, trimmed, empty items dropped; with `allowed`, unknown items are dropped too. */
  list(name: string, allowed?: readonly string[]): string[];
}

/** Validating reader for the page's query string (test setups like `?seed=7&lives=1`). `search` defaults to `location.search`. */
export function urlParams(search?: string): UrlParams {
  const q = new URLSearchParams(search ?? location.search);
  const raw = (name: string) => {
    const v = q.get(name);
    return v === null || v.trim() === "" ? undefined : v.trim();
  };
  return {
    has: (name) => q.has(name),
    str: (name, def) => raw(name) ?? def,
    int(name, def, min = 0, max = Infinity) {
      const v = raw(name);
      if (v === undefined) return def;
      const n = Number(v);
      if (!Number.isInteger(n)) return def;
      return Math.min(Math.max(n, min), max);
    },
    list(name, allowed) {
      const items = (raw(name) ?? "").split(",").map((s) => s.trim()).filter(Boolean);
      return allowed ? items.filter((s) => allowed.includes(s)) : items;
    },
  };
}
