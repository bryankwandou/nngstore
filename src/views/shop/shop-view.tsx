import type { Metadata } from "next";
import { catalog, getBundle } from "@/data/catalog";
import {
  categoryLabel,
  levelLabel,
  seriesChip,
  seriesLabel,
  storeStats,
  subjectLabel,
  toCardModel,
} from "@/lib/catalog-view";
import { productPath, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { shopCopy } from "@/content/shop";
import { normalize, type ShopOptions, type ShopRow } from "./filters";
import { ShopBrowser, type BundleOffer } from "./shop-browser";

/** Bundles shown above the grid while nothing is filtered: two whole subjects, two whole types. */
const FEATURED_BUNDLES = [
  "bundle-subject-math",
  "bundle-subject-english",
  "bundle-series-pack-1000",
  "bundle-series-hots-pack-100",
];

export function shopMetadata(lang: Lang): Metadata {
  const t = shopCopy(lang);
  const s = storeStats();
  return pageMeta({ lang, bare: "/shop", title: t.metaTitle, description: t.metaDescription(s.products, s.subjects) });
}

export function ShopView({ lang }: { lang: Lang }) {
  const t = shopCopy(lang);
  const stats = storeStats();

  const rows: ShopRow[] = catalog.products.map((p) => ({
    card: toCardModel(p, lang),
    category: p.category,
    subject: p.subject,
    series: p.series,
    level: p.level,
    price: p.priceIdr,
    rank: p.rank,
    sortTitle: p.title.en,
    hay: normalize(
      [
        p.title.en,
        p.title.id,
        subjectLabel(p.subject, "en"),
        subjectLabel(p.subject, "id"),
        seriesLabel(p.series, "en"),
        seriesLabel(p.series, "id"),
        seriesChip(p.series, "en"),
        seriesChip(p.series, "id"),
        p.level,
        p.level === "SD-SMP" ? "smp" : "",
      ].join(" "),
    ),
  }));

  const usedSubjects = new Set(catalog.products.map((p) => p.subject));
  const usedSeries = new Set(catalog.products.map((p) => p.series));
  const usedLevels = [...new Set(catalog.products.map((p) => p.level))];

  const options: ShopOptions = {
    category: catalog.categories.map((c) => ({ id: c.id, label: categoryLabel(c.id, lang) })),
    subject: catalog.subjects
      .filter((s) => usedSubjects.has(s.id))
      .map((s) => ({ id: s.id, label: subjectLabel(s.id, lang), group: s.category })),
    series: catalog.series.filter((s) => usedSeries.has(s.id)).map((s) => ({ id: s.id, label: seriesLabel(s.id, lang) })),
    level: usedLevels.map((l) => ({ id: l, label: t.levels[l] ?? levelLabel(l, lang) })),
  };

  const featured = FEATURED_BUNDLES.map((slug) => getBundle(slug))
    .filter((b) => b !== undefined)
    .map((b) => toCardModel(b, lang));

  const offers: Record<string, BundleOffer> = {};
  for (const b of catalog.bundles) {
    const key = b.subject ? `subject:${b.subject}` : b.series ? `series:${b.series}` : seriesKeyFromSlug(b.slug);
    if (!key || offers[key]) continue;
    offers[key] = {
      slug: b.slug,
      href: productPath(b.slug, lang),
      title: b.title[lang],
      files: b.items.length,
      price: b.priceIdr,
      compareAt: b.compareAtIdr,
      stack: b.images.stack.slice(0, 3),
    };
  }

  return (
    <ShopBrowser
      lang={lang}
      rows={rows}
      options={options}
      featured={featured}
      offers={offers}
      stats={{ files: stats.products, subjects: stats.subjects, series: stats.series }}
    />
  );
}

/** Series bundles carry their series only in the slug ("bundle-series-<id>"). */
function seriesKeyFromSlug(slug: string): string | null {
  const m = /^bundle-series-(.+)$/.exec(slug);
  return m ? `series:${m[1]}` : null;
}
