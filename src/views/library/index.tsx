import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Cookie, Library as LibraryIcon } from "lucide-react";
import { getProduct, listProducts, type Product } from "@/data/catalog";
import { metaLine, toCardModel } from "@/lib/catalog-view";
import { formatIdr } from "@/lib/format";
import { path, readerPath, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { readLibrary, type LibraryOrder } from "@/lib/server/library";
import { site } from "@/content/common";
import { libraryCopy } from "@/content/library";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Paper } from "@/components/product/paper";
import { ProductCard } from "@/components/product/product-card";
import { ForgetButton } from "./forget-button";
import { OrderCheck } from "./order-check";

export { ReaderView, readerMetadata } from "./reader";

const noindex = { index: false, follow: false } as const;

export function libraryMetadata(lang: Lang): Metadata {
  const t = libraryCopy(lang).meta;
  return { ...pageMeta({ lang, bare: "/library", title: t.title, description: t.description }), robots: noindex };
}

function formatDate(iso: string, lang: Lang) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

const ORDER_RE = /^[A-Z0-9-]{4,60}$/;

/**
 * This browser's purchases, read from the signed library cookie. A `?order=`
 * parameter (the Midtrans finish redirect, or the hand-off from checkout)
 * either shows a success note, when that order is already granted, or starts
 * a client-side check that refreshes the page once the payment settles.
 */
export async function LibraryView({ lang, order }: { lang: Lang; order?: string }) {
  const t = libraryCopy(lang);
  const lib = await readLibrary();
  const orderId = order && ORDER_RE.test(order) ? order : undefined;
  const granted = orderId ? lib.orders.find((o) => o.id === orderId) : undefined;

  const files = lib.slugs.map((s) => getProduct(s)).filter((p): p is Product => Boolean(p));
  const modeOf = new Map(lib.orders.map((o) => [o.id, o.mode]));
  const isDemo = (slug: string) => modeOf.get(lib.orderOf[slug] ?? "") !== "midtrans";
  const filesPerOrder = (o: LibraryOrder) => Object.values(lib.orderOf).filter((id) => id === o.id).length;

  const header = (
    <header className="max-w-[65ch]">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-subtle">{t.eyebrow}</p>
      <h1 className="mt-2 font-display text-[clamp(32px,1.4rem+2.6vw,48px)] font-semibold leading-[1.1] tracking-[-0.02em]">
        {t.title}
      </h1>
    </header>
  );

  const checking = orderId && !granted ? (
    <div className="mt-8">
      <OrderCheck lang={lang} orderId={orderId} />
    </div>
  ) : null;

  /* ---------------- empty ---------------- */
  if (!lib.owner || files.length === 0) {
    const suggestions = listProducts().slice(0, 4);
    return (
      <div className="container-page pb-20 pt-10 sm:pb-24 sm:pt-14">
        {header}
        {checking}
        <section className="mt-10 flex flex-col items-start gap-5 rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:p-8">
          <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted">
            <LibraryIcon aria-hidden className="h-6 w-6" strokeWidth={1.6} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-sans text-xl font-semibold tracking-tight">{t.empty.title}</h2>
            <p className="mt-1.5 max-w-[60ch] text-muted">{t.empty.body}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink href={path("shop", lang)}>
                {t.empty.shop}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href={path("bundles", lang)} variant="secondary">
                {t.empty.bundles}
              </ButtonLink>
            </div>
          </div>
        </section>

        <p className="mt-6 text-sm text-muted">
          {t.empty.paidMissing} {t.empty.contact}{" "}
          <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="font-medium text-brand underline underline-offset-4">
            {site.instagramHandle}
          </a>
          .
        </p>

        <section aria-labelledby="lib-suggest" className="mt-16">
          <h2 id="lib-suggest" className="font-display text-[clamp(24px,1.2rem+1.4vw,36px)] font-semibold tracking-tight">
            {t.empty.suggestions}
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
            {suggestions.map((p) => (
              <li key={p.slug} className="min-w-0">
                <ProductCard item={toCardModel(p, lang)} lang={lang} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }

  /* ---------------- owned ---------------- */
  return (
    <div className="container-page pb-20 pt-10 sm:pb-24 sm:pt-14">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        {header}
        <div className="min-w-0 text-sm sm:text-right">
          <p className="text-muted">{t.licensedTo}</p>
          <p className="mt-0.5 truncate font-medium">{lib.owner.name}</p>
          <p className="truncate text-muted">{lib.owner.email}</p>
        </div>
      </div>

      {granted ? (
        <div
          role="status"
          className="mt-8 flex gap-3 rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)]"
        >
          <CheckCircle2 aria-hidden className={granted.mode === "demo" ? "mt-0.5 h-5 w-5 shrink-0 text-warning" : "mt-0.5 h-5 w-5 shrink-0 text-success"} />
          <div>
            <h2 className="font-sans text-base font-semibold">
              {granted.mode === "demo" ? t.success.demoTitle : t.success.title}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {granted.mode === "demo" ? t.success.demoBody(granted.id) : t.success.body(granted.id, filesPerOrder(granted))}
            </p>
          </div>
        </div>
      ) : null}
      {checking}

      <section aria-labelledby="lib-files" className="mt-12">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="lib-files" className="font-display text-[clamp(24px,1.2rem+1.4vw,36px)] font-semibold tracking-tight">
            {t.files}
          </h2>
          <span className="tabular text-sm text-muted">{t.count(files.length)}</span>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
          {files.map((p, i) => {
            const title = p.title[lang];
            return (
              <li key={p.slug} className="flex min-w-0 flex-col">
                <Link href={readerPath(p.slug, lang)} tabIndex={-1} aria-hidden className="block transition-transform duration-200 ease-out hover:-translate-y-0.5">
                  <Paper src={p.images.cover} alt="" priority={i < 4} />
                </Link>
                <h3 className="mt-3 line-clamp-2 font-sans text-[0.95rem] font-medium leading-snug tracking-normal">{title}</h3>
                <p className="mt-1 line-clamp-1 text-[0.82rem] text-muted">{metaLine(p, lang)}</p>
                {isDemo(p.slug) ? (
                  <Badge tone="warning" className="mt-2 self-start">
                    {t.demoBadge}
                  </Badge>
                ) : null}
                <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3">
                  <ButtonLink href={readerPath(p.slug, lang)} size="sm" aria-label={t.readLabel(title)}>
                    <BookOpen aria-hidden className="h-4 w-4" />
                    {t.read}
                  </ButtonLink>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-12">
        <section aria-labelledby="lib-orders" className="min-w-0">
          <h2 id="lib-orders" className="font-sans text-xl font-semibold tracking-tight">
            {t.orders.title}
          </h2>
          <ul className="mt-4 divide-y divide-line rounded-[var(--radius-lg)] border border-line bg-surface">
            {lib.orders.map((o) => (
              <li key={o.id} className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-4 text-sm sm:grid-cols-[minmax(0,1.6fr)_1fr_auto_auto] sm:items-center sm:px-5">
                <div className="col-span-2 min-w-0 sm:col-span-1">
                  <span className="sr-only">{t.orders.order}: </span>
                  <span className="tabular block truncate font-mono text-[0.82rem]">{o.id}</span>
                </div>
                <div className="text-muted">
                  <span className="sr-only">{t.orders.date}: </span>
                  {formatDate(o.at, lang)}
                  <span className="text-subtle"> · {t.count(filesPerOrder(o))}</span>
                </div>
                <div className="text-right sm:text-left">
                  <Badge tone={o.mode === "demo" ? "warning" : "success"}>
                    <span className="sr-only">{t.orders.status}: </span>
                    {o.mode === "demo" ? t.orders.demo : t.orders.paid}
                  </Badge>
                </div>
                <div className="tabular col-span-2 font-medium sm:col-span-1 sm:text-right">
                  <span className="sr-only">{t.orders.total}: </span>
                  {formatIdr(o.total)}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="min-w-0 space-y-6">
          <section aria-labelledby="lib-note" className="rounded-[var(--radius-lg)] border border-line bg-surface-2 p-5">
            <h2 id="lib-note" className="flex items-center gap-2 font-sans text-base font-semibold">
              <Cookie aria-hidden className="h-4 w-4 text-muted" />
              {t.note.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t.note.body}</p>
            <Link href={path("help", lang)} className="mt-3 inline-flex min-h-10 items-center text-sm font-medium text-brand underline-offset-4 hover:underline">
              {t.note.help}
            </Link>
          </section>
          <ForgetButton lang={lang} />
        </aside>
      </div>
    </div>
  );
}
