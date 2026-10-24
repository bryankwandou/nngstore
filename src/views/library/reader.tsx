import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { getProduct } from "@/data/catalog";
import { metaLine } from "@/lib/catalog-view";
import { path, productPath, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { ownsSlug, readLibrary } from "@/lib/server/library";
import { mintReadToken } from "@/lib/server/read-token";
import { libraryCopy } from "@/content/library";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Paper } from "@/components/product/paper";
import { ReaderClient } from "@/components/reader/ReaderClient";

export function readerMetadata(lang: Lang, slug: string): Metadata {
  const p = getProduct(slug);
  return {
    ...pageMeta({ lang, bare: `/library/${slug}`, title: p ? p.title[lang] : libraryCopy(lang).meta.title }),
    robots: { index: false, follow: false },
  };
}

/**
 * The protected reader for one purchased file. Ownership is checked against
 * the signed library cookie; the PDF itself comes from /api/read/{slug} with a
 * 10-minute token minted here for this file and this buyer.
 */
export async function ReaderView({ lang, slug }: { lang: Lang; slug: string }) {
  const product = getProduct(slug);
  if (!product) notFound();
  const t = libraryCopy(lang);
  const title = product.title[lang];
  const lib = await readLibrary();

  if (!lib.owner || !ownsSlug(lib, slug)) {
    return (
      <div className="container-page pb-20 pt-10 sm:pb-24 sm:pt-14">
        <div className="mx-auto grid max-w-3xl items-center gap-8 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-10">
          <div className="relative mx-auto w-32 sm:w-full">
            <Paper src={product.images.cover} alt="" className="opacity-60" />
            <span className="absolute left-1/2 top-1/2 inline-flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-text shadow-[var(--shadow-md)]">
              <Lock aria-hidden className="h-5 w-5" />
            </span>
          </div>
          <div className="min-w-0 text-center sm:text-left">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-subtle">{t.reader.lockedEyebrow}</p>
            <h1 className="mt-2 font-display text-[clamp(26px,1.2rem+2vw,38px)] font-semibold leading-[1.15] tracking-[-0.02em]">
              {t.reader.lockedTitle}
            </h1>
            <p className="mt-2 text-sm font-medium">{title}</p>
            <p className="mt-3 text-muted">{t.reader.lockedBody}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
              <ButtonLink href={productPath(slug, lang)}>{t.reader.viewProduct}</ButtonLink>
              <ButtonLink href={path("library", lang)} variant="secondary">
                {t.reader.openLibrary}
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const token = mintReadToken(slug, lib.owner.email);
  const url = `/api/read/${encodeURIComponent(slug)}?t=${encodeURIComponent(token)}`;
  const orderId = lib.orderOf[slug];
  const demo = lib.orders.find((o) => o.id === orderId)?.mode !== "midtrans";

  return (
    <div className="container-page pb-16 pt-6 sm:pt-8">
      <Link
        href={path("library", lang)}
        className="-ml-2 inline-flex h-10 items-center gap-1.5 rounded-full px-2 text-sm text-muted transition-colors hover:text-text"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
        {t.reader.back}
      </Link>
      <header className="mb-6 mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-[clamp(24px,1.1rem+1.8vw,34px)] font-semibold leading-[1.15] tracking-[-0.02em]">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted">{metaLine(product, lang)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted sm:justify-end">
          {demo ? <Badge tone="warning">{t.reader.demoNote}</Badge> : null}
          <span>{t.reader.licensed(lib.owner.name)}</span>
        </div>
      </header>
      <ReaderClient url={url} buyerName={lib.owner.name} lang={lang} title={title} />
      <p className="mt-4 text-xs text-muted">{t.reader.reload}</p>
    </div>
  );
}
