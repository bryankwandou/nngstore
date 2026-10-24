"use client";

import Link from "next/link";
import { BookOpen, Menu, Search } from "lucide-react";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { path, type Lang } from "@/lib/i18n";
import { common } from "@/content/common";
import { Sheet } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/theme";
import { CartButton } from "./cart-button";
import { LangSwitch } from "./lang-switch";
import { SearchPalette, useSearchShortcut } from "./search-palette";
import type { NavItem } from "./nav-links";

const noSubscribe = () => () => {};

export type MenuGroup ={ title: string; links: { href: string; label: string; count: number }[] };

export function HeaderActions({
  lang,
  nav,
  groups,
}: {
  lang: Lang;
  nav: NavItem[];
  groups: MenuGroup[];
}) {
  const t = common(lang).nav;
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const pathname = usePathname();
  const isMac = useSyncExternalStore(
    noSubscribe,
    () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent),
    () => false,
  );

  useSearchShortcut(openSearch);

  /* A route change always closes the mobile menu. */
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  /* The subjects popover lives in the persistent header, so a link click must close it by hand. */
  useEffect(() => {
    const el = document.getElementById("subjects-menu");
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a")) el.hidePopover?.();
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={openSearch}
        className="hidden h-10 w-56 items-center gap-2 rounded-full border border-line bg-surface pl-3.5 pr-2 text-sm text-subtle transition-colors duration-200 hover:border-line-strong hover:text-muted lg:inline-flex"
      >
        <Search aria-hidden className="h-4 w-4" />
        <span className="flex-1 text-left">{t.search}</span>
        <kbd className="rounded-md border border-line bg-bg px-1.5 py-0.5 font-mono text-[0.68rem] text-muted">
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>
      <button
        type="button"
        onClick={openSearch}
        aria-label={t.search}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-text transition-colors hover:bg-surface-2 lg:hidden"
      >
        <Search aria-hidden className="h-[1.2rem] w-[1.2rem]" strokeWidth={1.8} />
      </button>

      <LangSwitch lang={lang} className="hidden md:inline-flex" />
      <ThemeToggle lang={lang} className="hidden md:inline-flex" />

      <Link
        href={path("library", lang)}
        aria-label={t.library}
        title={t.library}
        className="hidden h-10 w-10 items-center justify-center rounded-full text-text transition-colors hover:bg-surface-2 md:inline-flex"
      >
        <BookOpen aria-hidden className="h-[1.2rem] w-[1.2rem]" strokeWidth={1.8} />
      </Link>

      <CartButton label={common(lang).cart.open} />

      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        aria-label={t.menu}
        aria-expanded={menuOpen}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-text transition-colors hover:bg-surface-2 md:hidden"
      >
        <Menu aria-hidden className="h-5 w-5" />
      </button>

      <SearchPalette lang={lang} open={searchOpen} onClose={closeSearch} />

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} label={t.menu} side="right">
        <div className="flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
            <span className="font-display text-lg font-semibold">{t.menu}</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={t.closeMenu}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
            >
              <span aria-hidden className="text-xl leading-none">×</span>
            </button>
          </div>
          <nav className="min-h-0 flex-1 overflow-y-auto px-5 py-4" aria-label={t.menu}>
            <ul className="space-y-1">
              {[...nav, { href: path("library", lang), label: t.library }].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex h-12 items-center rounded-lg px-3 text-base font-medium transition-colors hover:bg-surface-2"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-6 border-t border-line pt-6">
              {groups.map((g) => (
                <div key={g.title}>
                  <p className="px-3 text-xs font-medium uppercase tracking-[0.08em] text-subtle">{g.title}</p>
                  <ul className="mt-2 grid grid-cols-2 gap-1">
                    {g.links.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="flex h-11 items-center justify-between gap-2 rounded-lg px-3 text-sm transition-colors hover:bg-surface-2"
                        >
                          <span className="truncate">{l.label}</span>
                          <span className="tabular text-xs text-subtle">{l.count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>
          <div className="flex shrink-0 items-center justify-between border-t border-line px-5 py-4">
            <LangSwitch lang={lang} />
            <ThemeToggle lang={lang} />
          </div>
        </div>
      </Sheet>
    </>
  );
}
