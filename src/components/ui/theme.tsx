"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import type { Lang } from "@/lib/i18n";

const KEY = "nngstore.theme";

/**
 * Runs before first paint so a returning visitor never sees the wrong theme
 * flash in. With no saved choice the page follows the operating system.
 */
export const themeScript = `(function(){var d=document.documentElement,t=null;d.classList.add('js');try{t=localStorage.getItem('${KEY}')}catch(e){}if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.setAttribute('data-theme',t)})();`;

type Theme = "light" | "dark";

function currentTheme(): Theme {
  const set = document.documentElement.getAttribute("data-theme");
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const labels = {
  en: { toDark: "Switch to dark theme", toLight: "Switch to light theme" },
  id: { toDark: "Ganti ke tema gelap", toLight: "Ganti ke tema terang" },
} as const;

/* The <html data-theme> attribute is the source of truth; watch it directly. */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

export function ThemeToggle({ lang, className }: { lang: Lang; className?: string }) {
  const theme = useSyncExternalStore<Theme | null>(subscribe, currentTheme, () => null);

  function flip() {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* Choice lasts for this visit only. */
    }
  }

  const label = theme === "dark" ? labels[lang].toLight : labels[lang].toDark;

  return (
    <button
      type="button"
      onClick={flip}
      aria-label={label}
      title={label}
      className={
        "relative inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:bg-surface-2 hover:text-text " +
        (className ?? "")
      }
    >
      <Sun
        aria-hidden
        className="h-[1.15rem] w-[1.15rem] transition-[transform,opacity] duration-300 ease-out [html[data-theme=dark]_&]:scale-50 [html[data-theme=dark]_&]:opacity-0"
      />
      <Moon
        aria-hidden
        className="absolute h-[1.15rem] w-[1.15rem] scale-50 opacity-0 transition-[transform,opacity] duration-300 ease-out [html[data-theme=dark]_&]:scale-100 [html[data-theme=dark]_&]:opacity-100"
      />
    </button>
  );
}
