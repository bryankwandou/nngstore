import type { Lang } from "@/lib/i18n";
import { protectionCopy } from "@/content/protection";
import { LiveStamp } from "./live-stamp";

/**
 * A CSS mock of a worksheet page as a buyer sees it in the reader: the
 * server stamp (diagonal mark and footer) baked into the page, and the
 * reader's live watermark on top. Paper stays white in both themes, like
 * a printed sheet. Text is sized in container units so the whole page
 * scales as one object from 375 px up.
 */
function Marker({ n, className }: { n: number; className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute z-20 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-semibold text-brand-contrast shadow-[var(--shadow-md)] ring-2 ring-white ${className}`}
    >
      {n}
    </span>
  );
}

export function StampedPage({ lang }: { lang: Lang }) {
  const d = protectionCopy(lang).demo;
  const m = d.mock;
  const mark = `${m.order} · ${m.buyer}`;
  const rows = Array.from({ length: 9 }, (_, i) => i);

  return (
    <div className="relative mx-auto w-full max-w-[24rem]">
      <div
        role="img"
        aria-label={d.mockLabel}
        className="@container relative aspect-[1/1.414] select-none overflow-hidden rounded-[var(--radius-md)] border border-black/10 bg-white text-neutral-800 shadow-[var(--shadow-lg)]"
      >
        {/* Worksheet content */}
        <div aria-hidden="true" className="absolute inset-0 px-[8cqw] pt-[8cqw]">
          <p className="text-[2.8cqw] font-medium uppercase tracking-[0.08em] text-neutral-500">{m.subject}</p>
          <p className="mt-[1.5cqw] font-display text-[6cqw] font-semibold leading-tight text-neutral-900">
            {m.heading}
          </p>
          <div className="mt-[4cqw] grid grid-cols-[1fr_0.6fr] gap-[4cqw] text-[3cqw] text-neutral-600">
            <span className="border-b border-neutral-300 pb-[1cqw]">{m.name}</span>
            <span className="border-b border-neutral-300 pb-[1cqw]">{m.cls}</span>
          </div>
          <ol className="mt-[6cqw] space-y-[5.2cqw] text-[3.4cqw] leading-snug">
            {m.questions.map((q) => (
              <li key={q}>
                {q}
                <span className="mt-[2.4cqw] block h-px w-full bg-neutral-200" />
              </li>
            ))}
          </ol>
        </div>

        {/* Server stamp 1: repeating diagonal mark */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[-40%] flex -rotate-[35deg] flex-col justify-center gap-[13cqw] text-[3.6cqw] font-medium whitespace-nowrap text-neutral-500/25"
        >
          {rows.map((r) => (
            <span key={r} className={r % 2 ? "pl-[30cqw]" : ""}>
              {`${mark}      ${mark}      ${mark}`}
            </span>
          ))}
        </div>

        {/* Reader layer: live watermark */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[58%] flex justify-center"
        >
          <span className="rounded-full border border-violet-600/20 bg-violet-600/[0.07] px-[3cqw] py-[1cqw] text-[3cqw] font-medium text-violet-700/80">
            <LiveStamp name={m.buyer} lang={lang} />
          </span>
        </div>

        {/* Server stamp 2: footer strip */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-[2.4cqw] flex justify-center px-[3cqw]">
          <span className="truncate rounded-[2px] bg-white/80 px-[1.6cqw] py-[0.5cqw] text-[2.1cqw] text-neutral-600">
            {`${m.licensed} ${m.buyer} · ${m.email} · ${m.orderLabel} ${m.order}`}
          </span>
        </div>
      </div>

      {/* Numbers match the legend order: diagonal, footer, live. */}
      <Marker n={1} className="right-[10%] top-[30%]" />
      <Marker n={2} className="-left-2 bottom-[1%] sm:-left-3" />
      <Marker n={3} className="-right-2 top-[57%] sm:-right-3" />
    </div>
  );
}
