"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import type { Lang } from "@/lib/i18n";
import { common } from "@/content/common";
import { productCopy } from "@/content/product";
import { Price } from "@/components/ui/price";
import { buttonClass } from "@/components/ui/button";

/**
 * Price and add button pinned to the bottom of small screens, shown only once
 * the buy buttons have scrolled up out of view. Hidden from lg up, where the
 * buy box itself is sticky.
 */
export function MobileBuyBar({
  lang,
  slug,
  title,
  price,
  compareAt,
  watch,
}: {
  lang: Lang;
  slug: string;
  title: string;
  price: number;
  compareAt?: number;
  /** id of the element whose departure shows the bar */
  watch: string;
}) {
  const t = common(lang).cart;
  const label = productCopy(lang).sticky.label;
  const reduce = useReducedMotion();
  const { has, add, open, ready } = useCart();
  const [show, setShow] = useState(false);
  const inCart = ready && has(slug);

  useEffect(() => {
    const el = document.getElementById(watch);
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => {
      setShow(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [watch]);

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          role="region"
          aria-label={label}
          initial={reduce ? { opacity: 0 } : { y: "100%" }}
          animate={reduce ? { opacity: 1 } : { y: 0 }}
          exit={reduce ? { opacity: 0 } : { y: "100%" }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg-elev/95 shadow-[var(--shadow-lg)] backdrop-blur-md lg:hidden"
        >
          <div className="container-page flex items-center gap-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-muted">{title}</p>
              <Price value={price} compareAt={compareAt} lang={lang} size="sm" />
            </div>
            {inCart ? (
              <button type="button" onClick={open} className={buttonClass({ variant: "secondary", size: "sm", className: "shrink-0" })}>
                <Check aria-hidden className="h-4 w-4 text-success" />
                {t.view}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  add(slug);
                  open();
                }}
                className={buttonClass({ size: "sm", className: "shrink-0" })}
              >
                <ShoppingBag aria-hidden className="h-4 w-4" />
                {t.add}
              </button>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
