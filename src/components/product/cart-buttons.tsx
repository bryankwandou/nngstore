"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Check, Plus, ShoppingBag } from "lucide-react";
import { clsx } from "clsx";
import { useCart } from "@/lib/cart";
import { path, type Lang } from "@/lib/i18n";
import { common } from "@/content/common";
import { buttonClass } from "@/components/ui/button";

/** Round icon button on product cards. Adds without opening the drawer, so several items can be picked in a row. */
export function QuickAdd({ slug, title, lang }: { slug: string; title: string; lang: Lang }) {
  const t = common(lang).cart;
  const { has, toggle, ready } = useCart();
  const inCart = ready && has(slug);
  const label = inCart ? `${t.remove}: ${title}` : `${t.add}: ${title}`;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      aria-pressed={inCart}
      aria-label={label}
      title={inCart ? t.added : t.add}
      className={clsx(
        "relative z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,color,transform] duration-150 active:scale-90",
        inCart
          ? "border-brand bg-brand text-brand-contrast"
          : "border-line bg-surface text-text hover:border-line-strong hover:bg-surface-2",
      )}
    >
      <Plus
        aria-hidden
        className={clsx("absolute h-4 w-4 transition-[transform,opacity] duration-150", inCart ? "rotate-90 scale-50 opacity-0" : "")}
      />
      <Check
        aria-hidden
        className={clsx("absolute h-4 w-4 transition-[transform,opacity] duration-150", inCart ? "" : "-rotate-90 scale-50 opacity-0")}
      />
    </button>
  );
}

/** Main buttons on a product page: add (opens the drawer) and buy now (goes straight to checkout). */
export function BuyButtons({ slug, lang, className }: { slug: string; lang: Lang; className?: string }) {
  const t = common(lang);
  const { has, add, open, ready } = useCart();
  const router = useRouter();
  const inCart = ready && has(slug);

  return (
    <div className={clsx("grid gap-3 sm:grid-cols-2", className)}>
      {inCart ? (
        <button type="button" onClick={open} className={buttonClass({ variant: "secondary", size: "lg" })}>
          <Check aria-hidden className="h-4 w-4 text-success" />
          {t.cart.added}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            add(slug);
            open();
          }}
          className={buttonClass({ variant: "secondary", size: "lg" })}
        >
          <ShoppingBag aria-hidden className="h-4 w-4" />
          {t.cart.add}
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          add(slug);
          router.push(path("checkout", lang));
        }}
        className={buttonClass({ size: "lg" })}
      >
        {t.actions.buyNow}
        <ArrowRight aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}
