"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { languages, swapLangPath, type Lang } from "@/lib/i18n";

const short: Record<Lang, string> = { en: "EN", id: "ID" };
const full: Record<Lang, string> = { en: "English", id: "Bahasa Indonesia" };
const groupLabel: Record<Lang, string> = { en: "Language", id: "Bahasa" };

/** Two-option switch that keeps the visitor on the same page in the other language. */
export function LangSwitch({ lang, className }: { lang: Lang; className?: string }) {
  const pathname = usePathname() || "/";
  return (
    <nav
      aria-label={groupLabel[lang]}
      className={clsx(
        "relative inline-flex h-10 items-center rounded-full border border-line bg-surface p-1 text-xs font-semibold",
        className,
      )}
    >
      {languages.map((l) => {
        const active = l === lang;
        return (
          <Link
            key={l}
            href={swapLangPath(pathname, l)}
            hrefLang={l}
            lang={l}
            aria-current={active ? "true" : undefined}
            aria-label={full[l]}
            title={full[l]}
            prefetch={false}
            className={clsx(
              "relative inline-flex h-8 min-w-10 items-center justify-center rounded-full px-2.5 tracking-wide transition-colors duration-200",
              active ? "bg-text text-bg" : "text-muted hover:text-text",
            )}
          >
            {short[l]}
          </Link>
        );
      })}
    </nav>
  );
}
