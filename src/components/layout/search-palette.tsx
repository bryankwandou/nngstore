"use client";

import { useRouter } from "next/navigation";
import { CornerDownLeft, Search, X } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
import { searchIndex, useCatalogIndex } from "@/lib/catalog-index";
import { formatIdr } from "@/lib/format";
import { path, productPath, type Lang } from "@/lib/i18n";
import { common } from "@/content/common";
import { Sheet } from "@/components/ui/sheet";

const copy = {
  en: {
    hint: "Try a subject, a type or a level: \"answer key buddhist\", \"HOTS english\", \"SMP\".",
    none: (q: string) => `Nothing matches "${q}".`,
    noneHint: "Check the spelling or browse the whole shop.",
    browse: "Browse the shop",
    open: "Open",
    move: "Move",
    close: "Close",
    results: (n: number) => `${n} results`,
  },
  id: {
    hint: "Coba nama pelajaran, jenis, atau jenjang: \"kunci jawaban buddha\", \"HOTS inggris\", \"SMP\".",
    none: (q: string) => `Tidak ada yang cocok dengan "${q}".`,
    noneHint: "Periksa ejaannya atau lihat seluruh toko.",
    browse: "Lihat toko",
    open: "Buka",
    move: "Pindah",
    close: "Tutup",
    results: (n: number) => `${n} hasil`,
  },
} as const;

/** Opens the search palette from anywhere: Ctrl/Cmd+K, or "/" when not typing. */
export function useSearchShortcut(open: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement &&
        (e.target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName));
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        open();
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
}

export function SearchPalette({
  lang,
  open,
  onClose,
}: {
  lang: Lang;
  open: boolean;
  onClose: () => void;
}) {
  const t = copy[lang];
  const label = common(lang).nav.search;
  const router = useRouter();
  const index = useCatalogIndex(open);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const results = useMemo(() => searchIndex(index.entries, query, lang, 8), [index.entries, query, lang]);

  // Every opening starts with an empty query.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery("");
      setActive(0);
    }
  }

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  const go = useCallback(
    (slug: string) => {
      onClose();
      router.push(productPath(slug, lang));
    },
    [onClose, router, lang],
  );

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active].s);
    }
  }

  const trimmed = query.trim();

  return (
    <Sheet open={open} onClose={onClose} label={label} variant="palette">
      <div className="flex max-h-[inherit] flex-col" onKeyDown={onKeyDown}>
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search aria-hidden className="h-5 w-5 shrink-0 text-muted" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder={common(lang).nav.searchPlaceholder}
            aria-label={label}
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${listId}-${results[active].s}` : undefined}
            autoComplete="off"
            spellCheck={false}
            className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-subtle"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="-mr-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {!trimmed ? (
            <p className="px-3 py-6 text-sm text-muted">{t.hint}</p>
          ) : index.status === "loading" ? (
            <ul className="space-y-1 p-1" aria-busy="true">
              {[0, 1, 2, 3].map((i) => (
                <li key={i} className="flex items-center gap-3 rounded-lg p-2">
                  <div className="h-12 w-9 animate-pulse rounded bg-surface-2" />
                  <div className="h-3.5 flex-1 animate-pulse rounded bg-surface-2" />
                </li>
              ))}
            </ul>
          ) : index.status === "error" ? (
            <div className="px-3 py-6 text-sm">
              <p>{lang === "id" ? "Pencarian belum termuat." : "Search did not load."}</p>
              <button type="button" onClick={index.retry} className="mt-2 font-medium text-brand hover:underline">
                {common(lang).actions.retry}
              </button>
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-6 text-sm">
              <p className="font-medium">{t.none(trimmed)}</p>
              <p className="mt-1 text-muted">{t.noneHint}</p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push(path("shop", lang));
                }}
                className="mt-3 font-medium text-brand hover:underline"
              >
                {t.browse}
              </button>
            </div>
          ) : (
            <>
              <p className="sr-only" aria-live="polite">
                {t.results(results.length)}
              </p>
              <ul id={listId} role="listbox" aria-label={label}>
                {results.map((r, i) => (
                  <li
                    key={r.s}
                    id={`${listId}-${r.s}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseMove={() => setActive(i)}
                    onClick={() => go(r.s)}
                    className={clsx(
                      "flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors duration-100",
                      i === active ? "bg-surface-2" : "",
                    )}
                  >
                    { }
                    <img
                      src={r.c}
                      alt=""
                      className="h-12 w-9 shrink-0 rounded border border-line bg-white object-cover object-top"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{r.t[lang]}</p>
                      <p className="truncate text-xs text-muted">{r.m[lang]}</p>
                    </div>
                    <span className="tabular shrink-0 text-sm font-medium">{formatIdr(r.p)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="hidden items-center gap-4 border-t border-line px-4 py-2.5 text-xs text-subtle sm:flex">
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[0.68rem]">↑</kbd>
            <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[0.68rem]">↓</kbd>
            {t.move}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <kbd className="inline-flex items-center rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[0.68rem]">
              <CornerDownLeft aria-hidden className="h-3 w-3" />
            </kbd>
            {t.open}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[0.68rem]">Esc</kbd>
            {t.close}
          </span>
        </div>
      </div>
    </Sheet>
  );
}
