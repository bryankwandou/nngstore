"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";

type Labels = {
  viewerLabel: string;
  /** One label per preview page, already filled in on the server. */
  page: string[];
  prev: string;
  next: string;
  thumbs: string;
  thumb: string[];
  rule: string;
};

/**
 * Inline preview of a real product's preview pages: arrows, arrow keys,
 * swipe, thumbnails and a page counter. Page turns take 250 ms and become a
 * plain swap under reduced motion. The images are the same watermarked,
 * pre-blurred files the product page serves; nothing beyond them is loaded.
 */
export function LookInside({ pages, labels }: { pages: string[]; labels: Labels }) {
  const reduce = useReducedMotion();
  const [[index, dir], setState] = useState<[number, number]>([0, 0]);
  const start = useRef<number | null>(null);
  const n = pages.length;

  function go(to: number) {
    const clamped = Math.max(0, Math.min(n - 1, to));
    if (clamped === index) return;
    setState([clamped, clamped > index ? 1 : -1]);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    }
  }

  const arrow =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-text shadow-[var(--shadow-sm)] transition-[background-color,border-color,opacity] duration-150 hover:border-line-strong hover:bg-surface-2 disabled:opacity-40 disabled:pointer-events-none";

  return (
    <div className="flex flex-col items-center">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={labels.viewerLabel}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          start.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (start.current === null) return;
          const dx = e.clientX - start.current;
          start.current = null;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        }}
        className="relative w-full max-w-[26rem] touch-pan-y select-none rounded-[var(--radius-md)] outline-offset-4"
      >
        <div className="relative aspect-[1/1.414] overflow-hidden rounded-[var(--radius-md)] border border-black/10 bg-white shadow-[var(--shadow-lg)]">
          <AnimatePresence initial={false} custom={dir}>
            <motion.img
              key={pages[index]}
              src={pages[index]}
              alt={labels.page[index]}
              width={800}
              height={1131}
              draggable={false}
              decoding="async"
              custom={dir}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -28 }}
              transition={{ duration: reduce ? 0 : 0.25, ease: [0.2, 0, 0, 1] }}
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-5 flex w-full max-w-[26rem] items-center justify-between gap-3">
        <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label={labels.prev} className={arrow}>
          <ChevronLeft aria-hidden className="h-4 w-4" />
        </button>
        <p className="text-sm text-muted tabular" aria-live="polite">
          {labels.page[index]}
        </p>
        <button
          type="button"
          onClick={() => go(index + 1)}
          disabled={index === n - 1}
          aria-label={labels.next}
          className={arrow}
        >
          <ChevronRight aria-hidden className="h-4 w-4" />
        </button>
      </div>

      <ul aria-label={labels.thumbs} className="mt-4 flex gap-3">
        {pages.map((p, i) => (
          <li key={p}>
            <button
              type="button"
              onClick={() => go(i)}
              aria-label={labels.thumb[i]}
              aria-current={i === index ? "true" : undefined}
              className={clsx(
                "block w-12 overflow-hidden rounded-[var(--radius-sm)] border bg-white transition-[border-color,transform,opacity] duration-150",
                i === index ? "border-brand opacity-100 ring-2 ring-brand/30" : "border-line opacity-70 hover:opacity-100",
              )}
            >
              { }
              <img src={p} alt="" width={48} height={68} loading="lazy" className="aspect-[1/1.414] w-full object-cover object-top" />
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-4 max-w-[26rem] text-center text-xs text-subtle">{labels.rule}</p>
    </div>
  );
}
