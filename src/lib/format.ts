import type { Lang } from "./i18n";

/** Rupiah without decimals, Indonesian grouping in both languages: "Rp 19.000". */
export function formatIdr(value: number): string {
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`;
}

/** Whole numbers with the grouping each language expects: 1,000 vs 1.000. */
export function formatCount(value: number, lang: Lang): string {
  return value.toLocaleString(lang === "id" ? "id-ID" : "en-US");
}

/** File size for humans: 482 KB, 1.2 MB. */
export function formatBytes(bytes: number, lang: Lang): string {
  const locale = lang === "id" ? "id-ID" : "en-US";
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024)).toLocaleString(locale)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toLocaleString(locale, { maximumFractionDigits: 1 })} MB`;
}

export function percentOff(price: number, compareAt: number): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
