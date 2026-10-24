"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion, type TargetAndTransition, type Transition } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Paper } from "@/components/product/paper";

export type StackItem = {
  slug: string;
  href: string;
  title: string;
  chip: string;
  cover: string;
  price: string;
};

type Labels = {
  stackLabel: string;
  next: string;
  prev: string;
  open: string;
  position: string;
};

/* Resting place of each depth in the pile: 0 is the top page. */
const FAN = [
  { x: "0%", y: 0, rotate: -2, scale: 1 },
  { x: "17%", y: 8, rotate: 5, scale: 0.965 },
  { x: "-17%", y: 12, rotate: -7, scale: 0.94 },
  { x: "30%", y: 22, rotate: 10, scale: 0.915 },
  { x: "-29%", y: 26, rotate: -12, scale: 0.89 },
];

const EASE_ENTER = [0.22, 1, 0.36, 1] as const;

type Flight = { slug: string; dir: 1 | -1; n: number } | null;

/**
 * Five real covers fanned like a pile of printouts. Selecting the top page
 * (click, tap, Enter, or the arrow keys while the pile has focus) sends it to
 * the back; the previous button brings the bottom page back to the top. The
 * caption below always names and links the page on top.
 */
export function HeroStack({ items, labels }: { items: StackItem[]; labels: Labels }) {
  const reduce = useReducedMotion();
  const [order, setOrder] = useState(() => items.map((_, i) => i));
  const [flight, setFlight] = useState<Flight>(null);
  const n = items.length;
  const top = items[order[0]];
  const last = Math.min(n, FAN.length) - 1;

  function next() {
    setFlight((f) => ({ slug: items[order[0]].slug, dir: 1, n: (f?.n ?? 0) + 1 }));
    setOrder((o) => [...o.slice(1), o[0]]);
  }

  function prev() {
    setFlight((f) => ({ slug: items[order[n - 1]].slug, dir: -1, n: (f?.n ?? 0) + 1 }));
    setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      prev();
    }
  }

  const firstRun = flight === null;

  return (
    <div className="flex flex-col items-center">
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={labels.stackLabel}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="relative aspect-[1/1.12] w-full max-w-[27rem] rounded-[var(--radius-xl)] outline-offset-4 sm:aspect-[1/1.08]"
      >
        {items.map((item, i) => {
          const pos = order.indexOf(i);
          const depth = Math.min(pos, last);
          const rest = FAN[depth];
          const z = 20 - pos;
          const isTop = pos === 0;
          const flying = !reduce && flight?.slug === item.slug;

          let target: TargetAndTransition = { ...rest, zIndex: z };
          let transition: Transition = reduce
            ? { duration: 0 }
            : firstRun
              ? { duration: 0.6, delay: 0.15 + pos * 0.05, ease: EASE_ENTER }
              : { duration: 0.45, ease: EASE_ENTER };

          if (flying && flight) {
            if (flight.dir === 1) {
              /* Top page slides out to the right, then tucks in behind the pile. */
              target = {
                x: ["0%", "68%", rest.x],
                y: [0, -18, rest.y],
                rotate: [FAN[0].rotate, 14, rest.rotate],
                scale: [1, 0.98, rest.scale],
                zIndex: [40, 40, z, z],
              };
            } else {
              /* Bottom page slides out to the left, then lands on top. */
              const from = FAN[last];
              target = {
                x: [from.x, "-68%", rest.x],
                y: [from.y, -18, rest.y],
                rotate: [from.rotate, -14, rest.rotate],
                scale: [from.scale, 0.98, rest.scale],
                zIndex: [1, 1, 40, z],
              };
            }
            transition = {
              duration: 0.45,
              ease: EASE_ENTER,
              times: [0, 0.45, 1],
              zIndex: { duration: 0.45, times: [0, 0.44, 0.46, 1], ease: "linear" },
            };
          }

          return (
            <motion.div
              key={item.slug}
              initial={reduce ? false : firstRun ? { x: "0%", y: 14, rotate: 0, scale: 0.96, zIndex: z } : false}
              animate={target}
              transition={transition}
              className="absolute left-[21%] top-[5%] w-[58%] will-change-transform"
              aria-hidden={isTop ? undefined : true}
            >
              {isTop ? (
                <div onClick={next} className="group/top block w-full cursor-pointer rounded-[var(--radius-md)]">
                  <div className="transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] [@media(hover:hover)]:group-hover/top:-translate-y-1">
                    <Paper
                      src={item.cover}
                      alt=""
                      priority
                      className="shadow-[var(--shadow-lg)]"
                    >
                      <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-full bg-white/92 px-2 py-0.5 text-[0.66rem] font-semibold uppercase tracking-[0.06em] text-[#1a1a22] shadow-[var(--shadow-sm)]">
                        {item.chip}
                      </span>
                      <span className="pointer-events-none absolute bottom-2.5 right-2.5 rounded-full bg-[#14141a]/88 px-2.5 py-1 text-xs font-semibold text-white tabular">
                        {item.price}
                      </span>
                    </Paper>
                  </div>
                </div>
              ) : (
                <Paper src={item.cover} alt="" priority={pos < 2} className="shadow-[var(--shadow-md)]" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Caption: names and links the page on top. */}
      <div className="mt-2 flex w-full max-w-[27rem] items-center gap-3">
        <button
          type="button"
          onClick={prev}
          aria-label={labels.prev}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted transition-colors duration-150 hover:border-line-strong hover:text-text"
        >
          <ChevronLeft aria-hidden className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1 text-center" aria-live="polite">
          <Link
            href={top.href}
            className="group/cap inline-flex max-w-full items-center gap-1.5 rounded-md text-sm font-medium text-text hover:text-brand"
          >
            <span className="truncate">{top.title}</span>
            <ArrowRight
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-hover/cap:translate-x-0.5"
            />
          </Link>
          <p className="mt-0.5 text-xs text-subtle tabular">
            {top.price} · {labels.position.replace("{i}", String(order[0] + 1)).replace("{n}", String(n))}
          </p>
        </div>
        <button
          type="button"
          onClick={next}
          aria-label={labels.next}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted transition-colors duration-150 hover:border-line-strong hover:text-text"
        >
          <ChevronRight aria-hidden className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
