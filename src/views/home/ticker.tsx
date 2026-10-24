"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { formatCount } from "@/lib/format";
import type { Lang } from "@/lib/i18n";

/**
 * A count that runs up from zero the first time it scrolls into view (800 ms).
 * The server HTML already holds the final number, so it reads correctly
 * without JavaScript, and screen readers only ever hear the final value.
 */
export function Ticker({ value, lang, className }: { value: number; lang: Lang; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const reduce = useReducedMotion();
  const final = formatCount(value, lang);

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || reduce) return;
    const controls = animate(0, value, {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = formatCount(Math.round(v), lang);
      },
    });
    return () => {
      controls.stop();
      el.textContent = formatCount(value, lang);
    };
  }, [inView, reduce, value, lang]);

  return (
    <span className={className}>
      <span ref={ref} aria-hidden className="tabular">
        {final}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}
