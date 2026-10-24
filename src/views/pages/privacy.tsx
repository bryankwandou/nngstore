import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { privacyCopy } from "@/content/privacy";
import { LegalLayout } from "./legal-layout";

export function privacyMetadata(lang: Lang): Metadata {
  const t = privacyCopy(lang);
  return pageMeta({ lang, bare: "/privacy", title: t.meta.title, description: t.meta.description });
}

export function PrivacyView({ lang }: { lang: Lang }) {
  return <LegalLayout doc={privacyCopy(lang)} lang={lang} />;
}
