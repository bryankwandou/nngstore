import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { catalog } from "@/data/catalog";
import { path, type Lang } from "@/lib/i18n";
import { common } from "@/content/common";
import { HeaderBar } from "./header-bar";
import { HeaderActions, type MenuGroup } from "./header-actions";
import { NavLinks, type NavItem } from "./nav-links";

const subjectsLabel = { en: "Subjects", id: "Mata pelajaran" } as const;
const allLabel = { en: "All 192 files", id: "Semua 192 file" } as const;

/** Subject links grouped by category, with the real number of files behind each one. */
function menuGroups(lang: Lang): MenuGroup[] {
  const t = common(lang).categories;
  const counts = new Map<string, number>();
  for (const p of catalog.products) counts.set(p.subject, (counts.get(p.subject) ?? 0) + 1);
  const order = ["religion", "languages", "science", "civics"] as const;
  return order
    .map((cat) => ({
      title: t[cat],
      links: catalog.subjects
        .filter((s) => s.category === cat && (counts.get(s.id) ?? 0) > 0)
        .map((s) => ({
          href: `${path("shop", lang)}?subject=${s.id}`,
          label: s.title[lang],
          count: counts.get(s.id) ?? 0,
        })),
    }))
    .filter((g) => g.links.length > 0);
}

export function SiteHeader({ lang }: { lang: Lang }) {
  const t = common(lang).nav;
  const nav: NavItem[] = [
    { href: path("shop", lang), label: t.shop },
    { href: path("bundles", lang), label: t.bundles },
    { href: path("protection", lang), label: t.protectionShort },
    { href: path("help", lang), label: t.help },
  ];
  const groups = menuGroups(lang);
  const total = catalog.products.length;

  return (
    <HeaderBar>
      <div className="container-page flex h-16 items-center gap-2">
        <Link
          href={path("home", lang)}
          aria-label="NNG Store"
          className="-ml-1 mr-2 inline-flex h-10 shrink-0 items-center rounded-lg px-1"
        >
          <Logo />
        </Link>

        <nav aria-label={t.menu} className="hidden items-center md:flex">
          <NavLinks items={nav.slice(0, 1)} />
          <button
            type="button"
            popoverTarget="subjects-menu"
            className="inline-flex h-10 items-center gap-1 rounded-full px-3.5 text-sm text-muted transition-colors duration-200 hover:text-text"
          >
            {subjectsLabel[lang]}
            <ChevronDown aria-hidden className="h-3.5 w-3.5" />
          </button>
          <NavLinks items={nav.slice(1)} />
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <HeaderActions lang={lang} nav={nav} groups={groups} />
        </div>
      </div>

      <div id="subjects-menu" popover="auto" className="mega">
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-subtle">{g.title}</p>
              <ul className="mt-3 space-y-0.5">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="group flex h-9 items-center justify-between gap-3 rounded-md px-2 -mx-2 text-sm transition-colors hover:bg-surface-2"
                    >
                      <span className="truncate">{l.label}</span>
                      <span className="tabular text-xs text-subtle group-hover:text-muted">{l.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
          <Link href={path("shop", lang)} className="text-sm font-medium text-brand hover:underline">
            {allLabel[lang].replace("192", String(total))}
          </Link>
          <Link href={path("bundles", lang)} className="text-sm text-muted hover:text-text">
            {t.bundles}
          </Link>
        </div>
      </div>
    </HeaderBar>
  );
}
