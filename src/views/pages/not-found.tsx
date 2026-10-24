import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { path, routes, type Lang, type RouteKey } from "@/lib/i18n";
import { notFoundCopy } from "@/content/not-found";
import { Button } from "@/components/ui/button";
import { Stagger } from "@/components/motion/reveal";

export function notFoundMetadata(lang: Lang): Metadata {
  const t = notFoundCopy(lang);
  return { title: t.meta.title, description: t.meta.description, robots: { index: false } };
}

function routeKey(key: string): RouteKey {
  return Object.prototype.hasOwnProperty.call(routes, key) ? (key as RouteKey) : "home";
}

/**
 * The search box is a plain GET form to the shop, which reads ?q= and filters
 * the grid, so it works before (or without) JavaScript.
 */
export function NotFoundView({ lang }: { lang: Lang }) {
  const t = notFoundCopy(lang);
  return (
    <div className="container-page py-16 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-20">
        <div className="max-w-[65ch]">
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-subtle">{t.eyebrow}</p>
          <h1 className="mt-3 font-display text-[clamp(32px,1.4rem+2.6vw,48px)] font-semibold leading-[1.1] tracking-[-0.025em] text-text">
            {t.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">{t.body}</p>

          <form action={path("shop", lang)} method="get" role="search" className="mt-8">
            <label htmlFor="nf-q" className="text-sm font-medium text-text">
              {t.searchLabel}
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
                />
                <input
                  id="nf-q"
                  name="q"
                  type="search"
                  autoComplete="off"
                  enterKeyHint="search"
                  placeholder={t.searchPlaceholder}
                  className="h-12 w-full rounded-[var(--radius-sm)] border border-line-strong bg-surface pl-10 pr-3 text-base text-text placeholder:text-subtle focus-visible:border-brand"
                />
              </div>
              <Button type="submit" size="lg" className="sm:w-auto">
                {t.searchButton}
              </Button>
            </div>
          </form>

          <Link
            href={path("home", lang)}
            className="mt-8 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-text"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            {t.home}
          </Link>
        </div>

        <nav aria-labelledby="nf-popular">
          <h2 id="nf-popular" className="text-xs font-medium uppercase tracking-[0.08em] text-subtle">
            {t.popularTitle}
          </h2>
          <Stagger as="ul" className="mt-4 divide-y divide-line border-y border-line">
            {t.links.map((l) => (
              <li key={l.key}>
                <Link
                  href={path(routeKey(l.key), lang)}
                  className="group flex items-center justify-between gap-4 py-4 transition-colors"
                >
                  <span className="min-w-0">
                    <span className="block font-medium text-text group-hover:text-brand">{l.label}</span>
                    <span className="mt-0.5 block text-sm text-muted">{l.hint}</span>
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-subtle transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-brand"
                  />
                </Link>
              </li>
            ))}
          </Stagger>
        </nav>
      </div>
    </div>
  );
}
