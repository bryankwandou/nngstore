import type { Metadata } from "next";
import { Copy, FileSearch, FileWarning, FileX, Timer } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { refundsCopy } from "@/content/refunds";
import { Stagger } from "@/components/motion/reveal";
import { LegalLayout } from "./legal-layout";

export function refundsMetadata(lang: Lang): Metadata {
  const t = refundsCopy(lang);
  return pageMeta({ lang, bare: "/refunds", title: t.meta.title, description: t.meta.description });
}

const caseIcons = [FileX, FileWarning, Copy, FileSearch];

function Summary({ lang }: { lang: Lang }) {
  const s = refundsCopy(lang).summary;
  return (
    <section
      aria-labelledby="refund-summary"
      className="grid gap-4 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-6"
    >
      <div className="flex flex-col justify-between gap-6 rounded-[var(--radius-lg)] border border-line bg-brand-soft p-6">
        <Timer aria-hidden="true" className="h-6 w-6 text-brand-strong" />
        <p>
          <span className="block font-display text-[clamp(40px,1.6rem+3vw,56px)] font-semibold leading-none tracking-[-0.03em] text-text tabular">
            {s.window}
          </span>
          <span className="mt-2 block text-sm leading-snug text-muted">{s.windowLabel}</span>
        </p>
      </div>
      <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 sm:p-6">
        <h2 id="refund-summary" className="font-display text-xl font-semibold tracking-[-0.015em] text-text">
          {s.casesTitle}
        </h2>
        <Stagger as="ul" className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
          {s.cases.map((c, i) => {
            const Icon = caseIcons[i] ?? FileX;
            return (
              <li key={c.title} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-surface-2 text-brand"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <h3 className="text-base font-medium leading-snug text-text">{c.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{c.body}</p>
                </div>
              </li>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

export function RefundsView({ lang }: { lang: Lang }) {
  return <LegalLayout doc={refundsCopy(lang)} lang={lang} lead={<Summary lang={lang} />} />;
}
