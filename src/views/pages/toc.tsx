"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

type Entry = { id: string; title: string };

/**
 * Table of contents for the legal pages. Plain anchor links work without
 * JavaScript; once hydrated, the section in view is marked as current.
 */
export function Toc({ label, entries }: { label: string; entries: readonly Entry[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const els = entries
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => Boolean(el));
    const visible = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (records) => {
        for (const r of records) visible.set(r.target.id, r.isIntersecting);
        const first = entries.find((e) => visible.get(e.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-96px 0px -55% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [entries]);

  return (
    <nav aria-label={label}>
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-subtle">{label}</p>
      <ol className="mt-3 space-y-0.5 border-l border-line">
        {entries.map((e) => {
          const current = active === e.id;
          return (
            <li key={e.id}>
              <a
                href={`#${e.id}`}
                aria-current={current ? "location" : undefined}
                className={clsx(
                  "-ml-px block border-l-2 py-1.5 pl-4 pr-2 text-sm leading-snug transition-colors duration-150",
                  current
                    ? "border-brand font-medium text-text"
                    : "border-transparent text-muted hover:border-line-strong hover:text-text",
                )}
              >
                {e.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
