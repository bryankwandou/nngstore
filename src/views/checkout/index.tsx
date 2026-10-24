import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { path, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { readLibrary } from "@/lib/server/library";
import { checkoutCopy } from "@/content/checkout";
import { CheckoutClient } from "./checkout-client";

export function checkoutMetadata(lang: Lang): Metadata {
  const t = checkoutCopy(lang).meta;
  return {
    ...pageMeta({ lang, bare: "/checkout", title: t.title, description: t.description }),
    robots: { index: false, follow: true },
  };
}

/**
 * Server part of checkout: reads this browser's library so a returning buyer
 * gets their email filled in and a note on files they already own. Everything
 * else (the cart lives in localStorage) happens in the client component.
 */
export async function CheckoutView({ lang }: { lang: Lang }) {
  const t = checkoutCopy(lang);
  const lib = await readLibrary();

  return (
    <div className="container-page pb-20 pt-8 sm:pb-24 sm:pt-12">
      <Link
        href={path("shop", lang)}
        className="-ml-2 inline-flex h-10 items-center gap-1.5 rounded-full px-2 text-sm text-muted transition-colors hover:text-text"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
        {t.backToShop}
      </Link>
      <header className="mb-8 mt-4 max-w-[65ch] sm:mb-10">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-subtle">{t.eyebrow}</p>
        <h1 className="mt-2 font-display text-[clamp(32px,1.4rem+2.6vw,48px)] font-semibold leading-[1.1] tracking-[-0.02em]">
          {t.title}
        </h1>
        <p className="mt-3 text-muted">{t.lead}</p>
      </header>
      <CheckoutClient lang={lang} owner={lib.owner} owned={lib.slugs} />
    </div>
  );
}
