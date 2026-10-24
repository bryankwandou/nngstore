import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { catalog } from "@/data/catalog";
import { path, type Lang } from "@/lib/i18n";
import { common, site } from "@/content/common";
import { LangSwitch } from "./lang-switch";

/* Payment channels offered through Midtrans Snap. Text marks, not borrowed logos. */
const payments = ["QRIS", "GoPay", "ShopeePay", "OVO", "DANA", "BCA", "BNI", "BRI", "Mandiri"];

export function SiteFooter({ lang }: { lang: Lang }) {
  const t = common(lang);
  const f = t.footer;
  const year = new Date().getFullYear();
  const shopHref = path("shop", lang);

  const columns = [
    {
      title: f.shop,
      links: [
        { href: shopHref, label: lang === "id" ? `Semua file (${catalog.products.length})` : `All files (${catalog.products.length})` },
        { href: `${shopHref}?category=religion`, label: t.categories.religion },
        { href: `${shopHref}?category=languages`, label: t.categories.languages },
        { href: `${shopHref}?category=science`, label: t.categories.science },
        { href: `${shopHref}?category=civics`, label: t.categories.civics },
        { href: path("bundles", lang), label: t.nav.bundles },
      ],
    },
    {
      title: f.help,
      links: [
        { href: path("help", lang), label: f.faq },
        { href: path("protection", lang), label: f.protection },
        { href: path("refunds", lang), label: f.refunds },
        { href: path("library", lang), label: t.nav.library },
      ],
    },
    {
      title: lang === "id" ? "Legal" : "Legal",
      links: [
        { href: path("terms", lang), label: f.terms },
        { href: path("privacy", lang), label: f.privacy },
      ],
    },
    {
      title: f.company,
      links: [
        { href: site.instagram, label: `${f.instagram} ${site.instagramHandle}`, external: true },
        { href: "https://nngesport.vercel.app", label: f.esport, external: true },
      ],
    },
  ];

  return (
    <footer className="mt-24 border-t border-line bg-bg">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.3fr_2fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted">{f.blurb}</p>
          <div className="mt-6">
            <LangSwitch lang={lang} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-subtle">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    {"external" in l && l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted transition-colors hover:text-text"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="text-sm text-muted transition-colors hover:text-text">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
            <span className="mr-1 text-xs text-subtle">{f.payments}</span>
            {payments.map((p) => (
              <span
                key={p}
                className="inline-flex h-6 items-center rounded border border-line px-1.5 text-[0.68rem] font-semibold tracking-wide text-muted"
              >
                {p}
              </span>
            ))}
          </div>
          <p className="text-xs text-subtle">
            © {year} NNG Store · {f.rights} · <span className="font-medium text-muted">{f.motto}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
