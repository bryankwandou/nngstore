import type { Metadata, Viewport } from "next";
import { common, site } from "@/content/common";
import { defaultLang, htmlLocale, languages, type Lang } from "./i18n";

/**
 * Site-wide metadata for one language. Each page adds its own title,
 * description and hreflang pair through pageMeta, never here: anything set in a
 * root layout applies to every page below it, which would make every page
 * claim the home page as its translation.
 */
export function buildMetadata(lang: Lang): Metadata {
  const t = common(lang);
  const description = t.footer.blurb;
  return {
    metadataBase: new URL(site.url),
    title: { default: `${site.name}: ${t.tagline}`, template: `%s | ${site.name}` },
    description,
    applicationName: site.name,
    authors: [{ name: site.name }],
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: htmlLocale[lang].replace("-", "_"),
      title: `${site.name}: ${t.tagline}`,
      description,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: site.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${site.name}: ${t.tagline}`,
      description,
      images: ["/og.png"],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b10" },
  ],
};

/** Per-page metadata with a canonical URL and the hreflang pair. `bare` is the path without the /id prefix. */
export function pageMeta({
  lang,
  bare,
  title,
  description,
  image,
}: {
  lang: Lang;
  bare: string;
  title?: string;
  description?: string;
  image?: string;
}): Metadata {
  const href = (l: Lang) => (l === defaultLang ? bare || "/" : `/${l}${bare === "/" ? "" : bare}`);
  const languagesMap = Object.fromEntries(languages.map((l) => [htmlLocale[l], href(l)]));
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: {
      canonical: href(lang),
      languages: { ...languagesMap, "x-default": href(defaultLang) },
    },
    ...(image || title || description
      ? {
          openGraph: {
            ...(title ? { title } : {}),
            ...(description ? { description } : {}),
            url: href(lang),
            ...(image ? { images: [{ url: image }] } : {}),
          },
        }
      : {}),
  };
}
