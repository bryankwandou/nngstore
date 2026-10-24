"use client";

import { useEffect, useState, type ReactNode } from "react";
import { clsx } from "clsx";

/**
 * The sticky bar. It is fully transparent at the top of a page and picks up a
 * hairline and a frosted background once the page scrolls under it.
 */
export function HeaderBar({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300",
        scrolled
          ? "border-line bg-bg/80 shadow-[0_1px_0_0_var(--line)] backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-bg/0",
      )}
    >
      {children}
    </header>
  );
}
