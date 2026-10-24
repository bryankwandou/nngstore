import { clsx } from "clsx";

/**
 * The NNG Store mark: an A4 sheet with a folded corner, the fold cut by a
 * diagonal stroke that reads as both an "N" and a tick on a marked answer.
 * Two tones so it holds up at 16 px and on both themes.
 */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={clsx("h-8 w-8 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <rect x="1" y="1" width="30" height="30" rx="8" className="fill-brand" />
      <path d="M9 7h10l5 5v13a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" fill="#fff" />
      <path d="M19 7v4a1 1 0 0 0 1 1h4" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-soft" />
      <path
        d="M12 21.5v-8l8 8v-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-brand"
      />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {compact ? (
        <span className="sr-only">NNG Store</span>
      ) : (
        <span className="font-display text-[1.08rem] font-semibold leading-none tracking-[-0.02em] text-text">
          NNG<span className="text-muted font-medium"> Store</span>
        </span>
      )}
    </span>
  );
}
