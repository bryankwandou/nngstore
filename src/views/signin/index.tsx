import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { path, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { site } from "@/content/common";
import { libraryCopy } from "@/content/library";
import { ButtonLink } from "@/components/ui/button";
import { RestoreForm } from "./restore-form";

export function signinMetadata(lang: Lang): Metadata {
  const t = libraryCopy(lang).signin.meta;
  return {
    ...pageMeta({ lang, bare: "/signin", title: t.title, description: t.description }),
    robots: { index: false, follow: true },
  };
}

/** There are no accounts yet: this page explains how purchases stay with the buyer. */
export function SigninView({ lang }: { lang: Lang }) {
  const t = libraryCopy(lang).signin;
  return (
    <div className="container-page pb-20 pt-10 sm:pb-24 sm:pt-16">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-subtle">{t.eyebrow}</p>
        <h1 className="mt-2 font-display text-[clamp(32px,1.4rem+2.6vw,48px)] font-semibold leading-[1.1] tracking-[-0.02em]">
          {t.title}
        </h1>
        <p className="mt-3 text-lg text-muted">{t.lead}</p>

        <ol className="mt-10 space-y-4">
          {t.points.map((p, i) => (
            <li key={p.title} className="flex gap-4 rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)]">
              <span className="tabular inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-strong">
                {i + 1}
              </span>
              <div className="min-w-0">
                <h2 className="font-sans text-base font-semibold">{p.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">{p.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={path("library", lang)}>
            {t.library}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href={path("help", lang)} variant="secondary">
            {t.help}
          </ButtonLink>
        </div>
        <RestoreForm lang={lang} />
        <p className="mt-6 text-sm text-muted">
          {t.contact}{" "}
          <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="font-medium text-brand underline underline-offset-4">
            {site.instagramHandle}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
