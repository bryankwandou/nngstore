"use client";

import { ShoppingBag } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCart } from "@/lib/cart";

export function CartButton({ label }: { label: string }) {
  const { slugs, ready, open } = useCart();
  const reduce = useReducedMotion();
  const count = ready ? slugs.length : 0;

  return (
    <button
      type="button"
      onClick={open}
      aria-label={count ? `${label} (${count})` : label}
      title={label}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-text transition-colors duration-200 hover:bg-surface-2"
    >
      <ShoppingBag aria-hidden className="h-[1.2rem] w-[1.2rem]" strokeWidth={1.8} />
      <AnimatePresence initial={false}>
        {count > 0 ? (
          <motion.span
            key={count}
            aria-hidden
            initial={reduce ? false : { scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduce ? undefined : { scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 26 }}
            className="tabular absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[0.68rem] font-semibold leading-none text-brand-contrast ring-2 ring-bg"
          >
            {count}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </button>
  );
}
