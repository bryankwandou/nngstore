import { clsx } from "clsx";
import { formatIdr, percentOff } from "@/lib/format";
import type { Lang } from "@/lib/i18n";

const offLabel = { en: "off", id: "hemat" } as const;
const wasLabel = { en: "Was", id: "Sebelumnya" } as const;

export function Price({
  value,
  compareAt,
  lang,
  size = "md",
  className,
}: {
  value: number;
  compareAt?: number;
  lang: Lang;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const off = compareAt ? percentOff(value, compareAt) : 0;
  return (
    <span className={clsx("inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span
        className={clsx(
          "tabular font-semibold tracking-tight text-text",
          size === "sm" && "text-sm",
          size === "md" && "text-base",
          size === "lg" && "text-2xl sm:text-3xl",
        )}
      >
        {formatIdr(value)}
      </span>
      {off > 0 && compareAt ? (
        <>
          <span className="tabular text-sm text-subtle line-through">
            <span className="sr-only">{wasLabel[lang]} </span>
            {formatIdr(compareAt)}
          </span>
          <span className="tabular text-xs font-semibold text-success">
            {lang === "id" ? `${offLabel.id} ${off}%` : `${off}% ${offLabel.en}`}
          </span>
        </>
      ) : null}
    </span>
  );
}
