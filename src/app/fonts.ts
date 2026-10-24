import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";

/**
 * Three families, no more. Reasons live in brand.md under "Typography".
 *
 * - Inter for running text. It is the body face of NNG Esport too, so the two
 *   sides of NNG read as one family, and its digits stay clear in dense price
 *   lists. globals.css turns on its cv11 and ss01 features.
 * - Plus Jakarta Sans for headings and the wordmark. It was drawn in Jakarta by
 *   Tokotype, which suits a store that sells Indonesian school material, and
 *   its open geometric shapes are friendlier than the esport side's Sora.
 * - JetBrains Mono for order numbers, file sizes and codes, never for prose.
 *
 * The CSS variables are --ff-* on purpose: Tailwind v4 reserves --font-*, and
 * globals.css maps these onto font-sans, font-display and font-mono.
 */

export const fontSans = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--ff-sans",
});

export const fontDisplay = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--ff-display",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--ff-mono",
});
