"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";

export interface ProtectedReaderProps {
  /** URL that returns the already-stamped PDF bytes. */
  url: string;
  /** Shown in the live watermark. */
  buyerName: string;
  lang?: "en" | "id";
  title?: string;
}

const COPY = {
  en: {
    loading: "Opening your file",
    errorTitle: "We could not open this file",
    errorBody: "Check your connection and try again. If it keeps failing, your access link may have expired.",
    retry: "Try again",
    emptyTitle: "This file has no pages",
    emptyBody: "The file opened but contains nothing to show. Please contact support.",
    page: "Page",
    of: "of",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    fit: "Fit to width",
    prev: "Previous page",
    next: "Next page",
    blocked: "Saving, printing and copying are turned off in this reader. This copy is licensed to you only.",
    paused: "Reading is paused while this window is in the background. Click here to continue.",
    reading: "Document reader",
    pageLabel: (n: number) => `Page ${n}`,
  },
  id: {
    loading: "Membuka file kamu",
    errorTitle: "File ini belum bisa dibuka",
    errorBody: "Periksa koneksi kamu lalu coba lagi. Kalau masih gagal, tautan aksesnya mungkin sudah kedaluwarsa.",
    retry: "Coba lagi",
    emptyTitle: "File ini tidak punya halaman",
    emptyBody: "File terbuka tetapi tidak ada yang bisa ditampilkan. Silakan hubungi dukungan.",
    page: "Halaman",
    of: "dari",
    zoomIn: "Perbesar",
    zoomOut: "Perkecil",
    fit: "Sesuaikan lebar",
    prev: "Halaman sebelumnya",
    next: "Halaman berikutnya",
    blocked: "Menyimpan, mencetak, dan menyalin dinonaktifkan di pembaca ini. Salinan ini berlisensi hanya untuk kamu.",
    paused: "Membaca dijeda saat jendela ini ada di latar belakang. Klik di sini untuk melanjutkan.",
    reading: "Pembaca dokumen",
    pageLabel: (n: number) => `Halaman ${n}`,
  },
} as const;

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 4;
const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

type Status = "loading" | "ready" | "error" | "empty";

export default function ProtectedReader({ url, buyerName, lang = "en", title }: ProtectedReaderProps) {
  const t = COPY[lang];
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [status, setStatus] = useState<Status>("loading");
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [baseWidth, setBaseWidth] = useState(612); // page 1 width at scale 1
  const [baseHeight, setBaseHeight] = useState(792);
  const [attempt, setAttempt] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null); // null = fit width
  const [fitScale, setFitScale] = useState(1);
  const [current, setCurrent] = useState(1);
  const [near, setNear] = useState<ReadonlySet<number>>(new Set([1]));
  const [away, setAway] = useState(false);
  const [notice, setNotice] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const scale = zoom ?? fitScale;
  const numPages = doc?.numPages ?? 0;

  // A new file or a retry starts from a clean loading state before the effect runs.
  const loadKey = `${url}#${attempt}`;
  const [shownKey, setShownKey] = useState(loadKey);
  if (shownKey !== loadKey) {
    setShownKey(loadKey);
    setStatus("loading");
    setDoc(null);
  }

  // ---- Load the document (client only, dynamic import) ----
  useEffect(() => {
    let cancelled = false;
    let loaded: PDFDocumentProxy | null = null;
    let task: { destroy(): Promise<void> } | null = null;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
        const res = await fetch(url, { cache: "no-store", credentials: "same-origin" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = new Uint8Array(await res.arrayBuffer());
        const loading = pdfjs.getDocument({ data });
        task = loading;
        loaded = await loading.promise;
        if (cancelled) {
          void task.destroy();
          return;
        }
        if (loaded.numPages < 1) {
          setStatus("empty");
          return;
        }
        const first = await loaded.getPage(1);
        const vp = first.getViewport({ scale: 1 });
        if (cancelled) return;
        setBaseWidth(vp.width);
        setBaseHeight(vp.height);
        setDoc(loaded);
        setCurrent(1);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
      void task?.destroy();
    };
  }, [url, attempt]);

  // ---- Fit-to-width follows the scroller size ----
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || status !== "ready") return;
    const update = () => setFitScale(clampZoom((el.clientWidth - 32) / baseWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [status, baseWidth]);

  // ---- Which pages are near the viewport, and which is current ----
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !doc) return;
    const nearSet = new Set<number>([1]);
    const nearObs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const n = Number((e.target as HTMLElement).dataset.page);
          if (e.isIntersecting) nearSet.add(n);
          else nearSet.delete(n);
        }
        setNear(new Set(nearSet));
      },
      { root: scroller, rootMargin: "700px 0px" },
    );
    const midObs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setCurrent(Number((e.target as HTMLElement).dataset.page));
        }
      },
      { root: scroller, rootMargin: "-50% 0px -49% 0px" },
    );
    scroller.querySelectorAll<HTMLElement>("[data-page]").forEach((el) => {
      nearObs.observe(el);
      midObs.observe(el);
    });
    return () => {
      nearObs.disconnect();
      midObs.disconnect();
    };
  }, [doc, scale]);

  // ---- Focus loss blurs pages ----
  useEffect(() => {
    const check = () => setAway(document.hidden || !document.hasFocus());
    const hide = () => setAway(true);
    const show = () => setAway(document.hidden);
    window.addEventListener("blur", hide);
    window.addEventListener("focus", show);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.removeEventListener("blur", hide);
      window.removeEventListener("focus", show);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  // ---- Watermark clock ----
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => () => clearTimeout(noticeTimer.current), []);

  const flashNotice = useCallback(() => {
    setNotice(true);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(false), 3500);
  }, []);

  const goTo = useCallback(
    (n: number) => {
      const page = Math.min(Math.max(1, n), Math.max(1, numPages));
      scrollerRef.current
        ?.querySelector<HTMLElement>(`[data-page="${page}"]`)
        ?.scrollIntoView({ block: "start", behavior: "auto" });
      setCurrent(page);
    },
    [numPages],
  );

  const zoomBy = useCallback(
    (factor: number) => setZoom((z) => clampZoom((z ?? fitScale) * factor)),
    [fitScale],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && ["s", "p", "c"].includes(e.key.toLowerCase())) {
      e.preventDefault();
      flashNotice();
      return;
    }
    if (mod) return;
    switch (e.key) {
      case "ArrowRight":
      case "PageDown":
        e.preventDefault();
        goTo(current + 1);
        break;
      case "ArrowLeft":
      case "PageUp":
        e.preventDefault();
        goTo(current - 1);
        break;
      case "+":
      case "=":
        e.preventDefault();
        zoomBy(1.25);
        break;
      case "-":
      case "_":
        e.preventDefault();
        zoomBy(1 / 1.25);
        break;
      case "0":
        setZoom(null);
        break;
    }
  };

  const stamp = useMemo(
    () =>
      `${buyerName} · ${now.toLocaleString(lang === "id" ? "id-ID" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })}`,
    [buyerName, now, lang],
  );

  const btn =
    "inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-text transition-colors " +
    "hover:bg-surface-2 disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "focus-visible:outline-[var(--ring)] motion-reduce:transition-none";

  return (
    <div
      ref={rootRef}
      data-protected
      role="region"
      aria-label={title ?? t.reading}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onCopy={(e) => {
        e.preventDefault();
        flashNotice();
      }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      className="relative flex h-[min(85vh,60rem)] min-h-[28rem] flex-col overflow-hidden rounded-[var(--radius-md)] border border-line bg-bg text-text shadow-[var(--shadow-md)] select-none outline-none"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface px-3 py-2">
        <div className="flex items-center gap-1">
          <button type="button" className={btn} onClick={() => goTo(current - 1)} disabled={current <= 1 || status !== "ready"} aria-label={t.prev}>
            <ChevronLeft size={18} aria-hidden />
          </button>
          <span className="min-w-28 text-center text-sm text-muted tabular-nums" aria-live="polite">
            {status === "ready" ? `${t.page} ${current} ${t.of} ${numPages}` : "—"}
          </span>
          <button type="button" className={btn} onClick={() => goTo(current + 1)} disabled={current >= numPages || status !== "ready"} aria-label={t.next}>
            <ChevronRight size={18} aria-hidden />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className={btn} onClick={() => zoomBy(1 / 1.25)} disabled={status !== "ready" || scale <= MIN_ZOOM} aria-label={t.zoomOut}>
            <ZoomOut size={18} aria-hidden />
          </button>
          <span className="w-12 text-center text-sm text-muted tabular-nums">{Math.round(scale * 100)}%</span>
          <button type="button" className={btn} onClick={() => zoomBy(1.25)} disabled={status !== "ready" || scale >= MAX_ZOOM} aria-label={t.zoomIn}>
            <ZoomIn size={18} aria-hidden />
          </button>
          <button type="button" className={clsx(btn, zoom === null && "bg-surface-2")} onClick={() => setZoom(null)} disabled={status !== "ready"} aria-label={t.fit} aria-pressed={zoom === null}>
            <Maximize2 size={18} aria-hidden />
          </button>
        </div>
      </div>

      {/* Pages */}
      <div ref={scrollerRef} className="relative flex-1 overflow-auto bg-surface-2">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 p-6" role="status" aria-label={t.loading}>
            <div
              className="animate-pulse rounded-[var(--radius-md)] bg-surface motion-reduce:animate-none"
              style={{ width: "min(100%, 36rem)", aspectRatio: "612 / 792" }}
            />
            <p className="text-sm text-muted">{t.loading}</p>
          </div>
        )}

        {status === "error" && (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 p-10 text-center" role="alert">
            <h2 className="text-lg font-semibold">{t.errorTitle}</h2>
            <p className="text-sm text-muted">{t.errorBody}</p>
            <button
              type="button"
              onClick={() => setAttempt((a) => a + 1)}
              className="rounded-[var(--radius-md)] bg-brand px-4 py-2 text-sm font-medium text-brand-contrast hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            >
              {t.retry}
            </button>
          </div>
        )}

        {status === "empty" && (
          <div className="mx-auto flex max-w-md flex-col items-center gap-2 p-10 text-center">
            <h2 className="text-lg font-semibold">{t.emptyTitle}</h2>
            <p className="text-sm text-muted">{t.emptyBody}</p>
          </div>
        )}

        {status === "ready" && doc && (
          <div
            className={clsx(
              "flex flex-col items-center gap-4 p-4 transition-[filter] duration-150 motion-reduce:transition-none",
              away && "blur-xl",
            )}
            aria-hidden={away}
          >
            {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
              <PageView
                key={n}
                doc={doc}
                pageNumber={n}
                scale={scale}
                active={near.has(n)}
                fallbackWidth={baseWidth * scale}
                fallbackHeight={baseHeight * scale}
                label={t.pageLabel(n)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Live watermark, above everything, never intercepts input */}
      {status === "ready" && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -inset-1/2 flex -rotate-[30deg] flex-wrap content-around justify-around gap-x-16 gap-y-24 text-sm font-medium text-text opacity-[0.07]">
            {Array.from({ length: 48 }, (_, i) => (
              <span key={i} className="whitespace-nowrap">
                {stamp}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Paused overlay */}
      {away && status === "ready" && (
        <button
          type="button"
          onClick={() => {
            setAway(false);
            rootRef.current?.focus();
          }}
          className="absolute inset-0 flex items-center justify-center bg-bg/60 p-6 text-center text-sm font-medium text-text"
        >
          <span className="max-w-xs rounded-[var(--radius-md)] border border-line bg-surface px-4 py-3 shadow-[var(--shadow-md)]">
            {t.paused}
          </span>
        </button>
      )}

      {/* Polite notice */}
      <div
        role="status"
        className={clsx(
          "pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4 transition-opacity duration-200 motion-reduce:transition-none",
          notice ? "opacity-100" : "opacity-0",
        )}
      >
        <p className="max-w-md rounded-[var(--radius-md)] border border-line bg-surface px-4 py-2 text-center text-sm shadow-[var(--shadow-md)]">
          {notice ? t.blocked : ""}
        </p>
      </div>
    </div>
  );
}

interface PageViewProps {
  doc: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  active: boolean;
  fallbackWidth: number;
  fallbackHeight: number;
  label: string;
}

function PageView({ doc, pageNumber, scale, active, fallbackWidth, fallbackHeight, label }: PageViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!active) {
      // Free the bitmap when the page is far from view.
      canvas.width = 0;
      canvas.height = 0;
      return;
    }
    let cancelled = false;
    let task: RenderTask | null = null;
    (async () => {
      try {
        const page = await doc.getPage(pageNumber);
        if (cancelled) return;
        const vp = page.getViewport({ scale });
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(vp.width * ratio);
        canvas.height = Math.floor(vp.height * ratio);
        setSize({ w: vp.width, h: vp.height });
        task = page.render({
          canvas,
          viewport: vp,
          transform: ratio !== 1 ? [ratio, 0, 0, ratio, 0, 0] : undefined,
        });
        await task.promise;
      } catch {
        // Cancelled renders reject; anything else leaves the page blank.
      }
    })();
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, pageNumber, scale, active]);

  const w = size?.w ?? fallbackWidth;
  const h = size?.h ?? fallbackHeight;

  return (
    <div
      data-page={pageNumber}
      className="relative shrink-0 bg-white shadow-[var(--shadow-md)]"
      style={{ width: w, height: h }}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        className="block h-full w-full select-none"
        style={{ width: w, height: h }}
      />
    </div>
  );
}
