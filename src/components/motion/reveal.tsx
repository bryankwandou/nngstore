"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { clsx } from "clsx";

/**
 * Entrance motion used across the site.
 *
 * The server HTML always carries the final, visible state. Hiding only starts
 * once the inline script has put `js` on <html>, and a CSS failsafe reveals
 * everything after 2.5 s even if hydration never arrives. A button that only
 * exists after JavaScript runs is a button some visitors never see.
 *
 * Rules: enter once, travel 16 px, slow down at the end, nothing at all under
 * prefers-reduced-motion (handled in globals.css).
 */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.dataset.in = "";
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.in = "";
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

type Tag = "div" | "section" | "li" | "ul" | "ol" | "span" | "header" | "article";

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
  id,
}: {
  children: ReactNode;
  /** milliseconds */
  delay?: number;
  className?: string;
  as?: Tag;
  id?: string;
}) {
  const ref = useInView<HTMLElement>();
  const Comp = as as "div";
  return (
    <Comp
      ref={ref as React.RefObject<HTMLDivElement>}
      id={id}
      data-reveal=""
      className={className}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Comp>
  );
}

/** Children enter one after another, 50 ms apart, first eight only. */
export function Stagger({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: Tag;
}) {
  const ref = useInView<HTMLElement>();
  const Comp = as as "div";
  return (
    <Comp ref={ref as React.RefObject<HTMLDivElement>} data-stagger="" className={clsx(className)}>
      {children}
    </Comp>
  );
}
