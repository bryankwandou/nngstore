"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { Clock, Loader2, XCircle } from "lucide-react";
import { path, type Lang } from "@/lib/i18n";
import { site } from "@/content/common";
import { libraryCopy } from "@/content/library";
import { confirmOrder, type ConfirmStatus } from "@/views/checkout/api";
import { Button, ButtonLink } from "@/components/ui/button";

const POLL_MS = 3000;
const POLL_TRIES = 40;

/**
 * Shown when the page was opened with ?order= (the Midtrans finish redirect)
 * and that order is not in the library yet. Asks the server to check the
 * payment and refreshes the page once access is granted.
 */
export function OrderCheck({ lang, orderId }: { lang: Lang; orderId: string }) {
  const t = libraryCopy(lang).checking;
  const router = useRouter();
  const [status, setStatus] = useState<ConfirmStatus | "checking">("checking");
  const [round, setRound] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let alive = true;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      tries += 1;
      const s = await confirmOrder(orderId);
      if (!alive) return;
      if (s === "paid") {
        router.refresh();
        return;
      }
      setStatus(s);
      if ((s === "pending" || s === "error") && tries < POLL_TRIES) timer = setTimeout(tick, POLL_MS);
    };
    timer = setTimeout(tick, 0);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [orderId, round, router]);

  useEffect(() => {
    if (status === "failed" || status === "unknown") headingRef.current?.focus();
  }, [status]);

  const title =
    status === "pending"
      ? t.pendingTitle
      : status === "failed"
        ? t.failedTitle
        : status === "unknown"
          ? t.unknownTitle
          : t.title;
  const body =
    status === "pending" ? t.pendingBody : status === "failed" ? t.failedBody : status === "error" ? t.errorBody : t.body;
  const spinning = status === "checking";

  return (
    <section
      aria-labelledby="order-check-title"
      className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-6"
    >
      <div className="flex gap-4">
        <span
          className={clsx(
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            status === "failed" ? "bg-surface-2 text-danger" : status === "checking" ? "bg-brand-soft text-brand" : "bg-surface-2 text-warning",
          )}
        >
          {spinning ? (
            <Loader2 aria-hidden className="h-5 w-5 animate-spin motion-reduce:animate-none" />
          ) : status === "failed" ? (
            <XCircle aria-hidden className="h-5 w-5" />
          ) : (
            <Clock aria-hidden className="h-5 w-5" />
          )}
        </span>
        <div className="min-w-0 flex-1" role="status" aria-live="polite">
          <h2 id="order-check-title" ref={headingRef} tabIndex={-1} className="font-sans text-lg font-semibold focus:outline-none">
            {title}
          </h2>
          {status === "unknown" ? (
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {t.unknownBody}{" "}
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="font-medium text-brand underline underline-offset-4">
                {site.instagramHandle}
              </a>
              .
            </p>
          ) : (
            <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
          )}
          <p className="mt-2 text-xs text-muted">
            <span className="tabular font-mono text-text">{orderId}</span>
          </p>
          {!spinning ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {status !== "unknown" ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setStatus("checking");
                    setRound((n) => n + 1);
                  }}
                >
                  {t.retry}
                </Button>
              ) : null}
              {status === "failed" ? (
                <ButtonLink size="sm" href={path("checkout", lang)}>
                  {t.checkout}
                </ButtonLink>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
