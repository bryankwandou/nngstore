import Link from "next/link";
import { ArrowRight, Check, ChevronRight, FileText, Minus, MonitorSmartphone, RotateCcw, Zap } from "lucide-react";
import { clsx } from "clsx";
import { bundleSum, type Bundle } from "@/data/catalog";
import { path, productPath, type Lang } from "@/lib/i18n";
import { formatIdr } from "@/lib/format";
import { productCopy } from "@/content/product";
import { ProductCard } from "@/components/product/product-card";
import { PaperStack } from "@/components/product/paper";
import { BuyButtons, QuickAdd } from "@/components/product/cart-buttons";
import type { CardModel } from "@/components/product/types";
import { Price } from "@/components/ui/price";
import { buttonClass } from "@/components/ui/button";
import { Reveal, Stagger } from "@/components/motion/reveal";

export type Crumb = { label: string; href?: string };

export function Breadcrumb({ lang, items }: { lang: Lang; items: Crumb[] }) {
  const t = productCopy(lang);
  return (
    <nav aria-label={t.breadcrumb} className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-sm text-muted">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className={clsx("flex items-center gap-1.5", last ? "min-w-0" : "shrink-0")}>
              {c.href && !last ? (
                <Link href={c.href} className="rounded-sm py-2 transition-colors duration-150 hover:text-text hover:underline">
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={clsx("py-2", last && "truncate text-text")}>
                  {c.label}
                </span>
              )}
              {!last ? <ChevronRight aria-hidden className="h-3.5 w-3.5 shrink-0 text-subtle" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Title block, price panel and the three facts. `buyId` marks the buttons the mobile bar watches. */
export function BuyBox({
  lang,
  slug,
  chip,
  chipHref,
  title,
  short,
  meta,
  price,
  compareAt,
  saving,
  get,
  buyId,
}: {
  lang: Lang;
  slug: string;
  chip: string;
  chipHref: string;
  title: string;
  short: string;
  meta: string[];
  price: number;
  compareAt?: number;
  saving?: string;
  get: string;
  buyId: string;
}) {
  const t = productCopy(lang);
  return (
    <div className="flex flex-col">
      <Link
        href={chipHref}
        className="inline-flex h-7 w-fit items-center rounded-full bg-brand-soft px-3 text-xs font-semibold uppercase tracking-[0.06em] text-brand-strong transition-colors duration-150 hover:bg-brand hover:text-brand-contrast"
      >
        {chip}
      </Link>
      <h1 className="mt-4 text-[clamp(28px,1.2rem+1.8vw,40px)] font-[650] leading-[1.1] tracking-[-0.02em]">{title}</h1>
      <p className="mt-3 text-base leading-relaxed text-muted">{short}</p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {meta.map((m) => (
          <li key={m} className="tabular inline-flex h-8 items-center rounded-full border border-line bg-surface px-3 text-[0.82rem] text-muted">
            {m}
          </li>
        ))}
      </ul>

      <div className="mt-7 rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-6">
        <Price value={price} compareAt={compareAt} lang={lang} size="lg" />
        {saving ? <p className="tabular mt-2 text-sm leading-relaxed text-success">{saving}</p> : null}
        <div id={buyId} className="mt-5">
          <BuyButtons slug={slug} lang={lang} />
        </div>
        <p className="mt-4 flex items-center gap-2 text-sm text-text">
          <Zap aria-hidden className="h-4 w-4 shrink-0 text-brand" />
          {t.note}
        </p>
        <p className="mt-1.5 pl-6 text-[0.82rem] text-subtle">{t.payment}</p>
      </div>

      <dl className="mt-6 divide-y divide-line border-y border-line">
        <Fact icon={<FileText className="h-4 w-4" />} title={t.facts.getTitle}>
          {get}
        </Fact>
        <Fact icon={<MonitorSmartphone className="h-4 w-4" />} title={t.facts.readTitle}>
          {t.facts.read}
        </Fact>
        <Fact icon={<RotateCcw className="h-4 w-4" />} title={t.facts.refundTitle}>
          {t.facts.refund}{" "}
          <Link href={path("refunds", lang)} className="font-medium text-brand underline-offset-2 hover:underline">
            {t.facts.refundLink}
          </Link>
        </Fact>
      </dl>
    </div>
  );
}

function Fact({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-4">
      <span aria-hidden className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-2 text-muted">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-sm font-medium text-text">{title}</dt>
        <dd className="mt-0.5 text-sm leading-relaxed text-muted">{children}</dd>
      </div>
    </div>
  );
}

/** Questions / answers / explanations, each marked included or not. */
export function ContainsList({ lang, contains }: { lang: Lang; contains: string[] }) {
  const t = productCopy(lang);
  const all = ["questions", "answers", "explanations"];
  const no = t.notIncluded;
  return (
    <ul className="mt-5 grid gap-2 sm:grid-cols-3">
      {all.map((k) => {
        const yes = contains.includes(k);
        return (
          <li
            key={k}
            className={clsx(
              "flex items-center gap-2.5 rounded-[var(--radius-md)] border px-3.5 py-3 text-sm",
              yes ? "border-line bg-surface text-text" : "border-dashed border-line text-subtle",
            )}
          >
            {yes ? <Check aria-hidden className="h-4 w-4 text-success" /> : <Minus aria-hidden className="h-4 w-4" />}
            <span className={clsx(!yes && "line-through decoration-line-strong")}>{t.containsWord[k] ?? k}</span>
            {!yes ? <span className="sr-only">({no})</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

export function SectionTitle({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="text-[clamp(24px,1.2rem+1.4vw,36px)] font-[650] leading-tight">
      {children}
    </h2>
  );
}

export function Delivery({ lang }: { lang: Lang }) {
  const t = productCopy(lang);
  return (
    <Reveal as="section" className="min-w-0">
      <h2 className="font-sans text-xl font-semibold tracking-[-0.01em]">{t.deliveryTitle}</h2>
      <ol className="mt-5 flex flex-col gap-4">
        {t.delivery.map((step, i) => (
          <li key={i} className="flex gap-3.5">
            <span className="tabular grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line-strong text-xs font-semibold text-text">
              {i + 1}
            </span>
            <p className="pt-0.5 text-[0.95rem] leading-relaxed text-muted">{step}</p>
          </li>
        ))}
      </ol>
      <Link
        href={path("protection", lang)}
        className="group/l mt-5 inline-flex h-10 items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-strong"
      >
        {t.deliveryLink}
        <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-200 group-hover/l:translate-x-0.5" />
      </Link>
    </Reveal>
  );
}

/** One card per bundle that holds this file, with the arithmetic spelled out. */
export function BundleUpsell({ lang, bundles, price }: { lang: Lang; bundles: Bundle[]; price: number }) {
  const t = productCopy(lang);
  if (!bundles.length) return null;
  return (
    <section aria-labelledby="upsell-title" className="pt-16 sm:pt-24">
      <Reveal>
        <SectionTitle id="upsell-title">{t.upsellTitle}</SectionTitle>
      </Reveal>
      <Stagger as="ul" className={clsx("mt-8 grid gap-4 sm:gap-6", bundles.length > 1 && "lg:grid-cols-2")}>
        {bundles.map((b) => {
          const sum = bundleSum(b);
          const saving = sum - b.priceIdr;
          const extra = b.priceIdr - price;
          const href = productPath(b.slug, lang);
          return (
            <li key={b.slug} className="flex gap-5 rounded-[var(--radius-lg)] border border-line bg-surface p-5 sm:p-6">
              <PaperStack covers={b.images.stack} alt="" className="w-20 shrink-0 sm:w-28" />
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-sm text-muted">{t.upsellIncludes}</p>
                <h3 className="mt-1 font-sans text-lg font-semibold leading-snug tracking-[-0.01em]">
                  <Link href={href} className="hover:underline">
                    {b.title[lang]}
                  </Link>
                </h3>
                <p className="tabular mt-2 text-sm leading-relaxed text-muted">
                  {t.upsellMath(b.items.length, formatIdr(b.priceIdr), formatIdr(sum), formatIdr(saving))}
                  {extra > 0 ? ` ${t.upsellExtra(b.items.length - 1, formatIdr(extra))}` : ""}
                </p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                  <Price value={b.priceIdr} compareAt={sum} lang={lang} />
                  <div className="flex items-center gap-2">
                    <Link href={href} className={buttonClass({ variant: "secondary", size: "sm" })}>
                      {t.upsellView}
                    </Link>
                    <QuickAdd slug={b.slug} title={b.title[lang]} lang={lang} />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </Stagger>
    </section>
  );
}

export function CardRow({
  lang,
  title,
  allHref,
  allLabel,
  items,
}: {
  lang: Lang;
  title: string;
  allHref: string;
  allLabel: string;
  items: CardModel[];
}) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="related-title" className="pt-16 sm:pt-24">
      <Reveal className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <SectionTitle id="related-title">{title}</SectionTitle>
        <Link
          href={allHref}
          className="group/all inline-flex h-10 items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-strong"
        >
          {allLabel}
          <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-200 group-hover/all:translate-x-0.5" />
        </Link>
      </Reveal>
      <Stagger as="ul" className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
        {items.map((c) => (
          <li key={c.slug} className="flex">
            <ProductCard item={c} lang={lang} className="w-full" />
          </li>
        ))}
      </Stagger>
    </section>
  );
}

