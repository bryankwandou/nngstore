import type { Metadata } from "next";
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Camera,
  Clock,
  EyeOff,
  Fingerprint,
  KeyRound,
  Lock,
  MonitorSmartphone,
  Printer,
  Stamp,
} from "lucide-react";
import { path, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { protectionCopy } from "@/content/protection";
import { ButtonLink, buttonClass } from "@/components/ui/button";
import { Reveal, Stagger } from "@/components/motion/reveal";
import { DEMO_URL, PageIntro } from "./rich";
import { StampedPage } from "./stamped-page";

export function protectionMetadata(lang: Lang): Metadata {
  const t = protectionCopy(lang);
  return pageMeta({ lang, bare: "/protection", title: t.meta.title, description: t.meta.description });
}

const flowIcons = [Lock, Stamp, KeyRound, BookOpen];
const measureIcons = [Fingerprint, Clock, KeyRound, MonitorSmartphone, Printer, EyeOff];

const h2 =
  "font-display text-[clamp(24px,1.2rem+1.4vw,36px)] font-semibold leading-[1.15] tracking-[-0.025em] text-text";

/** Connector between two steps: points down on narrow screens, right from 1024 px. */
function Connector() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 16"
      fill="none"
      className="absolute left-1/2 top-full h-4 w-10 -translate-x-1/2 translate-y-3 rotate-90 text-line-strong lg:left-full lg:top-1/2 lg:h-4 lg:w-8 lg:-translate-y-1/2 lg:translate-x-0 lg:rotate-0"
    >
      <path d="M2 8h32" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" strokeLinecap="round" />
      <path d="M30 3l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Flow({ lang }: { lang: Lang }) {
  const f = protectionCopy(lang).flow;
  return (
    <section id="flow" aria-labelledby="flow-title" className="scroll-mt-24 py-16 lg:py-24">
      <Reveal>
        <h2 id="flow-title" className={h2}>
          {f.title}
        </h2>
      </Reveal>
      <ol aria-label={f.label} className="mt-10 grid gap-10 lg:grid-cols-4 lg:gap-8">
        {f.steps.map((s, i) => {
          const Icon = flowIcons[i] ?? Lock;
          const last = i === f.steps.length - 1;
          return (
            <Reveal as="li" key={s.title} delay={i * 80} className="relative">
              <div className="h-full rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)]">
                <div className="flex items-center justify-between">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-brand-soft text-brand-strong"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-subtle tabular">0{i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-medium leading-snug text-text">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </div>
              {!last && <Connector />}
            </Reveal>
          );
        })}
      </ol>
    </section>
  );
}

function Measures({ lang }: { lang: Lang }) {
  const m = protectionCopy(lang).measures;
  return (
    <section aria-labelledby="measures-title" className="border-t border-line py-16 lg:py-24">
      <Reveal>
        <h2 id="measures-title" className={h2}>
          {m.title}
        </h2>
      </Reveal>
      <Stagger as="ul" className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {m.items.map((item, i) => {
          const Icon = measureIcons[i] ?? Fingerprint;
          return (
            <li key={item.title} className="max-w-[40ch]">
              <Icon aria-hidden="true" className="h-5 w-5 text-brand" />
              <h3 className="mt-3 text-lg font-medium leading-snug text-text">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          );
        })}
      </Stagger>
    </section>
  );
}

function Limits({ lang }: { lang: Lang }) {
  const l = protectionCopy(lang).limits;
  return (
    <Reveal
      as="section"
      className="grid gap-5 rounded-[var(--radius-xl)] border border-line-strong bg-bg-elev p-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6 sm:p-8 lg:p-10"
    >
      <span
        aria-hidden="true"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-warning"
      >
        <Camera className="h-5 w-5" />
      </span>
      <div className="max-w-[65ch]">
        <h2 className={h2}>{l.title}</h2>
        <div className="mt-4 space-y-4 text-base leading-[1.7] text-muted">
          {l.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

function Demo({ lang }: { lang: Lang }) {
  const d = protectionCopy(lang).demo;
  return (
    <section id="demo" aria-labelledby="demo-title" className="scroll-mt-24 py-16 lg:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className="order-2 lg:order-1">
          <StampedPage lang={lang} />
        </Reveal>
        <Reveal delay={80} className="order-1 max-w-[65ch] lg:order-2">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-subtle">{d.eyebrow}</p>
          <h2 id="demo-title" className={`mt-3 ${h2}`}>
            {d.title}
          </h2>
          <p className="mt-4 text-base leading-[1.7] text-muted">{d.body}</p>
          <ol className="mt-6 space-y-3">
            {d.legend.map((item, i) => (
              <li key={item.key} className="flex gap-3 text-sm leading-relaxed text-text">
                <span
                  aria-hidden="true"
                  className="mt-px inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-brand-contrast"
                >
                  {i + 1}
                </span>
                <span>{item.text}</span>
              </li>
            ))}
          </ol>
          <a
            href={DEMO_URL}
            target="_blank"
            rel="noopener"
            className={buttonClass({ variant: "primary", size: "lg", className: "mt-8" })}
          >
            {d.button}
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">({d.newTab})</span>
          </a>
          <p className="mt-3 text-sm leading-relaxed text-subtle">{d.note}</p>
        </Reveal>
      </div>
    </section>
  );
}

export function ProtectionView({ lang }: { lang: Lang }) {
  const t = protectionCopy(lang);
  return (
    <div className="container-page">
      <div className="pt-16 lg:pt-24">
        <PageIntro eyebrow={t.eyebrow} title={t.title} intro={t.intro}>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#demo" className={buttonClass({ variant: "primary", size: "lg" })}>
              {t.ctaDemo}
              <ArrowDown aria-hidden="true" className="h-4 w-4" />
            </a>
            <a href="#flow" className={buttonClass({ variant: "secondary", size: "lg" })}>
              {t.ctaHow}
            </a>
          </div>
        </PageIntro>
      </div>

      <Flow lang={lang} />
      <Measures lang={lang} />
      <Limits lang={lang} />
      <Demo lang={lang} />

      <section aria-labelledby="protection-closing" className="border-t border-line py-16 lg:py-24">
        <Reveal className="max-w-[65ch]">
          <h2 id="protection-closing" className={h2}>
            {t.closing.title}
          </h2>
          <p className="mt-3 text-base leading-[1.7] text-muted">{t.closing.body}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href={path("help", lang)} variant="primary">
              {t.closing.help}
            </ButtonLink>
            <ButtonLink href={path("refunds", lang)} variant="outline">
              {t.closing.refunds}
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
