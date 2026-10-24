"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { ArrowRight, Search, SearchX, SlidersHorizontal, X } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { path } from "@/lib/i18n";
import { formatIdr } from "@/lib/format";
import { shopCopy } from "@/content/shop";
import type { CardModel } from "@/components/product/types";
import { ProductCard } from "@/components/product/product-card";
import { PaperStack } from "@/components/product/paper";
import { Price } from "@/components/ui/price";
import { Sheet } from "@/components/ui/sheet";
import { buttonClass } from "@/components/ui/button";
import { FilterPanel } from "./filter-panel";
import {
  applyFilters,
  emptyState,
  facetCounts,
  facetKeys,
  hasFilters,
  parseState,
  serializeState,
  sorts,
  type FacetKey,
  type ShopOptions,
  type ShopRow,
  type ShopState,
  type Sort,
} from "./filters";

const PAGE = 24;

export type BundleOffer = {
  slug: string;
  href: string;
  title: string;
  files: number;
  price: number;
  compareAt: number;
  stack: string[];
};

export type ShopStats = { files: number; subjects: number; series: number };

/**
 * Tells the shop when the query string changes: on first load, when the header
 * links to /shop?subject=... while the shop is open, and on back/forward.
 * useSearchParams lives here, inside its own Suspense boundary, so the grid
 * itself still renders on the server.
 */
function ParamsListener({ onChange }: { onChange: (search: string) => void }) {
  const params = useSearchParams();
  const search = params.toString();
  useEffect(() => {
    onChange(search);
  }, [search, onChange]);
  return null;
}

export function ShopBrowser({
  lang,
  rows,
  options,
  featured,
  offers,
  stats,
}: {
  lang: Lang;
  rows: ShopRow[];
  options: ShopOptions;
  featured: CardModel[];
  offers: Record<string, BundleOffer>;
  stats: ShopStats;
}) {
  const t = shopCopy(lang);
  const [state, setState] = useState<ShopState>(emptyState);
  const [ready, setReady] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const lastWritten = useRef<string | null>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const focusFrom = useRef<number | null>(null);

  const onParams = useCallback(
    (search: string) => {
      setReady(true);
      // Our own replaceState echoes back here; ignore it so fast typing is never undone.
      if (search === lastWritten.current) return;
      setState(parseState(search, options));
    },
    [options],
  );

  // Mirror the state into the address bar, a moment after the last change.
  useEffect(() => {
    if (!ready) return;
    const id = window.setTimeout(() => {
      const qs = serializeState(state);
      if (qs === window.location.search.replace(/^\?/, "")) return;
      lastWritten.current = qs;
      window.history.replaceState(window.history.state, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
    }, 250);
    return () => window.clearTimeout(id);
  }, [state, ready]);

  const results = useMemo(() => applyFilters(rows, state), [rows, state]);
  const counts = useMemo(() => facetCounts(rows, state), [rows, state]);
  const filtered = hasFilters(state);

  // How many cards are shown; resets whenever the result set changes.
  const signature = `${serializeState({ ...state, sort: "popular" })}|${state.sort}`;
  const [limit, setLimit] = useState({ signature, n: PAGE });
  const shown = limit.signature === signature ? limit.n : PAGE;
  const visible = results.slice(0, shown);
  const remaining = results.length - visible.length;

  useEffect(() => {
    const from = focusFrom.current;
    if (from === null) return;
    focusFrom.current = null;
    const links = gridRef.current?.querySelectorAll<HTMLAnchorElement>(":scope > li h3 a");
    links?.[from]?.focus();
  }, [shown]);

  function pick(key: FacetKey, value: string) {
    setState((s) => {
      const next = { ...s, [key]: value };
      if (key === "category" && value && s.subject) {
        const sub = options.subject.find((o) => o.id === s.subject);
        if (sub?.group !== value) next.subject = "";
      }
      if (key === "subject" && value) {
        const sub = options.subject.find((o) => o.id === value);
        if (sub?.group && s.category && sub.group !== s.category) next.category = sub.group;
      }
      return next;
    });
  }

  const labelOf = (key: FacetKey, id: string) => options[key].find((o) => o.id === id)?.label ?? id;
  const chips: { key: FacetKey | "q"; label: string }[] = [
    ...facetKeys.filter((k) => state[k]).map((k) => ({ key: k, label: labelOf(k, state[k]) })),
    ...(state.q.trim() ? [{ key: "q" as const, label: t.searchChip(state.q.trim()) }] : []),
  ];
  const activeFacets = facetKeys.filter((k) => state[k]).length;

  const clearAll = () => setState((s) => ({ ...emptyState, sort: s.sort }));

  // A bundle that covers exactly what is filtered: one subject, or one type.
  const offer =
    state.subject && !state.series
      ? offers[`subject:${state.subject}`]
      : state.series && !state.subject
        ? offers[`series:${state.series}`]
        : undefined;

  return (
    <>
      <Suspense fallback={null}>
        <ParamsListener onChange={onParams} />
      </Suspense>

      <header className="container-page pb-8 pt-10 sm:pt-14 lg:pb-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-subtle">{t.eyebrow}</p>
            <h1 className="mt-3 text-[clamp(32px,1.4rem+2.6vw,48px)] font-[650] leading-[1.08] tracking-[-0.02em]">
              {t.title}
            </h1>
            <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-muted">
              {t.intro(stats.files, stats.subjects, stats.series)}
            </p>
          </div>
          <SearchField lang={lang} value={state.q} onChange={(q) => setState((s) => ({ ...s, q }))} />
        </div>
      </header>

      <div className="container-page pb-24 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside aria-label={t.filters} className="hidden lg:block">
          <div className="no-scrollbar sticky top-[88px] max-h-[calc(100dvh-104px)] overflow-y-auto overscroll-contain pb-8 pr-1">
            <FilterPanel lang={lang} state={state} options={options} counts={counts} onPick={pick} />
          </div>
        </aside>

        <section aria-label={t.resultsLabel} className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 border-b border-line pb-4">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-haspopup="dialog"
              className={buttonClass({ variant: "secondary", size: "sm", className: "lg:hidden" })}
            >
              <SlidersHorizontal aria-hidden className="h-4 w-4" />
              {t.filters}
              {activeFacets ? (
                <span className="tabular grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[0.7rem] font-semibold text-brand-contrast">
                  {activeFacets}
                </span>
              ) : null}
            </button>
            <p aria-live="polite" aria-atomic="true" className="tabular text-sm text-muted">
              {t.count(results.length, rows.length)}
            </p>
            <SortSelect lang={lang} value={state.sort} onChange={(sort) => setState((s) => ({ ...s, sort }))} className="ml-auto" />
          </div>

          {chips.length ? (
            <div className="flex flex-wrap items-center gap-2 pt-4" role="group" aria-label={t.activeFilters}>
              {chips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setState((s) => ({ ...s, [c.key]: "" }))}
                  aria-label={t.removeFilter(c.label)}
                  className="group/chip inline-flex h-9 max-w-full items-center gap-1.5 rounded-full border border-line bg-surface pl-3.5 pr-2 text-sm text-text transition-colors duration-150 hover:border-line-strong hover:bg-surface-2"
                >
                  <span className="truncate">{c.label}</span>
                  <span className="grid h-5 w-5 place-items-center rounded-full text-subtle transition-colors duration-150 group-hover/chip:bg-bg group-hover/chip:text-text">
                    <X aria-hidden className="h-3.5 w-3.5" />
                  </span>
                </button>
              ))}
              {chips.length > 1 ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-brand hover:text-brand-strong hover:underline"
                >
                  {t.clearAll}
                </button>
              ) : null}
            </div>
          ) : null}

          {!filtered && featured.length ? <FeaturedBundles lang={lang} items={featured} /> : null}
          {offer && results.length ? <OfferBanner lang={lang} offer={offer} /> : null}

          {results.length ? (
            <>
              <ul
                ref={gridRef}
                aria-busy={!ready}
                className="grid grid-cols-2 gap-x-4 gap-y-10 pt-8 sm:grid-cols-3 sm:gap-x-6 xl:grid-cols-4"
              >
                {visible.map((r, i) => (
                  <li key={r.card.slug} className="flex">
                    <ProductCard item={r.card} lang={lang} priority={i < 4} className="w-full" />
                  </li>
                ))}
              </ul>
              {remaining > 0 ? (
                <div className="mt-12 flex flex-col items-center gap-3">
                  <p className="tabular text-sm text-subtle">{t.shownOf(visible.length, results.length)}</p>
                  <button
                    type="button"
                    onClick={() => {
                      focusFrom.current = visible.length;
                      setLimit({ signature, n: shown + PAGE });
                    }}
                    className={buttonClass({ variant: "secondary" })}
                  >
                    {t.showMore(Math.min(PAGE, remaining))}
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <EmptyState lang={lang} q={state.q.trim()} onClear={clearAll} />
          )}
        </section>
      </div>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} label={t.filtersTitle} side="left">
        <div className="flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
            <h2 className="font-sans text-base font-semibold tracking-normal">{t.filtersTitle}</h2>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              aria-label={t.closeFilters}
              className="-mr-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
            >
              <X aria-hidden className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
            <FilterPanel lang={lang} state={state} options={options} counts={counts} onPick={pick} />
          </div>
          <div className="flex shrink-0 gap-3 border-t border-line bg-bg-elev px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {filtered ? (
              <button type="button" onClick={clearAll} className={buttonClass({ variant: "ghost", className: "px-4" })}>
                {t.clearAll}
              </button>
            ) : null}
            <button type="button" onClick={() => setSheetOpen(false)} className={buttonClass({ className: "flex-1" })}>
              <span className="tabular">{t.showResults(results.length)}</span>
            </button>
          </div>
        </div>
      </Sheet>
    </>
  );
}

function SearchField({ lang, value, onChange }: { lang: Lang; value: string; onChange: (q: string) => void }) {
  const t = shopCopy(lang);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div role="search" className="w-full lg:w-[22rem] lg:shrink-0">
      <label htmlFor="shop-search" className="sr-only">
        {t.searchLabel}
      </label>
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-[1.05rem] w-[1.05rem] -translate-y-1/2 text-subtle" />
        <input
          ref={ref}
          id="shop-search"
          type="search"
          inputMode="search"
          autoComplete="off"
          enterKeyHint="search"
          spellCheck={false}
          maxLength={80}
          value={value}
          placeholder={t.searchPlaceholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && value) {
              e.preventDefault();
              onChange("");
            }
          }}
          className="h-12 w-full rounded-full border border-line bg-surface pl-11 pr-12 text-[0.95rem] text-text shadow-[var(--shadow-sm)] transition-[border-color,box-shadow] duration-150 placeholder:text-subtle hover:border-line-strong focus:border-brand focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-search-cancel-button]:appearance-none"
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              ref.current?.focus();
            }}
            aria-label={t.clearSearch}
            className="absolute right-1 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-subtle hover:bg-surface-2 hover:text-text"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function SortSelect({
  lang,
  value,
  onChange,
  className,
}: {
  lang: Lang;
  value: Sort;
  onChange: (s: Sort) => void;
  className?: string;
}) {
  const t = shopCopy(lang);
  return (
    <div className={clsx("flex items-center gap-2", className)}>
      <label htmlFor="shop-sort" className="hidden text-sm text-subtle sm:inline">
        {t.sortBy}
      </label>
      <div className="relative">
        <select
          id="shop-sort"
          value={value}
          aria-label={t.sortBy}
          onChange={(e) => onChange(e.target.value as Sort)}
          className="h-10 appearance-none rounded-full border border-line bg-surface pl-4 pr-9 text-sm font-medium text-text transition-colors duration-150 hover:border-line-strong focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {sorts.map((s) => (
            <option key={s} value={s}>
              {t.sorts[s]}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function FeaturedBundles({ lang, items }: { lang: Lang; items: CardModel[] }) {
  const t = shopCopy(lang);
  return (
    <section aria-labelledby="shop-bundles" className="border-b border-line pb-10 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h2 id="shop-bundles" className="font-sans text-xl font-semibold tracking-[-0.01em]">
            {t.bundlesTitle}
          </h2>
          <p className="mt-1 text-sm text-muted">{t.bundlesLine}</p>
        </div>
        <Link
          href={path("bundles", lang)}
          className="group/all inline-flex h-10 items-center gap-1.5 rounded-full text-sm font-medium text-brand hover:text-brand-strong"
        >
          {t.bundlesAll}
          <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-200 group-hover/all:translate-x-0.5" />
        </Link>
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4 sm:gap-x-6">
        {items.map((b) => (
          <li key={b.slug} className="flex">
            <ProductCard item={b} lang={lang} className="w-full" />
          </li>
        ))}
      </ul>
    </section>
  );
}

function OfferBanner({ lang, offer }: { lang: Lang; offer: BundleOffer }) {
  const t = shopCopy(lang);
  return (
    <div className="mt-6 flex flex-col gap-4 rounded-[var(--radius-lg)] border border-line bg-surface p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
      <div className="flex min-w-0 items-center gap-4">
        <PaperStack covers={offer.stack} alt="" className="w-14 shrink-0" />
        <div className="min-w-0">
          <p className="font-medium leading-snug text-text">{offer.title}</p>
          <p className="mt-1 text-sm text-muted">{t.bundleOffer(offer.files, formatIdr(offer.compareAt - offer.price))}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 sm:ml-auto sm:shrink-0">
        <Price value={offer.price} compareAt={offer.compareAt} lang={lang} />
        <Link href={offer.href} className={buttonClass({ variant: "secondary", size: "sm" })}>
          {t.bundleView}
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function EmptyState({ lang, q, onClear }: { lang: Lang; q: string; onClear: () => void }) {
  const t = shopCopy(lang);
  return (
    <div className="mt-8 flex flex-col items-center rounded-[var(--radius-lg)] border border-dashed border-line-strong px-6 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-surface-2 text-muted">
        <SearchX aria-hidden className="h-5 w-5" />
      </span>
      <h2 className="mt-5 font-sans text-lg font-semibold tracking-normal">{t.emptyTitle}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{q ? t.emptyQuery(q) : null} {t.emptyBody}</p>
      <button type="button" onClick={onClear} className={buttonClass({ className: "mt-6" })}>
        {t.clearFilters}
      </button>
    </div>
  );
}
