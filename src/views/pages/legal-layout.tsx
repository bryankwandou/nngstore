import type { ReactNode } from "react";
import { Clock } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { Reveal } from "@/components/motion/reveal";
import { Blocks, PageIntro, type Block } from "./rich";
import { Toc } from "./toc";

export type LegalDoc = {
  readonly eyebrow: string;
  readonly title: string;
  readonly intro: string;
  readonly updated: string;
  readonly tocLabel: string;
  readonly sections: readonly {
    readonly id: string;
    readonly title: string;
    readonly body: readonly Block[];
  }[];
};

/**
 * Shared frame for Terms, Privacy and Refunds: a 65ch reading column and, from
 * 1024 px, a sticky table of contents on the left. On smaller screens the
 * contents sit in a collapsible list above the text.
 */
export function LegalLayout({
  doc,
  lang,
  lead,
}: {
  doc: LegalDoc;
  lang: Lang;
  /** Optional block between the intro and the sections, e.g. the refund summary. */
  lead?: ReactNode;
}) {
  const entries = doc.sections.map((s) => ({ id: s.id, title: s.title }));
  return (
    <div className="container-page py-16 lg:py-24">
      <PageIntro eyebrow={doc.eyebrow} title={doc.title} intro={doc.intro}>
        <p className="mt-5 inline-flex items-center gap-2 text-sm text-subtle">
          <Clock aria-hidden="true" className="h-4 w-4" />
          {doc.updated}
        </p>
      </PageIntro>

      {lead ? <div className="mt-12">{lead}</div> : null}

      <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
        <aside className="lg:order-none">
          <details className="group rounded-[var(--radius-lg)] border border-line bg-surface lg:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-medium text-text [&::-webkit-details-marker]:hidden">
              {doc.tocLabel}
              <span
                aria-hidden="true"
                className="text-subtle transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <ol className="border-t border-line px-2 py-2">
              {entries.map((e) => (
                <li key={e.id}>
                  <a
                    href={`#${e.id}`}
                    className="block rounded-[var(--radius-sm)] px-2 py-2 text-sm text-muted hover:bg-surface-2 hover:text-text"
                  >
                    {e.title}
                  </a>
                </li>
              ))}
            </ol>
          </details>
          <div className="sticky top-24 hidden lg:block">
            <Toc label={doc.tocLabel} entries={entries} />
          </div>
        </aside>

        <article className="min-w-0 max-w-[65ch]">
          {doc.sections.map((s, i) => (
            <Reveal
              as="section"
              key={s.id}
              id={s.id}
              className={i === 0 ? "scroll-mt-24" : "mt-12 scroll-mt-24 border-t border-line pt-12"}
            >
              <h2 className="font-display text-[clamp(24px,1.15rem+0.8vw,30px)] font-semibold leading-tight tracking-[-0.02em] text-text">
                {s.title}
              </h2>
              <Blocks blocks={s.body} lang={lang} className="mt-4" />
            </Reveal>
          ))}
        </article>
      </div>
    </div>
  );
}
