import Link from "next/link";
import Form from "next/form";
import type { Metadata } from "next";
import { clsx } from "clsx";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CircleHelp,
  ListChecks,
  MessageSquareText,
  Minus,
  Plus,
  QrCode,
  Search,
  ShieldCheck,
} from "lucide-react";
import { catalog, bundleSum, getBundle, type Bundle, type CategoryId, type Product } from "@/data/catalog";
import { categoryLabel, seriesLabel, storeStats, subjectLabel, toCardModel } from "@/lib/catalog-view";
import { formatBytes, formatCount, formatIdr } from "@/lib/format";
import { path, productPath, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { common, site } from "@/content/common";
import { homeCopy } from "@/content/home";
import { ButtonLink, buttonClass } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { Reveal, Stagger } from "@/components/motion/reveal";
import { Paper, PaperStack } from "@/components/product/paper";
import { ProductCard } from "@/components/product/product-card";
import { QuickAdd } from "@/components/product/cart-buttons";
import { HeroStack, type StackItem } from "./hero-stack";
import { Ticker } from "./ticker";
import { SpotlightGrid } from "./spotlight";
import { LookInside } from "./look-inside";
import { ChooseArt, PayArt, ReadArt } from "./illustrations";
import styles from "./home.module.css";

/* ------------------------------------------------------------------ */
/* Data picked from the catalog at build time                          */
/* ------------------------------------------------------------------ */

/** Top-ranked products with no subject or series repeated, skipping `exclude`. */
function pickMix(n: number, exclude: Set<string> = new Set()): Product[] {
  const sorted = [...catalog.products].sort((a, b) => a.rank - b.rank || a.slug.localeCompare(b.slug));
  const out: Product[] = [];
  const subjects = new Set<string>();
  const series = new Set<string>();
  for (const p of sorted) {
    if (out.length >= n) break;
    if (exclude.has(p.slug) || subjects.has(p.subject) || series.has(p.series)) continue;
    out.push(p);
    subjects.add(p.subject);
    series.add(p.series);
  }
  return out;
}

const FEATURED = pickMix(8);
const HERO = pickMix(5, new Set(FEATURED.map((p) => p.slug)));

/** The look-inside product: the best-ranked file whose first pages are shown sharp. */
const INSIDE =
  [...catalog.products]
    .filter((p) => p.previewSharp > 0 && p.images.previews.length >= 3)
    .sort((a, b) => a.rank - b.rank)[0] ?? catalog.products[0];

const BUNDLE_SLUGS = [
  "bundle-subject-english",
  "bundle-series-pack-exam-100",
  "bundle-subject-math",
  "bundle-series-hots-pack-100",
];
const BUNDLES: Bundle[] = (() => {
  const chosen = BUNDLE_SLUGS.map((s) => getBundle(s)).filter((b): b is Bundle => Boolean(b));
  /* If the catalog ever renames these, fall back to the largest savings. */
  if (chosen.length >= 4) return chosen;
  return [...catalog.bundles].sort((a, b) => bundleSum(b) - b.priceIdr - (bundleSum(a) - a.priceIdr)).slice(0, 4);
})();

const CATEGORY_COLOR: Record<CategoryId, string> = {
  religion: "var(--warning)",
  languages: "var(--accent)",
  science: "var(--success)",
  civics: "var(--danger)",
};

const LIVE_SERIES = new Set(catalog.series.map((s) => s.id));
/* Series held from sale drop out, and so does a family left empty. */
const FAMILIES: { key: "big" | "mc" | "hots" | "exam"; series: string[] }[] = (
  [
    { key: "big", series: ["worksheet-1000", "answer-key-1000", "pack-1000"] },
    { key: "mc", series: ["mc-practice-100", "mc-key-100", "mc-pack-100"] },
    { key: "hots", series: ["hots-practice-100", "hots-key-100", "hots-pack-100"] },
    { key: "exam", series: ["assessment-100", "exam-script-100", "key-explained-100", "key-exam-100", "pack-exam-100"] },
  ] as const
)
  .map((f) => ({ key: f.key, series: f.series.filter((s) => LIVE_SERIES.has(s)) }))
  .filter((f) => f.series.length > 0);

function summarize(list: Product[]) {
  return { count: list.length, from: list.length ? Math.min(...list.map((p) => p.priceIdr)) : 0 };
}

const MARQUEE: string[] = (() => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of [...catalog.products].sort((a, b) => a.rank - b.rank || a.slug.localeCompare(b.slug))) {
    const key = `${p.subject}:${p.series}`;
    if (seen.has(p.subject) && out.length < 18) continue;
    if (seen.has(key)) continue;
    seen.add(p.subject);
    seen.add(key);
    out.push(p.images.cover);
    if (out.length >= 22) break;
  }
  return out;
})();

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* ------------------------------------------------------------------ */

export function homeMetadata(lang: Lang): Metadata {
  const t = homeCopy(lang);
  const s = storeStats();
  return pageMeta({
    lang,
    bare: "/",
    title: t.meta.title,
    description: t.meta.description(s.products, s.subjects),
  });
}

/* ------------------------------------------------------------------ */
/* Small shared pieces                                                 */
/* ------------------------------------------------------------------ */

const eyebrowClass = "text-xs font-medium uppercase tracking-[0.08em] text-subtle";
const h2Class = "font-display text-[clamp(24px,1.2rem+1.4vw,36px)] font-[650] leading-[1.12] tracking-[-0.02em]";
const sectionY = "py-16 lg:py-24";

function SectionHead({
  eyebrow,
  title,
  body,
  action,
  id,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  action?: React.ReactNode;
  id: string;
}) {
  return (
    <Reveal className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between lg:mb-12">
      <div className="max-w-[40rem]">
        <p className={eyebrowClass}>{eyebrow}</p>
        <h2 id={id} className={clsx(h2Class, "mt-3")}>
          {title}
        </h2>
        {body ? <p className="mt-3 max-w-[65ch] text-muted">{body}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </Reveal>
  );
}

function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group/tl inline-flex h-10 items-center gap-1.5 rounded-full text-sm font-medium text-brand hover:text-brand-strong"
    >
      {children}
      <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-150 group-hover/tl:translate-x-0.5" />
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function HomeView({ lang }: { lang: Lang }) {
  return (
    <>
      <Hero lang={lang} />
      <TrustStrip lang={lang} />
      <Subjects lang={lang} />
      <SeriesMatrix lang={lang} />
      <Featured lang={lang} />
      <LookInsideSection lang={lang} />
      <HowItWorks lang={lang} />
      <Bundles lang={lang} />
      <CoverMarquee />
      <Faq lang={lang} />
      <Closing lang={lang} />
    </>
  );
}

/* 1. Hero ----------------------------------------------------------- */

function Hero({ lang }: { lang: Lang }) {
  const t = homeCopy(lang).hero;
  const s = storeStats();
  const words = t.headline.split(" ");
  const stack: StackItem[] = HERO.map((p) => {
    const card = toCardModel(p, lang);
    return { slug: p.slug, href: card.href, title: card.title, chip: card.chip, cover: card.cover, price: formatIdr(p.priceIdr) };
  });

  return (
    <section aria-labelledby="home-hero" className="overflow-x-clip">
      <div className="container-page grid items-center gap-12 pb-16 pt-10 sm:pt-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:pb-24 lg:pt-20">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-2 pr-3 text-xs font-medium text-muted shadow-[var(--shadow-sm)]">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="tabular">{t.eyebrow(s.products)}</span>
          </p>

          <h1
            id="home-hero"
            className="mt-6 max-w-[15ch] font-display text-[clamp(44px,1.6rem+5vw,72px)] font-[650] leading-[1.05] tracking-[-0.03em]"
          >
            {words.map((w, i) => (
              <span key={`${w}-${i}`}>
                <span className={styles.word} style={{ "--i": Math.min(i, 7) } as React.CSSProperties}>
                  {w}
                </span>
                {i < words.length - 1 ? " " : null}
              </span>
            ))}
          </h1>

          <Reveal delay={260}>
            <p className="mt-6 max-w-[34rem] text-[1.05rem] leading-relaxed text-muted sm:text-lg">
              {t.sub(s.subjects, formatCount(s.questions, lang))}
            </p>
          </Reveal>

          <Reveal delay={340}>
            <Form
              action={path("shop", lang)}
              role="search"
              className="mt-8 flex max-w-[32rem] items-center gap-2 rounded-full border border-line bg-surface p-1.5 pl-4 shadow-[var(--shadow-sm)] transition-[border-color,box-shadow] duration-150 focus-within:border-line-strong focus-within:shadow-[var(--shadow-md)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring"
            >
              <Search aria-hidden className="h-[1.1rem] w-[1.1rem] shrink-0 text-subtle" />
              <label htmlFor="home-search" className="sr-only">
                {t.searchLabel}
              </label>
              <input
                id="home-search"
                name="q"
                type="search"
                autoComplete="off"
                enterKeyHint="search"
                placeholder={t.searchPlaceholder}
                className="h-10 min-w-0 flex-1 bg-transparent text-base text-text placeholder:text-subtle focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              <button type="submit" className={buttonClass({ size: "sm", className: "shrink-0" })}>
                {t.searchSubmit}
              </button>
            </Form>
            <p className="mt-2.5 hidden pl-4 text-xs text-subtle sm:block">
              {t.searchHint.split("/")[0]}
              <kbd className="mx-0.5 rounded border border-line bg-surface px-1.5 py-px font-mono text-[0.68rem] text-muted">/</kbd>
              {t.searchHint.split("/")[1]}
            </p>
          </Reveal>

          <Reveal delay={420} className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href={path("shop", lang)} size="lg">
              {t.primary}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href={path("protection", lang)} size="lg" variant="secondary">
              <ShieldCheck aria-hidden className="h-4 w-4 text-muted" />
              {t.secondary}
            </ButtonLink>
          </Reveal>
        </div>

        <div className="min-w-0">
          <HeroStack
            items={stack}
            labels={{ stackLabel: t.stackLabel, next: t.next, prev: t.prev, open: t.open, position: t.position }}
          />
        </div>
      </div>
    </section>
  );
}

/* 2. Trust strip ---------------------------------------------------- */

function TrustStrip({ lang }: { lang: Lang }) {
  const t = homeCopy(lang).stats;
  const s = storeStats();
  const stats = [
    { value: s.products, label: t.files },
    { value: s.subjects, label: t.subjects },
    { value: s.questions, label: t.questions },
    { value: s.bundles, label: t.bundles },
  ];
  return (
    <section aria-label={t.label} className="container-page">
      <Reveal className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-sm)]">
        <dl className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
          {stats.map((st) => (
            <div key={st.label} className="flex flex-col-reverse gap-1 bg-surface px-5 py-6 sm:px-7 sm:py-8">
              <dt className="text-sm text-muted">{st.label}</dt>
              <dd className="font-display text-[clamp(28px,1.1rem+2vw,40px)] font-[650] leading-none tracking-[-0.02em]">
                <Ticker value={st.value} lang={lang} />
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-3 border-t border-line px-5 py-4 text-sm text-muted sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:px-7">
          <p className="inline-flex items-center gap-2.5">
            <QrCode aria-hidden className="h-4 w-4 shrink-0 text-text" />
            {t.pay}
          </p>
          <p className="inline-flex items-center gap-2.5">
            <BookOpen aria-hidden className="h-4 w-4 shrink-0 text-text" />
            {t.read}
          </p>
        </div>
      </Reveal>
    </section>
  );
}

/* 3. Browse by subject ---------------------------------------------- */

function Subjects({ lang }: { lang: Lang }) {
  const t = homeCopy(lang).subjects;
  const shop = path("shop", lang);
  return (
    <section aria-labelledby="home-subjects" className={clsx("container-page", sectionY)}>
      <SectionHead id="home-subjects" eyebrow={t.eyebrow} title={t.title} body={t.body} />
      <div className="space-y-8 lg:space-y-10">
        {catalog.categories.map((cat) => {
          const subjects = catalog.subjects.filter((s) => s.category === cat.id);
          const inCat = catalog.products.filter((p) => p.category === cat.id);
          if (!subjects.length) return null;
          return (
            <Reveal key={cat.id} className="grid gap-4 border-t border-line pt-6 lg:grid-cols-[13rem_1fr] lg:gap-8">
              <div className="flex items-baseline justify-between gap-3 lg:block">
                <h3 className="flex items-center gap-2.5 font-sans text-base font-medium tracking-normal">
                  <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORY_COLOR[cat.id] }} />
                  {categoryLabel(cat.id, lang)}
                </h3>
                <Link
                  href={`${shop}?category=${cat.id}`}
                  className="text-sm text-muted tabular hover:text-text lg:mt-1.5 lg:block lg:pl-[1.125rem]"
                >
                  {t.files(inCat.length)}
                </Link>
              </div>
              <SpotlightGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {subjects.map((sub) => {
                  const sum = summarize(catalog.products.filter((p) => p.subject === sub.id));
                  return (
                    <Link
                      key={sub.id}
                      href={`${shop}?subject=${sub.id}`}
                      data-spot=""
                      className={clsx(
                        styles.spot,
                        "group/tile flex min-h-[5.75rem] flex-col justify-between gap-3 overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface py-3.5 pl-5 pr-3.5 transition-[border-color,box-shadow,transform] duration-150 hover:border-line-strong hover:shadow-[var(--shadow-sm)] active:scale-[0.99]",
                      )}
                    >
                      <span
                        aria-hidden
                        className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full"
                        style={{ backgroundColor: CATEGORY_COLOR[cat.id] }}
                      />
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-[0.95rem] font-medium leading-snug">{subjectLabel(sub.id, lang)}</span>
                        <ArrowUpRight
                          aria-hidden
                          className="mt-0.5 h-4 w-4 shrink-0 text-subtle opacity-0 transition-[opacity,transform] duration-150 group-hover/tile:translate-x-0.5 group-hover/tile:-translate-y-0.5 group-hover/tile:opacity-100"
                        />
                      </span>
                      <span className="text-xs text-muted tabular">
                        {t.files(sum.count)} · {t.from(formatIdr(sum.from))}
                      </span>
                    </Link>
                  );
                })}
              </SpotlightGrid>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* 4. Browse by type ------------------------------------------------- */

function SeriesMatrix({ lang }: { lang: Lang }) {
  const t = homeCopy(lang).series;
  const shop = path("shop", lang);
  const seriesById = new Map(catalog.series.map((s) => [s.id, s]));
  const cols = [
    { key: "questions", label: t.cols.questions, Icon: CircleHelp },
    { key: "answers", label: t.cols.answers, Icon: ListChecks },
    { key: "explanations", label: t.cols.explanations, Icon: MessageSquareText },
  ] as const;

  return (
    <section aria-labelledby="home-series" className="container-page pb-16 lg:pb-24">
      <SectionHead id="home-series" eyebrow={t.eyebrow} title={t.title} body={t.body} />

      <Reveal className="mb-6 flex flex-wrap gap-2">
        {cols.map(({ key, label, Icon }) => (
          <span
            key={key}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted"
          >
            <Icon aria-hidden className="h-3.5 w-3.5 text-text" />
            {label}
          </span>
        ))}
      </Reveal>

      <Stagger className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {FAMILIES.map((fam) => (
          <div
            key={fam.key}
            className={clsx(
              "overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface",
              fam.key === "exam" && "lg:col-span-2",
            )}
          >
            <table className="w-full border-collapse text-left">
              <caption className="border-b border-line px-4 py-3.5 text-left font-display text-[1.05rem] font-[600] tracking-[-0.01em] sm:px-5">
                {t.families[fam.key]}
              </caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">{t.cols.name}</th>
                  {cols.map((c) => (
                    <th key={c.key} scope="col">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fam.series.map((id) => {
                  const se = seriesById.get(id);
                  if (!se) return null;
                  const sum = summarize(catalog.products.filter((p) => p.series === id));
                  return (
                    <tr key={id} className="group/row relative border-b border-line transition-colors duration-150 last:border-b-0 hover:bg-surface-2">
                      <th scope="row" className="py-3 pl-4 pr-2 align-top font-normal sm:pl-5">
                        <Link
                          href={`${shop}?series=${id}`}
                          className="text-[0.95rem] font-medium leading-snug after:absolute after:inset-0 after:content-[''] hover:underline hover:decoration-line-strong hover:underline-offset-4"
                        >
                          {seriesLabel(id, lang)}
                        </Link>
                        <p className="mt-0.5 hidden text-[0.82rem] leading-snug text-muted sm:block">{se.blurb[lang]}</p>
                        <p className="mt-1 text-xs text-subtle tabular">
                          {t.files(sum.count)} · {t.from(formatIdr(sum.from))}
                        </p>
                      </th>
                      {cols.map((c) => {
                        const has = se.contains.includes(c.key);
                        return (
                          <td key={c.key} className="w-11 py-3 text-center align-top sm:w-14">
                            <span
                              title={c.label}
                              className={clsx(
                                "mx-auto mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full",
                                has ? "bg-text text-bg" : "text-subtle",
                              )}
                            >
                              {has ? (
                                <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={2.5} />
                              ) : (
                                <Minus aria-hidden className="h-3.5 w-3.5" />
                              )}
                              <span className="sr-only">{has ? t.yes : t.no}</span>
                            </span>
                          </td>
                        );
                      })}
                      <td className="w-2 p-0 sm:w-3" aria-hidden />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </Stagger>
    </section>
  );
}

/* 5. Featured ------------------------------------------------------- */

function Featured({ lang }: { lang: Lang }) {
  const t = homeCopy(lang).featured;
  return (
    <section aria-labelledby="home-featured" className={clsx("container-page", sectionY, "border-t border-line")}>
      <SectionHead
        id="home-featured"
        eyebrow={t.eyebrow}
        title={t.title}
        action={<TextLink href={path("shop", lang)}>{t.viewAll}</TextLink>}
      />
      <Stagger className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
        {FEATURED.map((p) => (
          <ProductCard key={p.slug} item={toCardModel(p, lang)} lang={lang} />
        ))}
      </Stagger>
    </section>
  );
}

/* 6. Look inside ---------------------------------------------------- */

function LookInsideSection({ lang }: { lang: Lang }) {
  const t = homeCopy(lang).inside;
  const p = INSIDE;
  const title = p.title[lang];
  const previews = p.images.previews.slice(0, 3);
  const rule = p.previewSharp > 0 ? t.ruleSharp(p.previewSharp) : t.ruleKey;
  const facts = [
    { label: t.facts.questions, value: formatCount(p.questions, lang) },
    { label: t.facts.pages, value: formatCount(p.pages, lang) },
    { label: t.facts.size, value: formatBytes(p.bytes, lang) },
    { label: t.facts.level, value: p.level },
  ];
  return (
    <section aria-labelledby="home-inside" className="container-page pb-16 lg:pb-24">
      <Reveal className="grid items-center gap-10 rounded-[var(--radius-xl)] border border-line bg-surface p-5 sm:p-8 lg:grid-cols-2 lg:gap-16 lg:p-14">
        <div className="order-2 lg:order-1">
          <p className={eyebrowClass}>{t.eyebrow}</p>
          <h2 id="home-inside" className={clsx(h2Class, "mt-3")}>
            {t.title}
          </h2>
          <p className="mt-4 max-w-[65ch] text-muted">{t.body}</p>

          <div className="mt-8 rounded-[var(--radius-md)] border border-line bg-bg p-4 sm:p-5">
            <p className="text-sm font-medium">{title}</p>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
              {facts.map((f) => (
                <div key={f.label} className="flex flex-col-reverse gap-0.5">
                  <dt className="text-xs text-muted">{f.label}</dt>
                  <dd className="font-display text-xl font-[600] tabular tracking-[-0.01em]">{f.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <Price value={p.priceIdr} lang={lang} />
              <ButtonLink href={productPath(p.slug, lang)} size="sm" variant="secondary">
                {t.cta}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <LookInside
            pages={previews}
            labels={{
              viewerLabel: t.viewerLabel(title),
              page: previews.map((_, i) => t.page(i + 1, previews.length)),
              prev: t.prev,
              next: t.next,
              thumbs: t.thumbs,
              thumb: previews.map((_, i) => t.thumb(i + 1)),
              rule,
            }}
          />
        </div>
      </Reveal>
    </section>
  );
}

/* 7. How it works --------------------------------------------------- */

function HowItWorks({ lang }: { lang: Lang }) {
  const t = homeCopy(lang).how;
  const art = [ChooseArt, PayArt, ReadArt];
  return (
    <section aria-labelledby="home-how" className="container-page pb-16 lg:pb-24">
      <SectionHead id="home-how" eyebrow={t.eyebrow} title={t.title} />
      <Stagger as="ol" className="grid gap-4 md:grid-cols-3 md:gap-6">
        {t.steps.map((step, i) => {
          const Art = art[i] ?? ChooseArt;
          return (
            <li key={step.title} className="flex flex-col rounded-[var(--radius-lg)] border border-line bg-surface p-2">
              <div className="aspect-[16/10] rounded-[calc(var(--radius-lg)-4px)] bg-surface-2 p-4">
                <Art />
              </div>
              <div className="px-3 pb-4 pt-5 sm:px-4">
                <p className="font-mono text-xs text-subtle tabular">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-1.5 font-sans text-xl font-medium tracking-[-0.01em]">{step.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{step.body}</p>
              </div>
            </li>
          );
        })}
      </Stagger>
    </section>
  );
}

/* 8. Bundles -------------------------------------------------------- */

function Bundles({ lang }: { lang: Lang }) {
  const t = homeCopy(lang).bundles;
  return (
    <section aria-labelledby="home-bundles" className={clsx("container-page", sectionY, "border-t border-line")}>
      <SectionHead
        id="home-bundles"
        eyebrow={t.eyebrow}
        title={t.title}
        body={t.body}
        action={<TextLink href={path("bundles", lang)}>{t.viewAll}</TextLink>}
      />
      <Stagger className="grid gap-4 md:grid-cols-2 md:gap-6">
        {BUNDLES.map((b) => {
          const saving = bundleSum(b) - b.priceIdr;
          const title = b.title[lang];
          return (
            <article
              key={b.slug}
              className="group/card relative flex gap-5 rounded-[var(--radius-lg)] border border-line bg-surface p-4 transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-[var(--shadow-md)] sm:gap-6 sm:p-5"
            >
              <div className="w-[6.5rem] shrink-0 sm:w-32">
                <PaperStack covers={b.images.stack} alt={title} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-xs font-medium uppercase tracking-[0.06em] text-subtle tabular">
                  {common(lang).nav.bundles} · {t.files(b.items.length)}
                </p>
                <h3 className="mt-1.5 font-sans text-[1.05rem] font-medium leading-snug tracking-normal">
                  <Link href={productPath(b.slug, lang)} className="after:absolute after:inset-0 after:rounded-[var(--radius-lg)] after:content-['']">
                    {title}
                  </Link>
                </h3>
                <p className="mt-1 line-clamp-2 text-[0.85rem] text-muted">{b.short[lang]}</p>
                <div className="mt-auto pt-4">
                  {saving > 0 ? (
                    <p className="mb-2 text-[0.82rem] font-medium text-success tabular">{t.save(formatIdr(saving))}</p>
                  ) : null}
                  <div className="flex items-end justify-between gap-3">
                    <Price value={b.priceIdr} compareAt={b.compareAtIdr} lang={lang} />
                    <QuickAdd slug={b.slug} title={title} lang={lang} />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </Stagger>
    </section>
  );
}

/* 9. Cover marquee -------------------------------------------------- */

function CoverMarquee() {
  if (MARQUEE.length < 6) return null;
  const row = (copy: number) =>
    MARQUEE.map((src, i) => (
      <div key={`${copy}-${i}`} className="w-[7.5rem] shrink-0 px-2 sm:w-36 sm:px-2.5" style={{ rotate: `${i % 2 ? 1.2 : -1.2}deg` }}>
        <Paper src={src} alt="" />
      </div>
    ));
  /* Purely decorative: every cover here is reachable from the sections above. */
  return (
    <div aria-hidden className={clsx(styles.marquee, "mb-16 overflow-hidden py-4 lg:mb-24")}>
      <div className={styles.track}>
        {row(0)}
        {row(1)}
      </div>
    </div>
  );
}

/* 10. FAQ ----------------------------------------------------------- */

function Faq({ lang }: { lang: Lang }) {
  const t = homeCopy(lang).faq;
  return (
    <section aria-labelledby="home-faq" className={clsx("container-page", sectionY, "border-t border-line")}>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.7fr] lg:gap-16">
        <Reveal className="lg:sticky lg:top-24 lg:self-start">
          <p className={eyebrowClass}>{t.eyebrow}</p>
          <h2 id="home-faq" className={clsx(h2Class, "mt-3")}>
            {t.title}
          </h2>
          <p className="mt-3 max-w-[40ch] text-muted">{t.body}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-strong"
            >
              {site.instagramHandle}
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </a>
            <TextLink href={path("help", lang)}>{t.more}</TextLink>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="border-t border-line">
            {t.items.map((item) => (
              <details key={item.q} className={clsx(styles.faq, "group border-b border-line")}>
                <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-6 py-4 text-left font-medium transition-colors duration-150 hover:text-brand">
                  {item.q}
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-muted">
                    <Plus aria-hidden className={clsx(styles.plus, "h-4 w-4")} />
                  </span>
                </summary>
                <p className={clsx(styles.answer, "max-w-[65ch] pb-5 pr-12 text-muted")}>{item.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* 11. Closing ------------------------------------------------------- */

function Closing({ lang }: { lang: Lang }) {
  const t = homeCopy(lang).closing;
  const s = storeStats();
  const covers = FEATURED.slice(0, 3).map((p) => p.images.cover);
  return (
    <section aria-labelledby="home-closing" className="container-page pb-16 lg:pb-24">
      <Reveal className="relative grid items-center gap-8 overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:p-14">
        <div>
          <h2 id="home-closing" className={clsx(h2Class, "max-w-[22ch]")}>
            {t.title(s.products, s.subjects)}
          </h2>
          <p className="mt-3 max-w-[50ch] text-muted">{t.body}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href={path("shop", lang)} size="lg">
              {t.cta}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href={path("bundles", lang)} size="lg" variant="ghost">
              {t.bundles}
            </ButtonLink>
          </div>
        </div>
        <div aria-hidden className="relative hidden h-52 w-72 lg:block">
          {covers.map((src, i) => (
            <div
              key={src}
              className="absolute top-2 w-32"
              style={{ left: `${i * 4.5}rem`, rotate: `${(i - 1) * 7}deg`, translate: `0 ${i === 1 ? -6 : 8}px` }}
            >
              <Paper src={src} alt="" className="shadow-[var(--shadow-md)]" />
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
