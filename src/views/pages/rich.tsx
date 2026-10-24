import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { clsx } from "clsx";
import { site } from "@/content/common";
import { path, routes, type Lang, type RouteKey } from "@/lib/i18n";

/**
 * Renders the small copy format used by the content pages:
 * a string is a paragraph, an array of strings is a bullet list, and
 * [label](target) inside a string becomes a link. A target is a route key,
 * "ig" for the Instagram profile, or "demo" for the stamped sample file.
 */
export type Block = string | readonly string[];

export const DEMO_URL = "/api/demo-read";

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

export const linkClass =
  "font-medium text-brand underline decoration-brand/40 underline-offset-[3px] transition-colors hover:decoration-brand";

function isRoute(target: string): target is RouteKey {
  return Object.prototype.hasOwnProperty.call(routes, target);
}

export function Inline({ text, lang }: { text: string; lang: Lang }) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    const [whole, label, target] = m;
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    if (target === "ig") {
      out.push(
        <a key={at} href={site.instagram} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {label}
        </a>,
      );
    } else if (target === "demo") {
      out.push(
        <a key={at} href={DEMO_URL} target="_blank" rel="noopener" className={linkClass}>
          {label}
        </a>,
      );
    } else if (isRoute(target)) {
      out.push(
        <Link key={at} href={path(target, lang)} className={linkClass}>
          {label}
        </Link>,
      );
    } else {
      out.push(label);
    }
    last = at + whole.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out.map((part, i) => (typeof part === "string" ? <Fragment key={`t${i}`}>{part}</Fragment> : part))}</>;
}

export function Blocks({
  blocks,
  lang,
  className,
}: {
  blocks: readonly Block[];
  lang: Lang;
  className?: string;
}) {
  return (
    <div className={clsx("space-y-4 text-base leading-[1.7] text-muted", className)}>
      {blocks.map((b, i) =>
        typeof b === "string" ? (
          <p key={i}>
            <Inline text={b} lang={lang} />
          </p>
        ) : (
          <ul key={i} className="space-y-2.5">
            {b.map((item, j) => (
              <li key={j} className="relative pl-5">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-[0.72em] h-1.5 w-1.5 rounded-full bg-line-strong"
                />
                <Inline text={item} lang={lang} />
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

/** Page heading block shared by every content page. */
export function PageIntro({
  eyebrow,
  title,
  intro,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={clsx("max-w-[65ch]", className)}>
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-subtle">{eyebrow}</p>
      <h1 className="mt-3 font-display text-[clamp(32px,1.4rem+2.6vw,48px)] font-semibold leading-[1.1] tracking-[-0.025em] text-text">
        {title}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">{intro}</p>
      {children}
    </header>
  );
}
