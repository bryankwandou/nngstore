import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catalog, bundleSum, bundlesContaining, getItem, relatedProducts, type Bundle, type Product } from "@/data/catalog";
import {
  levelLabel,
  metaLine,
  productsBySlug,
  seriesChip,
  subjectLabel,
  toCardModel,
} from "@/lib/catalog-view";
import { path, productPath, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { site } from "@/content/common";
import { formatBytes, formatCount, formatIdr } from "@/lib/format";
import { productCopy } from "@/content/product";
import { Paper, PaperStack } from "@/components/product/paper";
import { Reveal } from "@/components/motion/reveal";
import { Gallery } from "./gallery";
import { MobileBuyBar } from "./mobile-bar";
import { Breadcrumb, BundleUpsell, BuyBox, CardRow, ContainsList, Delivery, SectionTitle } from "./parts";

const BUY_ID = "buy-buttons";

export function productStaticParams(): { slug: string }[] {
  return [...catalog.products, ...catalog.bundles].map((x) => ({ slug: x.slug }));
}

function clip(s: string, n = 158): string {
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  return `${cut.slice(0, cut.lastIndexOf(" "))}...`;
}

export function productMetadata(slug: string, lang: Lang): Metadata {
  const item = getItem(slug);
  if (!item) return {};
  return pageMeta({
    lang,
    bare: `/shop/${slug}`,
    title: item.title[lang],
    description: clip(item.description[lang]),
    image: item.kind === "product" ? item.images.cover : item.images.stack[0],
  });
}

function JsonLd({ item, lang }: { item: Product | Bundle; lang: Lang }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.title[lang],
    description: item.description[lang],
    sku: item.slug,
    image: `${site.url}${item.kind === "product" ? item.images.cover : item.images.stack[0]}`,
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      price: item.priceIdr,
      priceCurrency: "IDR",
      availability: "https://schema.org/InStock",
      url: `${site.url}${productPath(item.slug, lang)}`,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function ProductView({ slug, lang }: { slug: string; lang: Lang }) {
  const item = getItem(slug);
  if (!item) notFound();
  return item.kind === "bundle" ? <BundleDetail bundle={item} lang={lang} /> : <ProductDetail product={item} lang={lang} />;
}

function contentsKey(contains: string[]): string {
  return ["questions", "answers", "explanations"].filter((k) => contains.includes(k)).join("+");
}

function ProductDetail({ product: p, lang }: { product: Product; lang: Lang }) {
  const t = productCopy(lang);
  const shop = path("shop", lang);
  const subject = subjectLabel(p.subject, lang);
  const series = catalog.series.find((s) => s.id === p.series);
  const level = levelLabel(p.level, lang);
  const contents = t.contents[contentsKey(p.contains)] ?? t.contents.questions;
  const who = !p.contains.includes("answers") ? t.who.practice : !p.contains.includes("questions") ? t.who.key : t.who.full;
  const related = relatedProducts(p.slug, 4).map((x) => toCardModel(x, lang));

  return (
    <>
      <JsonLd item={p} lang={lang} />
      <div className="container-page pb-28 pt-4 sm:pt-6 lg:pb-24">
        <Breadcrumb
          lang={lang}
          items={[
            { label: t.shop, href: shop },
            { label: subject, href: `${shop}?subject=${p.subject}` },
            { label: p.title[lang] },
          ]}
        />

        <div className="mt-4 grid gap-10 lg:mt-6 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-7">
            <Gallery lang={lang} title={p.title[lang]} pages={p.images.previews} sharp={p.previewSharp} totalPages={p.pages} />
          </div>
          <div className="min-w-0 lg:col-span-5">
            <div className="lg:sticky lg:top-[88px]">
              <BuyBox
                lang={lang}
                slug={p.slug}
                chip={seriesChip(p.series, lang)}
                chipHref={`${shop}?series=${p.series}`}
                title={p.title[lang]}
                short={p.short[lang]}
                meta={[
                  level,
                  t.meta.questions(formatCount(p.questions, lang)),
                  t.meta.pages(formatCount(p.pages, lang)),
                  formatBytes(p.bytes, lang),
                  t.meta.pdf,
                ]}
                price={p.priceIdr}
                get={t.facts.get(contents, formatCount(p.pages, lang))}
                buyId={BUY_ID}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-12 pt-16 sm:pt-24 lg:grid-cols-12 lg:gap-12">
          <Reveal as="section" className="min-w-0 lg:col-span-7">
            <SectionTitle>{t.insideTitle}</SectionTitle>
            <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-muted">{p.description[lang]}</p>
            <ContainsList lang={lang} contains={p.contains} />
            {series ? (
              <div className="mt-8 border-l-2 border-line-strong pl-4">
                <h3 className="font-sans text-sm font-semibold tracking-normal text-text">
                  {t.seriesTitle}: {series.title[lang]}
                </h3>
                <p className="mt-1 max-w-[65ch] text-sm leading-relaxed text-muted">{series.blurb[lang]}</p>
              </div>
            ) : null}
          </Reveal>
          <div className="flex min-w-0 flex-col gap-12 lg:col-span-5">
            <Reveal as="section">
              <h2 className="font-sans text-xl font-semibold tracking-[-0.01em]">{t.whoTitle}</h2>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-muted">{who}</p>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{t.levelLine(level)}</p>
            </Reveal>
            <Delivery lang={lang} />
          </div>
        </div>

        <BundleUpsell lang={lang} bundles={bundlesContaining(p.slug)} price={p.priceIdr} />

        <CardRow
          lang={lang}
          title={t.relatedTitle(subject)}
          allHref={`${shop}?subject=${p.subject}`}
          allLabel={t.relatedAll}
          items={related}
        />
      </div>
      <MobileBuyBar lang={lang} slug={p.slug} title={p.title[lang]} price={p.priceIdr} watch={BUY_ID} />
    </>
  );
}

function BundleDetail({ bundle: b, lang }: { bundle: Bundle; lang: Lang }) {
  const t = productCopy(lang);
  const shop = path("shop", lang);
  const files = productsBySlug(b.items);
  const sum = bundleSum(b);
  const saving = sum - b.priceIdr;
  const questions = files.reduce((s, x) => s + x.questions, 0);
  const pages = files.reduce((s, x) => s + x.pages, 0);
  const bytes = files.reduce((s, x) => s + x.bytes, 0);
  const isSubject = Boolean(b.subject);
  const others = catalog.bundles
    .filter((x) => x.slug !== b.slug && Boolean(x.subject) === isSubject)
    .sort((x, y) => Number(y.category === b.category) - Number(x.category === b.category))
    .slice(0, 4)
    .map((x) => toCardModel(x, lang));

  return (
    <>
      <JsonLd item={b} lang={lang} />
      <div className="container-page pb-28 pt-4 sm:pt-6 lg:pb-24">
        <Breadcrumb
          lang={lang}
          items={[
            { label: t.shop, href: shop },
            { label: t.bundles, href: path("bundles", lang) },
            { label: b.title[lang] },
          ]}
        />

        <div className="mt-4 grid gap-10 lg:mt-6 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-7">
            <div className="flex flex-col gap-4">
              <div className="rounded-[var(--radius-xl)] border border-line bg-surface-2 px-10 py-10 sm:px-16 sm:py-14">
                <PaperStack covers={b.images.stack} alt={b.title[lang]} priority className="mx-auto w-full max-w-[24rem]" />
              </div>
              <p className="text-center text-sm text-muted">{t.bundle.previewRule}</p>
            </div>
          </div>
          <div className="min-w-0 lg:col-span-5">
            <div className="lg:sticky lg:top-[88px]">
              <BuyBox
                lang={lang}
                slug={b.slug}
                chip={`${t.bundle.chip} · ${t.meta.files(formatCount(files.length, lang))}`}
                chipHref={path("bundles", lang)}
                title={b.title[lang]}
                short={b.short[lang]}
                meta={[
                  t.meta.files(formatCount(files.length, lang)),
                  t.meta.questions(formatCount(questions, lang)),
                  t.meta.pages(formatCount(pages, lang)),
                  formatBytes(bytes, lang),
                  t.meta.pdf,
                ]}
                price={b.priceIdr}
                compareAt={sum > b.priceIdr ? sum : undefined}
                saving={saving > 0 ? t.bundle.saving(formatIdr(sum), formatIdr(b.priceIdr), formatIdr(saving)) : undefined}
                get={t.facts.getBundle(formatCount(files.length, lang), formatCount(pages, lang))}
                buyId={BUY_ID}
              />
            </div>
          </div>
        </div>

        <section aria-labelledby="included-title" className="pt-16 sm:pt-24">
          <Reveal className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <SectionTitle id="included-title">{t.bundle.includedTitle(files.length)}</SectionTitle>
            <p className="text-sm text-muted">{t.bundle.includedHint}</p>
          </Reveal>
          <ul className="mt-8 grid gap-x-8 border-t border-line lg:grid-cols-2">
            {files.map((f) => (
              <li key={f.slug} className="border-b border-line">
                <Link
                  href={productPath(f.slug, lang)}
                  className="group/row -mx-2 flex items-center gap-4 rounded-[var(--radius-md)] px-2 py-3 transition-colors duration-150 hover:bg-surface-2"
                >
                  <Paper src={f.images.cover} alt="" className="w-11 shrink-0 !rounded-[var(--radius-sm)]" />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-medium leading-snug text-text group-hover/row:underline">
                      {f.title[lang]}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted">{metaLine(f, lang)}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="sr-only">{t.bundle.eachPrice}: </span>
                    <span className="tabular text-sm text-muted">{formatIdr(f.priceIdr)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <dl className="tabular mt-6 ml-auto flex max-w-sm flex-col gap-2 text-sm">
            <div className="flex justify-between gap-4 text-muted">
              <dt>{t.bundle.eachPrice}</dt>
              <dd className="line-through decoration-line-strong">{formatIdr(sum)}</dd>
            </div>
            <div className="flex justify-between gap-4 font-semibold text-text">
              <dt>{t.bundle.chip}</dt>
              <dd>{formatIdr(b.priceIdr)}</dd>
            </div>
            {saving > 0 ? (
              <div className="flex justify-between gap-4 border-t border-line pt-2 text-success">
                <dt>{t.bundle.youSave}</dt>
                <dd>{formatIdr(saving)}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <div className="grid gap-12 pt-16 sm:pt-24 lg:grid-cols-12 lg:gap-12">
          <Reveal as="section" className="min-w-0 lg:col-span-7">
            <SectionTitle>{t.insideTitle}</SectionTitle>
            <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-muted">{b.description[lang]}</p>
          </Reveal>
          <div className="flex min-w-0 flex-col gap-12 lg:col-span-5">
            <Reveal as="section">
              <h2 className="font-sans text-xl font-semibold tracking-[-0.01em]">{t.whoTitle}</h2>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-muted">{t.bundle.who}</p>
            </Reveal>
            <Delivery lang={lang} />
          </div>
        </div>

        <CardRow lang={lang} title={t.bundle.othersTitle} allHref={path("bundles", lang)} allLabel={t.relatedAll} items={others} />
      </div>
      <MobileBuyBar
        lang={lang}
        slug={b.slug}
        title={b.title[lang]}
        price={b.priceIdr}
        compareAt={sum > b.priceIdr ? sum : undefined}
        watch={BUY_ID}
      />
    </>
  );
}
