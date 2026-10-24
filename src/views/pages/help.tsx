import type { Metadata } from "next";
import { ArrowUpRight, ChevronDown, MessageCircle } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { site } from "@/content/common";
import { helpCopy } from "@/content/help";
import { buttonClass } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { Blocks, PageIntro } from "./rich";

export function helpMetadata(lang: Lang): Metadata {
  const t = helpCopy(lang);
  return pageMeta({ lang, bare: "/help", title: t.meta.title, description: t.meta.description });
}

function ContactCard({ lang }: { lang: Lang }) {
  const c = helpCopy(lang).contact;
  return (
    <section
      aria-labelledby="help-contact"
      className="rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-[var(--shadow-sm)]"
    >
      <span
        aria-hidden="true"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand-strong"
      >
        <MessageCircle className="h-5 w-5" />
      </span>
      <h2 id="help-contact" className="mt-4 font-display text-xl font-semibold tracking-[-0.015em] text-text">
        {c.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
      <a
        href={site.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass({ variant: "primary", size: "md", className: "mt-5 w-full" })}
      >
        {c.button}
        <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" />
      </a>
      <p className="mt-3 text-xs leading-relaxed text-subtle">{c.note}</p>
    </section>
  );
}

export function HelpView({ lang }: { lang: Lang }) {
  const t = helpCopy(lang);
  return (
    <div className="container-page py-16 lg:py-24">
      <PageIntro eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

      <nav aria-label={t.jumpLabel} className="mt-8">
        <ul className="flex flex-wrap gap-2">
          {t.groups.map((g) => (
            <li key={g.id}>
              <a
                href={`#${g.id}`}
                className="inline-flex h-10 items-center rounded-full border border-line bg-surface px-4 text-sm font-medium text-text transition-colors duration-150 hover:border-line-strong hover:bg-surface-2"
              >
                {g.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <div className="min-w-0 max-w-[65ch] space-y-14">
          {t.groups.map((g) => (
            <Reveal as="section" key={g.id} id={g.id} className="scroll-mt-24">
              <h2 className="font-display text-[clamp(24px,1.15rem+0.8vw,30px)] font-semibold leading-tight tracking-[-0.02em] text-text">
                {g.title}
              </h2>
              <div className="mt-4 border-t border-line">
                {g.items.map((item) => (
                  <details key={item.q} className="group border-b border-line">
                    <summary className="flex min-h-12 cursor-pointer list-none items-start justify-between gap-4 py-4 text-left text-base font-medium leading-snug text-text transition-colors hover:text-brand [&::-webkit-details-marker]:hidden">
                      <span>{item.q}</span>
                      <ChevronDown
                        aria-hidden="true"
                        className="mt-0.5 h-5 w-5 shrink-0 text-subtle transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-open:rotate-180"
                      />
                    </summary>
                    <Blocks blocks={item.a} lang={lang} className="pb-5 pr-2 sm:pr-9" />
                  </details>
                ))}
              </div>
            </Reveal>
          ))}
        </div>

        <aside className="lg:pt-1">
          <div className="lg:sticky lg:top-24">
            <ContactCard lang={lang} />
          </div>
        </aside>
      </div>
    </div>
  );
}
