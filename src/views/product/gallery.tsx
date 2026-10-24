"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, EyeOff, Info, Maximize2, X } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { formatCount } from "@/lib/format";
import { productCopy } from "@/content/product";

const ENTER = [0.22, 1, 0.36, 1] as const;

/**
 * The preview viewer on a product page. Pages after `sharp` are already blurred
 * in the image files themselves (the sharp originals never reach the browser),
 * so this component only labels them honestly.
 *
 * Turn pages with the arrows, the thumbnails, a swipe, or the arrow keys once
 * the viewer has focus. The zoom dialog shows the page at full resolution.
 */
export function Gallery({
  lang,
  title,
  pages,
  sharp,
  totalPages,
}: {
  lang: Lang;
  title: string;
  pages: string[];
  sharp: number;
  totalPages: number;
}) {
  const t = productCopy(lang).gallery;
  const reduce = useReducedMotion();
  const [[index, dir], setPage] = useState<[number, number]>([0, 0]);
  const [zoom, setZoom] = useState(false);
  const count = pages.length;

  const go = useCallback(
    (next: number) => {
      setPage(([cur]) => {
        const clamped = Math.max(0, Math.min(count - 1, next));
        return clamped === cur ? [cur, 0] : [clamped, clamped > cur ? 1 : -1];
      });
    },
    [count],
  );

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") go(index + 1);
    else if (e.key === "ArrowLeft") go(index - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(count - 1);
    else return;
    e.preventDefault();
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    const swipe = info.offset.x + info.velocity.x * 0.2;
    if (swipe < -60) go(index + 1);
    else if (swipe > 60) go(index - 1);
  }

  const blurredAt = (i: number) => sharp > 0 && i >= sharp;
  const label = (i: number) => (sharp <= 0 ? t.answersBlurred : blurredAt(i) ? t.blurred : null);
  const current = label(index);

  const variants = {
    enter: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: d === 0 ? 0 : d > 0 ? 48 : -48 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: d === 0 ? 0 : d > 0 ? -48 : 48 }),
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        role="region"
        aria-roledescription={t.roledesc}
        aria-label={t.label}
        tabIndex={0}
        onKeyDown={onKey}
        className="group/stage relative overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface-2 px-12 py-8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-16 sm:py-10"
      >
        <p className="sr-only">{t.keys}</p>
        <div className="relative mx-auto aspect-[1/1.414] w-full max-w-[26rem]">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={index}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduce ? 0.12 : 0.25, ease: ENTER }}
              drag={count > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              dragMomentum={false}
              onDragEnd={onDragEnd}
              onTap={() => setZoom(true)}
              className="absolute inset-0 cursor-zoom-in touch-pan-y"
            >
              <div className="relative h-full w-full overflow-hidden rounded-[var(--radius-md)] border border-black/10 bg-white shadow-[var(--shadow-md)]">
                <img
                  src={pages[index]}
                  alt={t.alt(title, index + 1)}
                  width={900}
                  height={1273}
                  decoding="async"
                  fetchPriority={index === 0 ? "high" : undefined}
                  draggable={false}
                  className="pointer-events-none h-full w-full select-none object-cover object-top"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {current ? (
            <span className="pointer-events-none absolute inset-x-0 bottom-4 z-[1] flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#14141a]/85 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
                <EyeOff aria-hidden className="h-3.5 w-3.5" />
                {current}
              </span>
            </span>
          ) : null}
        </div>

        <span
          aria-live="polite"
          className="tabular absolute left-4 top-4 rounded-full border border-line bg-bg-elev/90 px-2.5 py-1 text-xs font-medium text-muted backdrop-blur"
        >
          {t.page(index + 1, count)}
        </span>
        <button
          type="button"
          onClick={() => setZoom(true)}
          aria-label={t.zoom}
          title={t.zoom}
          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-bg-elev/90 text-text shadow-[var(--shadow-sm)] backdrop-blur transition-[background-color,transform] duration-150 hover:bg-surface active:scale-95"
        >
          <Maximize2 aria-hidden className="h-4 w-4" />
        </button>

        {count > 1 ? (
          <>
            <Arrow side="left" label={t.prev} disabled={index === 0} onClick={() => go(index - 1)} />
            <Arrow side="right" label={t.next} disabled={index === count - 1} onClick={() => go(index + 1)} />
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <div role="group" aria-label={t.thumbs} className="flex justify-center gap-3">
          {pages.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => go(i)}
              aria-label={t.show(i + 1)}
              aria-current={i === index ? "true" : undefined}
              className={clsx(
                "relative aspect-[1/1.414] w-16 overflow-hidden rounded-[var(--radius-sm)] border bg-white transition-[box-shadow,opacity,transform] duration-200 sm:w-[4.5rem]",
                i === index
                  ? "border-transparent shadow-[var(--shadow-sm)] ring-2 ring-brand ring-offset-2 ring-offset-bg"
                  : "border-black/10 opacity-70 hover:-translate-y-0.5 hover:opacity-100",
              )}
            >
              <img src={src} alt="" width={900} height={1273} loading="lazy" decoding="async" draggable={false} className="h-full w-full object-cover object-top" />
              {blurredAt(i) ? (
                <span aria-hidden className="absolute bottom-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-[#14141a]/80 text-white">
                  <EyeOff className="h-3 w-3" />
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      <p className="flex items-start justify-center gap-2 text-center text-sm text-muted">
        <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-subtle" />
        <span>
          {t.rule(sharp, count)} {t.full(formatCount(totalPages, lang))}
        </span>
      </p>

      <ZoomDialog
        lang={lang}
        title={title}
        pages={pages}
        index={index}
        open={zoom}
        onClose={() => setZoom(false)}
        onGo={go}
        label={label}
      />
    </div>
  );
}

function Arrow({
  side,
  label,
  disabled,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={clsx(
        "absolute top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg-elev text-text shadow-[var(--shadow-sm)] transition-[background-color,opacity,transform] duration-150 hover:bg-surface active:scale-95 disabled:pointer-events-none disabled:opacity-35 sm:h-11 sm:w-11",
        side === "left" ? "left-1.5 sm:left-3" : "right-1.5 sm:right-3",
      )}
    >
      <Icon aria-hidden className="h-5 w-5" />
    </button>
  );
}

/** Full-resolution pages in a native modal dialog: Escape closes, focus stays inside. */
function ZoomDialog({
  lang,
  title,
  pages,
  index,
  open,
  onClose,
  onGo,
  label,
}: {
  lang: Lang;
  title: string;
  pages: string[];
  index: number;
  open: boolean;
  onClose: () => void;
  onGo: (i: number) => void;
  label: (i: number) => string | null;
}) {
  const t = productCopy(lang).gallery;
  const ref = useRef<HTMLDialogElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      const html = document.documentElement;
      const prev = html.style.overflow;
      html.style.overflow = "hidden";
      return () => {
        html.style.overflow = prev;
      };
    }
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [index]);

  const count = pages.length;
  const tag = label(index);

  return (
    <dialog
      ref={ref}
      aria-label={t.zoomTitle(title)}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={() => {
        if (open) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          onGo(index + 1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          onGo(index - 1);
        }
      }}
      className={clsx(
        "fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-bg p-0 text-text",
        "opacity-0 transition-[opacity,overlay,display] transition-discrete duration-200 ease-[cubic-bezier(0.32,0,0.67,0)]",
        "open:opacity-100 open:duration-300 open:ease-[cubic-bezier(0.22,1,0.36,1)] starting:open:opacity-0",
        "backdrop:bg-transparent",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-4 sm:px-6">
          <p className="min-w-0 flex-1 truncate text-sm font-medium">{title}</p>
          <span className="tabular shrink-0 text-sm text-muted" aria-live="polite">
            {t.page(index + 1, count)}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="-mr-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>

        <div ref={scroller} className="relative flex-1 overflow-auto overscroll-contain bg-surface-2">
          <div className="mx-auto w-full max-w-[56rem] px-3 py-4 sm:px-6 sm:py-8">
            <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-black/10 bg-white shadow-[var(--shadow-lg)]">
              <img
                src={pages[index]}
                alt={t.alt(title, index + 1)}
                width={900}
                height={1273}
                decoding="async"
                draggable={false}
                className="block h-auto w-full select-none"
              />
            </div>
          </div>
        </div>

        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-t border-line px-4 pb-[env(safe-area-inset-bottom)] sm:px-6">
          <button
            type="button"
            onClick={() => onGo(index - 1)}
            disabled={index === 0}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-sm font-medium transition-colors duration-150 hover:bg-surface-2 disabled:opacity-40"
          >
            <ChevronLeft aria-hidden className="h-4 w-4" />
            <span className="hidden sm:inline">{t.prev}</span>
            <span className="sr-only sm:hidden">{t.prev}</span>
          </button>
          {tag ? (
            <span className="inline-flex min-w-0 items-center gap-1.5 truncate text-xs text-muted">
              <EyeOff aria-hidden className="h-3.5 w-3.5 shrink-0" />
              {tag}
            </span>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={() => onGo(index + 1)}
            disabled={index === count - 1}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-sm font-medium transition-colors duration-150 hover:bg-surface-2 disabled:opacity-40"
          >
            <span className="hidden sm:inline">{t.next}</span>
            <span className="sr-only sm:hidden">{t.next}</span>
            <ChevronRight aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </div>
    </dialog>
  );
}
