import { fontDisplay, fontMono, fontSans } from "@/app/fonts";
import { CartProvider } from "@/lib/cart";
import { htmlLocale, type Lang } from "@/lib/i18n";
import { common } from "@/content/common";
import { themeScript } from "@/components/ui/theme";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { CartDrawer } from "./cart-drawer";

/**
 * The frame shared by both languages. There are two root layouts, one per
 * language, because only a root layout can write the lang attribute on <html>,
 * and screen readers pick their pronunciation from it.
 */
export function RootShell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const t = common(lang);
  return (
    <html
      lang={htmlLocale[lang]}
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-bg text-text antialiased">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-contrast"
        >
          {t.skip}
        </a>
        <CartProvider>
          <SiteHeader lang={lang} />
          <main id="content">{children}</main>
          <SiteFooter lang={lang} />
          <CartDrawer lang={lang} />
        </CartProvider>
      </body>
    </html>
  );
}
