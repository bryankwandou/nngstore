// Pure filter logic for the shop grid. It runs in the browser on rows the
// server prepared, so the full catalog JSON never ships to the client.
import type { CardModel } from "@/components/product/types";

export const sorts = ["popular", "price-asc", "price-desc", "title"] as const;
export type Sort = (typeof sorts)[number];

export const facetKeys = ["category", "subject", "series", "level"] as const;
export type FacetKey = (typeof facetKeys)[number];

export type ShopState = {
  category: string;
  subject: string;
  series: string;
  level: string;
  sort: Sort;
  q: string;
};

export const emptyState: ShopState = {
  category: "",
  subject: "",
  series: "",
  level: "",
  sort: "popular",
  q: "",
};

/** One product as the grid needs it: the card plus the fields filters read. */
export type ShopRow = {
  card: CardModel;
  category: string;
  subject: string;
  series: string;
  level: string;
  price: number;
  rank: number;
  /** English title, used for the A to Z sort so the order is stable in both languages */
  sortTitle: string;
  /** normalized search text in both languages */
  hay: string;
};

export type Option = { id: string; label: string; group?: string };

export type ShopOptions = {
  category: Option[];
  subject: Option[];
  series: Option[];
  level: Option[];
};

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Reads a query string, keeping only values that exist in the catalog. */
export function parseState(search: string, options: ShopOptions): ShopState {
  const params = new URLSearchParams(search);
  const pick = (key: FacetKey) => {
    const v = params.get(key) ?? "";
    return options[key].some((o) => o.id === v) ? v : "";
  };
  const sortRaw = params.get("sort") ?? "";
  const state: ShopState = {
    category: pick("category"),
    subject: pick("subject"),
    series: pick("series"),
    level: pick("level"),
    sort: (sorts as readonly string[]).includes(sortRaw) ? (sortRaw as Sort) : "popular",
    q: (params.get("q") ?? "").slice(0, 80),
  };
  // A subject outside the chosen category can never match; drop the subject.
  if (state.category && state.subject) {
    const sub = options.subject.find((o) => o.id === state.subject);
    if (sub && sub.group !== state.category) state.subject = "";
  }
  return state;
}

/** The query string for a state, defaults left out, keys in a fixed order. */
export function serializeState(s: ShopState): string {
  const params = new URLSearchParams();
  for (const key of facetKeys) if (s[key]) params.set(key, s[key]);
  if (s.sort !== "popular") params.set("sort", s.sort);
  if (s.q.trim()) params.set("q", s.q);
  return params.toString();
}

export function hasFilters(s: ShopState): boolean {
  return Boolean(s.category || s.subject || s.series || s.level || s.q.trim());
}

function words(q: string): string[] {
  const n = normalize(q.trim());
  return n ? n.split(/\s+/) : [];
}

function matches(row: ShopRow, s: ShopState, w: string[], skip?: FacetKey): boolean {
  for (const key of facetKeys) {
    if (key === skip) continue;
    if (s[key] && row[key] !== s[key]) return false;
  }
  return w.every((x) => row.hay.includes(x));
}

export function applyFilters(rows: ShopRow[], s: ShopState): ShopRow[] {
  const w = words(s.q);
  const list = rows.filter((r) => matches(r, s, w));
  return list.sort((a, b) => {
    if (s.sort === "price-asc") return a.price - b.price || a.rank - b.rank;
    if (s.sort === "price-desc") return b.price - a.price || a.rank - b.rank;
    if (s.sort === "title") return a.sortTitle.localeCompare(b.sortTitle);
    return a.rank - b.rank || a.sortTitle.localeCompare(b.sortTitle);
  });
}

/**
 * How many results each option would give, with every other filter applied.
 * The facet's own choice is ignored, so switching inside a group shows real numbers.
 */
export function facetCounts(rows: ShopRow[], s: ShopState): Record<FacetKey, Map<string, number>> {
  const w = words(s.q);
  const out = {} as Record<FacetKey, Map<string, number>>;
  for (const key of facetKeys) {
    const m = new Map<string, number>();
    let total = 0;
    for (const r of rows) {
      if (!matches(r, s, w, key)) continue;
      total += 1;
      m.set(r[key], (m.get(r[key]) ?? 0) + 1);
    }
    m.set("", total);
    out[key] = m;
  }
  return out;
}
