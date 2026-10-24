import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { catalog, type Bundle } from "@/data/catalog";
import { categoryLabel, toCardModel } from "@/lib/catalog-view";
import { path, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { formatIdr } from "@/lib/format";
import { bundlesCopy } from "@/content/bundles";
import { ProductCard } from "@/components/product/product-card";
import { Reveal, Stagger } from "@/components/motion/reveal";

export function bundlesMetadata(lang: Lang): Metadata {
  const t = bundlesCopy(lang);
  return pageMeta({
    lang,
    bare: "/bundles",
    title: t.metaTitle,
    description: t.metaDescription(catalog.bundles.length),
  });
}

export function BundlesView({ lang }: { lang: Lang }) {
  const t = bundlesCopy(lang);
  const bySubject = catalog.bundles.filter((b) => b.subject);
  const byType = catalog.bundles.filter((b) => !b.subject);

  const groups = catalog.categories
    .map((c) => ({ id: c.id, label: categoryLabel(c.id, lang), items: bySubject.filter((b) => b.category === c.id) }))
    .filter((g) => g.items.length);
  const ungrouped = bySubject.filter((b) => !b.category || !groups.some((g) => g.id === b.category));

  return (
    <div className="container-page pb-24 pt-10 sm:pt-14">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-subtle">{t.eyebrow}</p>
        <h1 className="mt-3 text-[clamp(32px,1.4rem+2.6vw,48px)] font-[650] leading-[1.08] tracking-[-0.02em]">{t.title}</h1>
        <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-muted">{t.intro(catalog.bundles.length)}</p>
        <nav aria-label={t.jump} className="mt-6 flex flex-wrap gap-2">
          {[
            { href: "#by-subject", label: t.bySubject, n: bySubject.length },
            { href: "#by-type", label: t.byType, n: byType.length },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium text-text transition-colors duration-150 hover:border-line-strong hover:bg-surface-2"
            >
              {l.label}
              <span className="tabular text-xs text-subtle">{l.n}</span>
            </a>
          ))}
        </nav>
      </header>

      <section id="by-subject" aria-labelledby="by-subject-title" className="scroll-mt-24 pt-16 sm:pt-24">
        <SectionHead id="by-subject-title" title={t.bySubject} line={t.bySubjectLine} count={t.count(bySubject.length)} />
        {groups.map((g) => (
          <div key={g.id} className="mt-10 sm:mt-12">
            <h3 className="flex items-center gap-3 font-sans text-sm font-semibold uppercase tracking-[0.08em] text-subtle">
              {g.label}
              <span aria-hidden className="h-px flex-1 bg-line" />
            </h3>
            <BundleGrid items={g.items} lang={lang} />
          </div>
        ))}
        {ungrouped.length ? <BundleGrid items={ungrouped} lang={lang} /> : null}
      </section>

      <section id="by-type" aria-labelledby="by-type-title" className="scroll-mt-24 pt-16 sm:pt-24">
        <SectionHead id="by-type-title" title={t.byType} line={t.byTypeLine} count={t.count(byType.length)} />
        <BundleGrid items={byType} lang={lang} />
      </section>

      <Reveal className="mt-20 flex flex-col items-start gap-4 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg text-text">{t.browse}</p>
        <Link
          href={path("shop", lang)}
          className="group/link inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-[0.95rem] font-medium text-brand-contrast transition-colors duration-200 hover:bg-brand-strong"
        >
          {t.browseLink}
          <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-0.5" />
        </Link>
      </Reveal>
    </div>
  );
}

function SectionHead({ id, title, line, count }: { id: string; title: string; line: string; count: string }) {
  return (
    <Reveal className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
      <div className="max-w-2xl">
        <h2 id={id} className="text-[clamp(24px,1.2rem+1.4vw,36px)] font-[650] leading-tight">
          {title}
        </h2>
        <p className="mt-2 text-base text-muted">{line}</p>
      </div>
      <p className="tabular shrink-0 text-sm text-subtle">{count}</p>
    </Reveal>
  );
}

function BundleGrid({ items, lang }: { items: Bundle[]; lang: Lang }) {
  const t = bundlesCopy(lang);
  return (
    <Stagger as="ul" className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
      {items.map((b) => {
        const saving = b.compareAtIdr - b.priceIdr;
        return (
          <li key={b.slug} className="flex flex-col">
            <ProductCard item={toCardModel(b, lang)} lang={lang} className="flex-1" />
            {saving > 0 ? <p className="tabular mt-2 text-[0.8rem] leading-snug text-success">{t.saving(formatIdr(saving))}</p> : null}
          </li>
        );
      })}
    </Stagger>
  );
}
