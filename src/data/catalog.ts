// Typed access to the catalog built by scripts/catalog/build_catalog.py.
// Every count, price and title on the site comes from here.
import data from "./catalog.json";
import heldData from "./held.json";

export type Localized = { en: string; id: string };
export type Level = "SD" | "SD-SMP";
export type CategoryId = "religion" | "languages" | "science" | "civics";

export type Series = { id: string; title: Localized; blurb: Localized; contains: string[] };
export type Subject = { id: string; title: Localized; category: CategoryId };
export type Category = { id: CategoryId; title: Localized };

export type Product = {
  id: string;
  slug: string;
  kind: "product";
  sourceFile: string;
  series: string;
  subject: string;
  category: CategoryId;
  level: Level;
  questions: number;
  pages: number;
  bytes: number;
  contains: string[];
  title: Localized;
  short: Localized;
  description: Localized;
  priceIdr: number;
  rank: number;
  previewSharp: number;
  images: { cover: string; previews: string[] };
};

export type Bundle = {
  id: string;
  slug: string;
  kind: "bundle";
  title: Localized;
  short: Localized;
  description: Localized;
  items: string[];
  priceIdr: number;
  compareAtIdr: number;
  subject?: string;
  series?: string;
  category?: CategoryId;
  images: { stack: string[] };
};

export type Item = Product | Bundle;

type CatalogData = {
  generatedAt: string;
  series: Series[];
  subjects: Subject[];
  categories: Category[];
  products: Product[];
  bundles: Bundle[];
};

const raw = data as unknown as CatalogData;

// Files held from sale (see held.json). They vanish from every list, bundle,
// checkout and reader route. Bundles are repriced at their original discount.
const held = new Set(heldData.slugs);
const products = raw.products.filter((p) => !held.has(p.slug));
const priceOf = new Map(products.map((p) => [p.slug, p.priceIdr]));
const bundles = raw.bundles.flatMap((b) => {
  const items = b.items.filter((s) => !held.has(s));
  if (items.length === b.items.length) return [b];
  if (items.length < 2) return [];
  const compareAtIdr = items.reduce((sum, s) => sum + (priceOf.get(s) ?? 0), 0);
  const priceIdr = Math.round((compareAtIdr * b.priceIdr) / b.compareAtIdr / 1000) * 1000;
  const stack = b.images.stack.filter((src) => ![...held].some((s) => src.endsWith(`/${s}.webp`)));
  return [{ ...b, items, compareAtIdr, priceIdr, images: { stack: stack.length ? stack : b.images.stack } }];
});
const liveSeries = new Set(products.map((p) => p.series));

export const catalog: CatalogData = {
  ...raw,
  series: raw.series.filter((s) => liveSeries.has(s.id)),
  products,
  bundles,
};

const bySlug = new Map<string, Item>();
for (const p of catalog.products) bySlug.set(p.slug, p);
for (const b of catalog.bundles) bySlug.set(b.slug, b);

export function getItem(slug: string): Item | undefined {
  return bySlug.get(slug);
}

export function getProduct(slug: string): Product | undefined {
  const it = bySlug.get(slug);
  return it?.kind === "product" ? it : undefined;
}

export function getBundle(slug: string): Bundle | undefined {
  const it = bySlug.get(slug);
  return it?.kind === "bundle" ? it : undefined;
}

/** Product slugs an order grants: a bundle expands to its files. */
export function expandSlugs(slugs: string[]): string[] {
  const out = new Set<string>();
  for (const s of slugs) {
    const it = bySlug.get(s);
    if (!it) continue;
    if (it.kind === "bundle") it.items.forEach((x) => out.add(x));
    else out.add(it.slug);
  }
  return [...out];
}

export type ProductFilters = {
  category?: string;
  subject?: string;
  series?: string;
  level?: string;
  q?: string;
  sort?: "popular" | "price-asc" | "price-desc" | "title";
};

export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function listProducts(f: ProductFilters = {}): Product[] {
  const q = f.q ? normalizeText(f.q.trim()) : "";
  const words = q ? q.split(/\s+/) : [];
  const list = catalog.products.filter((p) => {
    if (f.category && p.category !== f.category) return false;
    if (f.subject && p.subject !== f.subject) return false;
    if (f.series && p.series !== f.series) return false;
    if (f.level && p.level !== f.level) return false;
    if (words.length) {
      const hay = normalizeText(`${p.title.en} ${p.title.id} ${p.subject} ${p.series} ${p.level}`);
      if (!words.every((w) => hay.includes(w))) return false;
    }
    return true;
  });
  const sort = f.sort ?? "popular";
  return list.sort((a, b) => {
    if (sort === "price-asc") return a.priceIdr - b.priceIdr || a.rank - b.rank;
    if (sort === "price-desc") return b.priceIdr - a.priceIdr || a.rank - b.rank;
    if (sort === "title") return a.title.en.localeCompare(b.title.en);
    return a.rank - b.rank || a.title.en.localeCompare(b.title.en);
  });
}

export function bundlesContaining(slug: string): Bundle[] {
  return catalog.bundles.filter((b) => b.items.includes(slug));
}

/** Same subject first, then the same series in other subjects. */
export function relatedProducts(slug: string, n = 4): Product[] {
  const p = getProduct(slug);
  if (!p) return [];
  const same = catalog.products.filter((x) => x.slug !== slug && x.subject === p.subject);
  const series = catalog.products.filter((x) => x.slug !== slug && x.series === p.series && x.subject !== p.subject);
  return [...same, ...series].sort((a, b) => a.rank - b.rank).slice(0, n);
}

export function bundleSum(b: Bundle): number {
  return b.items.reduce((sum, s) => sum + (getProduct(s)?.priceIdr ?? 0), 0);
}
