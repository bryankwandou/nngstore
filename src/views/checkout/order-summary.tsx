"use client";

import Link from "next/link";
import { BookOpenCheck, Info, Package } from "lucide-react";
import { clsx } from "clsx";
import type { IndexEntry } from "@/lib/catalog-index";
import { formatIdr } from "@/lib/format";
import { productPath, type Lang } from "@/lib/i18n";
import { checkoutCopy } from "@/content/checkout";

export type SummaryLine = {
  entry: IndexEntry;
  /** Bundle members resolved from the index (empty for products). */
  members: IndexEntry[];
  /** The buyer already owns this file (or every file of this bundle) in this browser. */
  owned: boolean;
  /** Title of a bundle in the same cart that already contains this file. */
  insideBundle?: string;
};

export function OrderSummary({
  lang,
  lines,
  total,
  locked,
  onRemove,
}: {
  lang: Lang;
  lines: SummaryLine[];
  total: number;
  /** While a payment is open the cart cannot change. */
  locked: boolean;
  onRemove: (slug: string) => void;
}) {
  const t = checkoutCopy(lang).summary;
  const saving = lines.reduce((s, l) => s + (l.entry.ca && l.entry.ca > l.entry.p ? l.entry.ca - l.entry.p : 0), 0);

  return (
    <section
      aria-labelledby="summary-title"
      className="rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-sm)]"
    >
      <div className="flex items-baseline justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
        <h2 id="summary-title" className="font-sans text-base font-semibold tracking-normal">
          {t.title}
        </h2>
        <span className="tabular text-sm text-muted">{t.items(lines.length)}</span>
      </div>

      <ul className="divide-y divide-line px-5 sm:px-6">
        {lines.map((l) => {
          const e = l.entry;
          const isBundle = e.k === "bundle";
          return (
            <li key={e.s} className="flex gap-3.5 py-4">
              <Link
                href={productPath(e.s, lang)}
                tabIndex={-1}
                aria-hidden
                className="relative block h-[4.6rem] w-[3.25rem] shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-black/10 bg-white shadow-[var(--shadow-sm)]"
              >
                { }
                <img src={e.c} alt="" width={52} height={74} loading="lazy" decoding="async" className="h-full w-full object-cover object-top" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={productPath(e.s, lang)}
                    className="line-clamp-2 text-sm font-medium leading-snug underline-offset-4 hover:underline"
                  >
                    {e.t[lang]}
                  </Link>
                  <span className="tabular shrink-0 text-sm font-semibold">{formatIdr(e.p)}</span>
                </div>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                  {isBundle ? <Package aria-hidden className="h-3.5 w-3.5 shrink-0" /> : null}
                  <span className="truncate">{isBundle ? `${t.bundle} · ${t.files(l.members.length || (e.i?.length ?? 0))}` : e.m[lang]}</span>
                </p>
                {isBundle && e.ca && e.ca > e.p ? (
                  <p className="tabular mt-0.5 text-xs text-subtle">
                    <span className="line-through">{formatIdr(e.ca)}</span>
                  </p>
                ) : null}

                {l.owned ? (
                  <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-warning">
                    <BookOpenCheck aria-hidden className="h-3.5 w-3.5 shrink-0" />
                    {t.owned}
                  </p>
                ) : null}
                {l.insideBundle ? (
                  <p className="mt-1.5 flex items-start gap-1 text-xs text-warning">
                    <Info aria-hidden className="mt-px h-3.5 w-3.5 shrink-0" />
                    <span>{t.inside(l.insideBundle)}</span>
                  </p>
                ) : null}

                {isBundle && l.members.length > 0 ? (
                  <details className="group mt-2 text-xs">
                    <summary className="inline-flex min-h-8 cursor-pointer list-none items-center gap-1 rounded-sm font-medium text-brand [&::-webkit-details-marker]:hidden">
                      <span className="inline-block transition-transform duration-150 group-open:rotate-90" aria-hidden>
                        ›
                      </span>
                      {t.showFiles}
                    </summary>
                    <ul className="mt-1.5 space-y-1 border-l border-line pl-3 text-muted">
                      {l.members.map((m) => (
                        <li key={m.s} className="line-clamp-1">
                          {m.t[lang]}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}

                {!locked ? (
                  <button
                    type="button"
                    onClick={() => onRemove(e.s)}
                    aria-label={t.removeLabel(e.t[lang])}
                    className="-ml-2 mt-1 inline-flex h-9 items-center rounded-full px-2 text-xs text-muted transition-colors duration-150 hover:text-danger"
                  >
                    {t.remove}
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <dl className="space-y-2 border-t border-line px-5 py-4 text-sm sm:px-6">
        {saving > 0 ? (
          <>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">{t.subtotal}</dt>
              <dd className="tabular">{formatIdr(total + saving)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">{t.saving}</dt>
              <dd className="tabular text-success">-{formatIdr(saving)}</dd>
            </div>
          </>
        ) : null}
        <div className={clsx("flex items-baseline justify-between gap-3", saving > 0 && "border-t border-line pt-3")}>
          <dt className="font-medium">{t.total}</dt>
          <dd className="tabular text-xl font-semibold tracking-tight">{formatIdr(total)}</dd>
        </div>
      </dl>
      <p className="flex items-center gap-2 rounded-b-[var(--radius-lg)] border-t border-line bg-surface-2 px-5 py-3 text-xs text-muted sm:px-6">
        <BookOpenCheck aria-hidden className="h-4 w-4 shrink-0 text-success" />
        {t.delivery}
      </p>
    </section>
  );
}

export function OrderSummarySkeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-6"
    >
      <div className="h-4 w-1/3 animate-pulse rounded bg-surface-2 motion-reduce:animate-none" />
      {[0, 1].map((i) => (
        <div key={i} className="mt-5 flex gap-3.5">
          <div className="h-[4.6rem] w-[3.25rem] animate-pulse rounded-[var(--radius-sm)] bg-surface-2 motion-reduce:animate-none" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3.5 w-4/5 animate-pulse rounded bg-surface-2 motion-reduce:animate-none" />
            <div className="h-3 w-2/5 animate-pulse rounded bg-surface-2 motion-reduce:animate-none" />
          </div>
        </div>
      ))}
      <div className="mt-6 h-5 w-full animate-pulse rounded bg-surface-2 motion-reduce:animate-none" />
    </div>
  );
}
