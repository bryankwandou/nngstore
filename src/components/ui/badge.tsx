import { clsx } from "clsx";
import type { ReactNode } from "react";

type Tone = "neutral" | "brand" | "accent" | "success" | "warning";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted border-line",
  brand: "bg-brand-soft text-brand-strong border-transparent",
  accent: "bg-accent-soft text-text border-transparent",
  success: "bg-surface-2 text-success border-line",
  warning: "bg-surface-2 text-warning border-line",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
