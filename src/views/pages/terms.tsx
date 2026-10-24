import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { termsCopy } from "@/content/terms";
import { LegalLayout } from "./legal-layout";

export function termsMetadata(lang: Lang): Metadata {
  const t = termsCopy(lang);
  return pageMeta({ lang, bare: "/terms", title: t.meta.title, description: t.meta.description });
}

export function TermsView({ lang }: { lang: Lang }) {
  return <LegalLayout doc={termsCopy(lang)} lang={lang} />;
}
