// Turns catalog records into the words and card models pages draw.
import { catalog, getProduct, type Item, type Product } from "@/data/catalog";
import type { CardModel } from "@/components/product/types";
import { productPath, type Lang } from "@/lib/i18n";
import { formatCount } from "@/lib/format";

const seriesTitle = new Map(catalog.series.map((s) => [s.id, s.title]));
const subjectTitle = new Map(catalog.subjects.map((s) => [s.id, s.title]));
const categoryTitle = new Map(catalog.categories.map((c) => [c.id, c.title]));

/** Short chip text for a series, shown on top of a cover. */
const chips: Record<string, { en: string; id: string }> = {
  "worksheet-1000": { en: "Worksheet", id: "Latihan" },
  "answer-key-1000": { en: "Answer key", id: "Kunci" },
  "pack-1000": { en: "Pack + key", id: "Paket + kunci" },
  "mc-practice-100": { en: "Multiple choice", id: "Pilihan ganda" },
  "mc-key-100": { en: "MC key", id: "Kunci PG" },
  "mc-pack-100": { en: "MC pack", id: "Paket PG" },
  "hots-practice-100": { en: "HOTS", id: "HOTS" },
  "hots-key-100": { en: "HOTS key", id: "Kunci HOTS" },
  "hots-pack-100": { en: "HOTS pack", id: "Paket HOTS" },
  "assessment-100": { en: "Assessment", id: "Asesmen" },
  "exam-script-100": { en: "Exam", id: "Ujian" },
  "key-explained-100": { en: "Explained key", id: "Pembahasan" },
  "key-exam-100": { en: "Exam key", id: "Kunci ujian" },
  "pack-exam-100": { en: "Exam pack", id: "Paket ujian" },
};

export function seriesLabel(id: string, lang: Lang): string {
  return seriesTitle.get(id)?.[lang] ?? id;
}

export function seriesChip(id: string, lang: Lang): string {
  return chips[id]?.[lang] ?? seriesLabel(id, lang);
}

export function subjectLabel(id: string, lang: Lang): string {
  return subjectTitle.get(id)?.[lang] ?? id;
}

export function categoryLabel(id: string, lang: Lang): string {
  return categoryTitle.get(id as never)?.[lang] ?? id;
}

export function levelLabel(level: string, lang: Lang): string {
  if (level === "SD-SMP") return lang === "id" ? "SD-SMP" : "SD to SMP";
  return level;
}

export function metaLine(item: Item, lang: Lang): string {
  if (item.kind === "bundle") {
    return lang === "id" ? `${item.items.length} file PDF` : `${item.items.length} PDF files`;
  }
  const q = lang === "id" ? `${formatCount(item.questions, lang)} soal` : `${formatCount(item.questions, lang)} questions`;
  return `${seriesChip(item.series, lang)} · ${q} · ${levelLabel(item.level, lang)}`;
}

export function toCardModel(item: Item, lang: Lang): CardModel {
  if (item.kind === "bundle") {
    return {
      slug: item.slug,
      kind: "bundle",
      href: productPath(item.slug, lang),
      title: item.title[lang],
      meta: metaLine(item, lang),
      chip: lang === "id" ? "Paket" : "Bundle",
      price: item.priceIdr,
      compareAt: item.compareAtIdr,
      cover: item.images.stack[0] ?? "",
      stack: item.images.stack,
      count: item.items.length,
    };
  }
  return {
    slug: item.slug,
    kind: "product",
    href: productPath(item.slug, lang),
    title: item.title[lang],
    meta: metaLine(item, lang),
    chip: seriesChip(item.series, lang),
    price: item.priceIdr,
    cover: item.images.cover,
    hoverPage: item.images.previews[1],
  };
}

export function storeStats() {
  const p = catalog.products;
  return {
    products: p.length,
    bundles: catalog.bundles.length,
    subjects: new Set(p.map((x) => x.subject)).size,
    series: new Set(p.map((x) => x.series)).size,
    questions: p.reduce((s, x) => s + x.questions, 0),
    pages: p.reduce((s, x) => s + x.pages, 0),
  };
}

/** Products named by slug, in order, skipping unknown slugs. */
export function productsBySlug(slugs: string[]): Product[] {
  return slugs.map((s) => getProduct(s)).filter((x): x is Product => Boolean(x));
}
