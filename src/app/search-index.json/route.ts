import { catalog } from "@/data/catalog";
import { normalize, type IndexEntry } from "@/lib/catalog-search";

/** Built once at build time; the browser caches it like any static file. */
export const dynamic = "force-static";

const qWord = { en: "questions", id: "soal" } as const;
const itemsWord = { en: "files", id: "file" } as const;

export function GET() {
  const seriesTitle = new Map(catalog.series.map((s) => [s.id, s.title]));
  const subjectTitle = new Map(catalog.subjects.map((s) => [s.id, s.title]));

  const products: IndexEntry[] = catalog.products.map((p) => {
    const series = seriesTitle.get(p.series);
    const subject = subjectTitle.get(p.subject);
    const meta = (lang: "en" | "id") =>
      [
        series?.[lang],
        `${p.questions.toLocaleString(lang === "id" ? "id-ID" : "en-US")} ${qWord[lang]}`,
        p.level === "SD" ? "SD" : "SD–SMP",
      ]
        .filter(Boolean)
        .join(" · ");
    return {
      s: p.slug,
      k: "product",
      t: p.title,
      m: { en: meta("en"), id: meta("id") },
      p: p.priceIdr,
      c: p.images.cover,
      h: normalize(
        [p.title.en, p.title.id, series?.en, series?.id, subject?.en, subject?.id, p.level, String(p.questions)]
          .filter(Boolean)
          .join(" "),
      ),
    };
  });

  const bundles: IndexEntry[] = catalog.bundles.map((b) => ({
    s: b.slug,
    k: "bundle",
    t: b.title,
    m: { en: `Bundle · ${b.items.length} ${itemsWord.en}`, id: `Paket · ${b.items.length} ${itemsWord.id}` },
    p: b.priceIdr,
    ca: b.compareAtIdr,
    c: b.images.stack[0] ?? "",
    i: b.items,
    h: normalize([b.title.en, b.title.id, "bundle paket", b.short.en, b.short.id].join(" ")),
  }));

  return Response.json([...bundles, ...products], {
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}
