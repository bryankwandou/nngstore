"use client";

import { useId, useState } from "react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { formatCount } from "@/lib/format";
import { shopCopy } from "@/content/shop";
import type { FacetKey, Option, ShopOptions, ShopState } from "./filters";

const COLLAPSED = 7;

/**
 * The filter groups, shared by the desktop rail and the mobile sheet. Each
 * group is a native radio group, so arrow keys move between options and screen
 * readers announce "3 of 19" without extra work.
 */
export function FilterPanel({
  lang,
  state,
  options,
  counts,
  onPick,
  className,
}: {
  lang: Lang;
  state: ShopState;
  options: ShopOptions;
  counts: Record<FacetKey, Map<string, number>>;
  onPick: (key: FacetKey, value: string) => void;
  className?: string;
}) {
  const t = shopCopy(lang);
  const subjects = state.category ? options.subject.filter((o) => o.group === state.category) : options.subject;

  return (
    <div className={clsx("flex flex-col gap-7", className)}>
      <Group lang={lang} name="category" legend={t.category} options={options.category} value={state.category} counts={counts.category} onPick={onPick} />
      <Group lang={lang} name="subject" legend={t.subject} options={subjects} value={state.subject} counts={counts.subject} onPick={onPick} collapsible />
      <Group lang={lang} name="series" legend={t.series} options={options.series} value={state.series} counts={counts.series} onPick={onPick} collapsible />
      <Group lang={lang} name="level" legend={t.level} options={options.level} value={state.level} counts={counts.level} onPick={onPick} />
    </div>
  );
}

function Group({
  lang,
  name,
  legend,
  options,
  value,
  counts,
  onPick,
  collapsible = false,
}: {
  lang: Lang;
  name: FacetKey;
  legend: string;
  options: Option[];
  value: string;
  counts: Map<string, number>;
  onPick: (key: FacetKey, value: string) => void;
  collapsible?: boolean;
}) {
  const t = shopCopy(lang);
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const canCollapse = collapsible && options.length > COLLAPSED + 1;
  const selectedIndex = options.findIndex((o) => o.id === value);
  // Never hide the chosen option behind "show all".
  const visible =
    canCollapse && !expanded
      ? options.filter((o, i) => i < COLLAPSED || i === selectedIndex)
      : options;
  const all: Option = { id: "", label: t.all };

  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-subtle">{legend}</legend>
      <div className="flex flex-col gap-0.5" id={`${id}-list`}>
        {[all, ...visible].map((o) => (
          <Choice
            key={o.id || "all"}
            name={`${id}-${name}`}
            label={o.label}
            count={counts.get(o.id) ?? 0}
            checked={value === o.id}
            lang={lang}
            onChange={() => onPick(name, o.id)}
          />
        ))}
      </div>
      {canCollapse ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={`${id}-list`}
          onClick={() => setExpanded((x) => !x)}
          className="mt-1 inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 text-sm font-medium text-brand hover:text-brand-strong"
        >
          {expanded ? t.showFewer : t.showAllOptions(options.length)}
          <ChevronDown aria-hidden className={clsx("h-4 w-4 transition-transform duration-200", expanded && "rotate-180")} />
        </button>
      ) : null}
    </fieldset>
  );
}

function Choice({
  name,
  label,
  count,
  checked,
  lang,
  onChange,
}: {
  name: string;
  label: string;
  count: number;
  checked: boolean;
  lang: Lang;
  onChange: () => void;
}) {
  const disabled = count === 0 && !checked;
  return (
    <label
      className={clsx(
        "group/choice relative flex min-h-10 cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm transition-colors duration-150",
        "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-1 has-[input:focus-visible]:outline-ring",
        checked ? "bg-brand-soft font-medium text-text" : "text-muted hover:bg-surface-2 hover:text-text",
        disabled && "cursor-not-allowed opacity-45 hover:bg-transparent hover:text-muted",
      )}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={clsx(
          "grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors duration-150",
          checked ? "border-brand bg-brand" : "border-line-strong bg-surface",
        )}
      >
        <span className={clsx("h-1.5 w-1.5 rounded-full bg-brand-contrast transition-transform duration-150", checked ? "scale-100" : "scale-0")} />
      </span>
      <span className="min-w-0 flex-1 leading-snug">{label}</span>
      <span className="tabular shrink-0 text-xs text-subtle">{formatCount(count, lang)}</span>
    </label>
  );
}
