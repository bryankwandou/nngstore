"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Info, ShoppingBag, X } from "lucide-react";
import { useMemo } from "react";
import { useCart } from "@/lib/cart";
import { useCatalogIndex, type IndexEntry } from "@/lib/catalog-index";
import { formatIdr } from "@/lib/format";
import { path, productPath, type Lang } from "@/lib/i18n";
import { common } from "@/content/common";
import { Sheet } from "@/components/ui/sheet";
import { buttonClass } from "@/components/ui/button";

const overlapNote = {
  en: (bundle: string) => `Already inside ${bundle}`,
  id: (bundle: string) => `Sudah termasuk di ${bundle}`,
} as const;

export function CartDrawer({ lang }: { lang: Lang }) {
  const t = common(lang).cart;
  const { slugs, ready, isOpen, close, remove } = useCart();
  const router = useRouter();
  const index = useCatalogIndex(isOpen || slugs.length > 0);

  const bySlug = useMemo(() => new Map(index.entries.map((e) => [e.s, e])), [index.entries]);
  const items = slugs.map((s) => bySlug.get(s)).filter((e): e is IndexEntry => Boolean(e));
  const subtotal = items.reduce((sum, e) => sum + e.p, 0);

  /* A single file that is also inside a bundle in the same cart would be paid twice. */
  const coveredBy = new Map<string, string>();
  for (const e of items) if (e.k === "bundle") for (const m of e.i ?? []) coveredBy.set(m, e.t[lang]);

  const loading = !ready || (slugs.length > 0 && index.status === "loading");

  return (
    <Sheet open={isOpen} onClose={close} label={t.title}>
      <div className="flex h-full flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <p className="font-display text-lg font-semibold tracking-tight">
            {t.title}
            {items.length > 0 ? (
              <span className="tabular ml-2 text-sm font-normal text-muted">{t.items(items.length)}</span>
            ) : null}
          </p>
          <button
            type="button"
            onClick={close}
            aria-label={t.close}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <ul className="space-y-4" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex gap-4">
                  <div className="h-[4.5rem] w-[3.2rem] animate-pulse rounded-md bg-surface-2" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3.5 w-4/5 animate-pulse rounded bg-surface-2" />
                    <div className="h-3 w-2/5 animate-pulse rounded bg-surface-2" />
                  </div>
                </li>
              ))}
            </ul>
          ) : index.status === "error" && slugs.length > 0 ? (
            <div className="rounded-lg border border-line bg-surface p-4 text-sm">
              <p>{lang === "id" ? "Daftar barang belum termuat." : "The item list did not load."}</p>
              <button
                type="button"
                onClick={index.retry}
                className="mt-3 font-medium text-brand underline-offset-4 hover:underline"
              >
                {common(lang).actions.retry}
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-muted">
                <ShoppingBag aria-hidden className="h-6 w-6" strokeWidth={1.6} />
              </span>
              <p className="font-medium">{t.empty}</p>
              <p className="mt-1 text-sm text-muted">{t.emptyHint}</p>
              <button
                type="button"
                onClick={() => {
                  close();
                  router.push(path("shop", lang));
                }}
                className={buttonClass({ variant: "secondary", size: "sm", className: "mt-6" })}
              >
                {t.browse}
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {items.map((e) => {
                const inside = e.k === "product" ? coveredBy.get(e.s) : undefined;
                return (
                  <li key={e.s} className="flex gap-4 py-4 first:pt-0">
                    <Link
                      href={productPath(e.s, lang)}
                      onClick={close}
                      className="relative block h-[4.5rem] w-[3.2rem] shrink-0 overflow-hidden rounded-md border border-line bg-white"
                    >
                      { }
                      <img src={e.c} alt="" className="h-full w-full object-cover object-top" loading="lazy" />
                      {e.k === "bundle" ? (
                        <span className="absolute inset-x-0 bottom-0 bg-text/80 py-0.5 text-center text-[0.6rem] font-semibold uppercase tracking-wider text-bg">
                          {lang === "id" ? "Paket" : "Bundle"}
                        </span>
                      ) : null}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={productPath(e.s, lang)}
                        onClick={close}
                        className="line-clamp-2 text-sm font-medium leading-snug hover:underline"
                      >
                        {e.t[lang]}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-muted">{e.m[lang]}</p>
                      {inside ? (
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-warning">
                          <Info aria-hidden className="h-3.5 w-3.5" />
                          {overlapNote[lang](inside)}
                        </p>
                      ) : null}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="tabular text-sm font-semibold">{formatIdr(e.p)}</span>
                        <button
                          type="button"
                          onClick={() => remove(e.s)}
                          className="-mr-2 inline-flex h-9 items-center rounded-full px-2 text-xs text-muted transition-colors hover:text-danger"
                        >
                          {t.remove}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <div className="shrink-0 border-t border-line bg-bg-elev px-5 pb-5 pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted">{t.subtotal}</span>
              <span className="tabular text-lg font-semibold">{formatIdr(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-muted">{t.note}</p>
            <Link
              href={path("checkout", lang)}
              onClick={close}
              className={buttonClass({ size: "lg", className: "mt-4 w-full" })}
            >
              {t.checkout}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        ) : null}
      </div>
    </Sheet>
  );
}
