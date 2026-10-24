/**
 * Two languages, one set of pages.
 *
 * English is the default and lives at the root. Indonesian lives under /id.
 * Path segments are not translated: /id/shop and /shop are the same page in two
 * languages, which keeps every shared link predictable and halves the number of
 * URLs that can break.
 */

export const languages = ["en", "id"] as const;
export type Lang = (typeof languages)[number];

export const defaultLang: Lang = "en";

/** Codes for the html lang attribute and hreflang, which differ from our segment codes. */
export const htmlLocale: Record<Lang, string> = {
  en: "en-US",
  id: "id-ID",
};

export const languageName: Record<Lang, string> = {
  en: "English",
  id: "Bahasa Indonesia",
};

export const routes = {
  home: "",
  shop: "shop",
  bundles: "bundles",
  cart: "cart",
  checkout: "checkout",
  library: "library",
  signin: "signin",
  protection: "protection",
  help: "help",
  terms: "terms",
  privacy: "privacy",
  refunds: "refunds",
} as const;

export type RouteKey = keyof typeof routes;
export const routeKeys = Object.keys(routes) as RouteKey[];

function prefix(lang: Lang): string {
  return lang === defaultLang ? "" : `/${lang}`;
}

/** Full href of a page in a given language. */
export function path(key: RouteKey, lang: Lang): string {
  const seg = routes[key];
  const base = prefix(lang);
  return seg ? `${base}/${seg}` : base || "/";
}

/** Href of a product or bundle detail page. Products and bundles share one slug space. */
export function productPath(slug: string, lang: Lang): string {
  return `${prefix(lang)}/shop/${slug}`;
}

/** Href of the protected reader for a purchased item. */
export function readerPath(slug: string, lang: Lang): string {
  return `${prefix(lang)}/library/${slug}`;
}

export function langFromPath(pathname: string): Lang {
  return pathname === "/id" || pathname.startsWith("/id/") ? "id" : "en";
}

/** The same page in the other language, used by the language switcher. */
export function swapLangPath(pathname: string, to: Lang): string {
  const bare = pathname.replace(/^\/id(?=\/|$)/, "") || "/";
  if (to === defaultLang) return bare;
  return bare === "/" ? `/${to}` : `/${to}${bare}`;
}
