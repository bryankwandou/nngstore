"use client";

import { forwardRef, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { clsx } from "clsx";
import { Building2, Loader2, QrCode, Wallet } from "lucide-react";
import { formatIdr } from "@/lib/format";
import type { Lang } from "@/lib/i18n";
import { checkoutCopy } from "@/content/checkout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Tab = "qris" | "ewallet" | "va";
const TABS: { id: Tab; Icon: typeof QrCode }[] = [
  { id: "qris", Icon: QrCode },
  { id: "ewallet", Icon: Wallet },
  { id: "va", Icon: Building2 },
];

/** Small deterministic generator so the mock visuals stay the same for one order. */
function seeded(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let s = h >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * The payment step as it will look once Midtrans is connected, clearly marked
 * as a demo. The only thing that happens here is the "simulate" button, which
 * asks the server to grant the order.
 */
export const DemoPayment = forwardRef<
  HTMLHeadingElement,
  {
    lang: Lang;
    orderId: string;
    total: number;
    busy: boolean;
    error: string | null;
    onSimulate: () => void;
    onEdit: () => void;
  }
>(function DemoPayment({ lang, orderId, total, busy, error, onSimulate, onEdit }, headingRef) {
  const t = checkoutCopy(lang).demo;
  const [tab, setTab] = useState<Tab>("qris");
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ qris: null, ewallet: null, va: null });
  const base = useId();

  const va = useMemo(() => {
    const r = seeded(orderId);
    const digits = Array.from({ length: 12 }, () => Math.floor(r() * 10)).join("");
    return `8808 ${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`;
  }, [orderId]);

  function onKey(e: KeyboardEvent<HTMLButtonElement>) {
    const i = TABS.findIndex((x) => x.id === tab);
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    const id = TABS[next].id;
    setTab(id);
    tabRefs.current[id]?.focus();
  }

  return (
    <section
      aria-labelledby={`${base}-title`}
      className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-sm)]"
    >
      <div className="border-b border-dashed border-warning/50 bg-surface-2 px-5 py-4 sm:px-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="warning" className="uppercase tracking-[0.06em]">
            {t.badge}
          </Badge>
          <span className="tabular text-xs text-muted">
            {t.order} {orderId}
          </span>
        </div>
        <h2
          id={`${base}-title`}
          ref={headingRef}
          tabIndex={-1}
          className="mt-3 font-display text-2xl font-semibold tracking-tight focus:outline-none"
        >
          {t.title}
        </h2>
        <p className="mt-1.5 max-w-[60ch] text-sm leading-relaxed text-muted">{t.body}</p>
      </div>

      <div className="px-5 py-6 sm:px-7">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-muted">{t.amount}</span>
          <span className="tabular text-2xl font-semibold tracking-tight">{formatIdr(total)}</span>
        </div>

        <div
          role="tablist"
          aria-label={t.methodsLabel}
          className="mt-5 grid grid-cols-3 gap-1 rounded-full border border-line bg-surface-2 p-1"
        >
          {TABS.map(({ id, Icon }) => {
            const active = id === tab;
            return (
              <button
                key={id}
                ref={(el) => {
                  tabRefs.current[id] = el;
                }}
                type="button"
                role="tab"
                id={`${base}-tab-${id}`}
                aria-selected={active}
                aria-controls={`${base}-panel-${id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setTab(id)}
                onKeyDown={onKey}
                className={clsx(
                  "inline-flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-full px-2 text-xs font-medium transition-[background-color,color,box-shadow] duration-150 sm:text-sm",
                  active ? "bg-surface text-text shadow-[var(--shadow-sm)]" : "text-muted hover:text-text",
                )}
              >
                <Icon aria-hidden className="hidden h-4 w-4 shrink-0 min-[400px]:block" />
                <span className="truncate">{t.tabs[id]}</span>
              </button>
            );
          })}
        </div>

        {TABS.map(({ id }) => (
          <div
            key={id}
            role="tabpanel"
            id={`${base}-panel-${id}`}
            aria-labelledby={`${base}-tab-${id}`}
            hidden={id !== tab}
            tabIndex={0}
            className="mt-5 rounded-[var(--radius-md)] focus-visible:outline-offset-4"
          >
            {id === "qris" ? (
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                <MockQr seed={orderId} label={t.qrisMock} />
                <div className="text-center sm:text-left">
                  <p className="text-sm leading-relaxed">{t.qris}</p>
                  <p className="mt-2 text-xs font-medium text-warning">{t.qrisMock}</p>
                </div>
              </div>
            ) : null}
            {id === "ewallet" ? (
              <div>
                <p className="text-sm leading-relaxed">{t.ewallet}</p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                  {t.ewalletNames.map((name) => (
                    <li
                      key={name}
                      className="flex min-h-12 items-center gap-2.5 rounded-[var(--radius-md)] border border-line bg-bg-elev px-3 text-sm"
                    >
                      <Wallet aria-hidden className="h-4 w-4 shrink-0 text-subtle" />
                      {name}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs font-medium text-warning">{t.ewalletMock}</p>
              </div>
            ) : null}
            {id === "va" ? (
              <div>
                <p className="text-sm leading-relaxed">{t.va}</p>
                <p className="mt-1 text-xs text-muted">{t.vaBanks}</p>
                <div className="mt-4 rounded-[var(--radius-md)] border border-dashed border-line-strong bg-bg-elev px-4 py-3">
                  <p className="text-xs text-muted">{t.vaNumber}</p>
                  <p className="tabular mt-1 font-mono text-lg tracking-wider text-subtle line-through decoration-warning/60">
                    {va}
                  </p>
                  <p className="mt-1 text-xs font-medium text-warning">{t.vaMock}</p>
                </div>
              </div>
            ) : null}
          </div>
        ))}

        <p className="mt-6 rounded-[var(--radius-md)] bg-surface-2 px-4 py-3 text-sm leading-relaxed text-muted">
          {t.rule}
        </p>

        {error ? (
          <p role="alert" className="mt-4 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" onClick={onEdit} disabled={busy}>
            {t.edit}
          </Button>
          <Button size="lg" onClick={onSimulate} disabled={busy} aria-busy={busy} className="w-full sm:w-auto">
            {busy ? <Loader2 aria-hidden className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : null}
            {busy ? t.simulating : t.simulate}
          </Button>
        </div>
      </div>
    </section>
  );
});

/** A grid that reads as "QR goes here" at a glance and cannot be scanned. */
function MockQr({ seed, label }: { seed: string; label: string }) {
  const cells = useMemo(() => {
    const n = 25;
    const r = seeded(seed);
    const out: [number, number][] = [];
    const inFinder = (x: number, y: number) =>
      (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && r() > 0.55) out.push([x, y]);
    return out;
  }, [seed]);

  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} rx={1} fill="none" stroke="currentColor" strokeWidth={1} />
      <rect x={x + 2} y={y + 2} width={3} height={3} rx={0.5} fill="currentColor" />
    </g>
  );

  return (
    <div className="relative shrink-0 rounded-[var(--radius-md)] border border-black/10 bg-white p-3 shadow-[var(--shadow-sm)]">
      <svg viewBox="-0.5 -0.5 26 26" width={148} height={148} role="img" aria-label={label} className="text-[#2a2838] opacity-40">
        {finder(0, 0)}
        {finder(18, 0)}
        {finder(0, 18)}
        {cells.map(([x, y]) => (
          <rect key={`${x}.${y}`} x={x + 0.1} y={y + 0.1} width={0.8} height={0.8} rx={0.2} fill="currentColor" />
        ))}
      </svg>
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-[var(--radius-sm)] border-2 border-[#b25208] bg-white px-2.5 py-0.5 text-sm font-bold uppercase tracking-[0.14em] text-[#b25208]"
      >
        Demo
      </span>
    </div>
  );
}
