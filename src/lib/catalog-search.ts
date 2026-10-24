/**
 * The shape of the browser catalog index and the search over it. No React and no
 * "use client", so the route that builds /search-index.json can share it.
 */
export type IndexEntry = {
  /** slug */
  s: string;
  /** kind */
  k: "product" | "bundle";
  /** title per language */
  t: { en: string; id: string };
  /** one-line meta per language, e.g. "Answer key · 1,000 questions · SD" */
  m: { en: string; id: string };
  /** price in rupiah */
  p: number;
  /** compare-at price for bundles */
  ca?: number;
  /** cover image */
  c: string;
  /** bundle members (slugs) */
  i?: string[];
  /** lowercase, accent-free search text in both languages */
  h: string;
};

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9぀-ヿ一-鿿가-힯]+/g, " ")
    .trim();
}

/** Every word of the query must appear somewhere; titles that start with the query rank first. */
export function searchIndex(entries: IndexEntry[], query: string, lang: "en" | "id", limit = 8) {
  const q = normalize(query);
  if (!q) return [];
  const words = q.split(" ");
  const scored: { e: IndexEntry; score: number }[] = [];
  for (const e of entries) {
    if (!words.every((w) => e.h.includes(w))) continue;
    const title = normalize(e.t[lang]);
    let score = 0;
    if (title.startsWith(q)) score += 6;
    else if (title.includes(q)) score += 3;
    if (e.k === "bundle") score += 1;
    score -= title.length / 400;
    scored.push({ e, score });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((x) => x.e);
}
