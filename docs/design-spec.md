# NNG Store design spec (build contract)

Source of truth for every page. Based on docs/research/design-research.md (decisions 1.1-1.11) and brand.md. When this file and the research disagree, this file wins.

## 0. Ground rules for every agent

- Project: `E:\000VSCODE PROJECT MULAI DARI DESEMBER 2025\nngstore`. Next.js 16.3 App Router, React 19.2, TypeScript strict, Tailwind v4, motion 14 (`motion/react`), lucide-react 1.55, clsx.
- Write ONLY the files you own (listed in your brief). Shared files below are read-only for you; if you need a change there, say so in your final reply.
- Do NOT run `next dev` (file watching is broken on the E: drive) and do NOT run `next build` (one build at a time; the main thread builds). Check your work with `npx tsc --noEmit -p .` and `npx eslint <your files>`; errors in files you do not own can be ignored (other agents are writing in parallel).
- No new npm packages. No package.json / next.config.ts edits.
- Never open files whose names suggest keys, wallets or credentials.
- Save as you go: a usage limit can cut any agent off; files on disk survive.

## 1. Routes and route files

English at the root, Indonesian under `/id`. Two root layouts: `src/app/(en)/layout.tsx` and `src/app/(id)/layout.tsx`. Each page is a thin route file that renders a view with a `lang` prop. Pattern:

```tsx
// src/app/(en)/shop/page.tsx
import { ShopView, shopMetadata } from "@/views/shop";
export const generateMetadata = () => shopMetadata("en");
export default function Page() { return <ShopView lang="en" />; }
// src/app/(id)/id/shop/page.tsx is the same with "id"
```

Paths come from `src/lib/i18n.ts`: `path(key, lang)`, `productPath(slug, lang)`, `readerPath(slug, lang)`, `swapLangPath`. Keys: home, shop, bundles, cart, checkout, library, signin, protection, help, terms, privacy, refunds. Product and bundle detail: `/shop/[slug]` (bundle slugs start with `bundle-`). Reader: `/library/[slug]`.

Metadata: `pageMeta({ lang, bare, title, description, image })` from `src/lib/meta.ts` (canonical + hreflang). `bare` is the path without `/id`, e.g. "/shop".

## 2. Shared building blocks (read-only)

- Tokens: `src/styles/tokens.css`, mapped in `src/app/globals.css` to utilities: `bg-bg bg-bg-elev bg-surface bg-surface-2 border-line border-line-strong text-text text-muted text-subtle bg-brand text-brand bg-brand-strong bg-brand-soft text-brand-contrast bg-accent bg-accent-soft text-success text-warning text-danger ring-ring`, radii `rounded-[var(--radius-sm|md|lg|xl)]`, shadows `shadow-[var(--shadow-sm|md|lg)]`, fonts `font-sans font-display font-mono`. Never hardcode colors except on paper (covers stay white).
- Layout utilities: `container-page` (max 80rem, side padding 16/24/32), `tabular` (tabular numerals), `no-scrollbar`.
- Copy: `defineCopy({ en, id })` from `src/content/copy.ts` (Indonesian must match the English shape key for key). Shared words: `common(lang)` and `site` in `src/content/common.ts`.
- Format: `formatIdr(n)` -> "Rp 19.000", `formatCount(n, lang)`, `formatBytes(bytes, lang)`, `percentOff` in `src/lib/format.ts`.
- Cart: `useCart()` from `src/lib/cart.tsx` (slugs, has, add, remove, toggle, clear, open, close, isOpen, ready).
- UI: `Button`, `ButtonLink`, `buttonClass` (`src/components/ui/button.tsx`; variants primary|secondary|outline|ghost, sizes sm|md|lg, pill shape); `Badge`; `Price` (value, compareAt, lang, size); `Sheet` (native dialog panel: side left/right, variant sheet|palette); `ThemeToggle`.
- Motion: `Reveal` and `Stagger` from `src/components/motion/reveal.tsx` (CSS-driven, content visible without JS, failsafe after 2.5 s). Use them for section entrances instead of hand-rolled motion. Use `motion/react` only for interactive motion (hover, drag, layout, page turns, tickers).
- Product UI: `ProductCard` + `ProductCardSkeleton` (`src/components/product/product-card.tsx`), `Paper` and `PaperStack` (A4 paper frames), `QuickAdd`, `BuyButtons` (`cart-buttons.tsx`), `CardModel` type (`types.ts`).
- Catalog: `src/data/catalog.ts` (being finished in parallel): `catalog` (series, subjects, categories, products, bundles), `getItem`, `getProduct`, `getBundle`, `listProducts(filters)`, `bundlesContaining(slug)`, `relatedProducts(slug, n)`. Product fields: slug, kind "product", series, subject, category, level ("SD" | "SD-SMP"), questions, pages, bytes, contains[], title{en,id}, short{en,id}, description{en,id}, priceIdr, previewSharp, images {cover, previews[]}. Bundle: slug, kind "bundle", title, short, description, items[], priceIdr, compareAtIdr, images {stack[]}.
- View helpers: `src/lib/catalog-view.ts` (main thread): `toCardModel(item, lang)`, `seriesLabel(id, lang)`, `seriesChip(id, lang)`, `subjectLabel(id, lang)`, `categoryLabel(id, lang)`, `metaLine(item, lang)`, `storeStats()` -> { products, bundles, subjects, series, questions, pages }.
- Header, footer, cart drawer, search palette (Ctrl/Cmd+K) already exist in the root shell. Pages render only their own content inside `<main>`.

## 3. Visual rules

- Warm paper canvas, one action accent (`brand`) for primary buttons, links, focus and active filters only. No gradient text, no purple-blue hero gradients, no glow, no blurred blobs, no alternating background stripes: separate sections with spacing and an occasional hairline.
- Type scale: display clamp(44px, 1.6rem + 5vw, 72px) weight 650 leading 1.05 tracking -0.03em; h1 clamp(32px, 1.4rem + 2.6vw, 48px); h2 clamp(24px, 1.2rem + 1.4vw, 36px); h3 20-24 weight 500; body 16 / 1.6; small 14; eyebrow 12 uppercase tracking 0.08em text-subtle. Display font only for display/h1/h2.
- Spacing on a 4 px scale; section padding 64 px mobile / 96 px desktop; card gaps 24 px desktop, 16 px mobile. Reading width 65ch.
- Radius: 6 inputs, 8 cards/covers, 12 panels/modals, pill buttons and chips. Shadows only sm/md/lg tokens.
- Grids: product grid 2 columns at 360-639, 3 at 640+, 4 at 1024+ (gap-x 24, gap-y 40).
- Touch targets at least 40 px. Visible focus ring everywhere (globals handles `:focus-visible`).
- Dark mode must look designed, not inverted: check every new surface in both themes.
- Every list/fetch has loading, empty and error states.

## 4. Motion rules

Easing enter cubic-bezier(0.22,1,0.36,1), exit cubic-bezier(0.32,0,0.67,0), standard cubic-bezier(0.2,0,0,1). Animate transform and opacity only. Hover 100-200 ms, entrances 500-700 ms, modal 320 in / 200 out, page turn 250 ms, ticker 800 ms. At most 2 ambient animations per screen (the only allowed loops: one cover marquee at ~60 s per cycle that pauses on hover, and nothing else). Reduced motion: final states, no tilt, no marquee, no ticker counting.

## 5. Copy rules

Plain, specific, calm. Counts instead of adjectives. No emoji, no exclamation marks, no fake urgency, no testimonials or ratings (none exist yet), no "official" unless the series is literally the official pack. Banned words: unlock, elevate, seamless, empower, journey, delve, cutting-edge, revolutionize, game-changer, ultimate, comprehensive solution, world-class, next-level. Indonesian is written as Indonesian (use "kamu" in store copy, "Anda" in legal pages), not translated English. Prices always "Rp 19.000". Numbers in copy come from the catalog at build time, never typed by hand.

Unknown facts must not be invented: there is no WhatsApp number or email yet (use Instagram DM @nngstoreofficial as the contact), no reviews, no sales counts, no curriculum claims beyond what file titles say.

## 6. Pages

### Home `/` (views/home)
1. Hero, two columns (stack on mobile): left = eyebrow ("192 printable files for SD and SMP"), display headline (word-by-word rise, 40 ms stagger, first 8 words), one-sentence subline, a search field that opens the search palette (or links to /shop?q=), primary CTA "Browse the shop", secondary "See how files are protected". Right = an interactive stack of 5 real cover pages (Paper) that fans out on load (600 ms) and flips the top page to the back on click/tap or arrow keys (450 ms), labelled with the product title and price, linking to the product. Flat canvas background, no gradient.
2. Trust strip: real counts with number tickers (files, subjects, total questions, bundles), plus "Pay with QRIS, e-wallets or bank transfer" and "Read right after payment".
3. Browse by subject: tiles grouped by category with real counts, subtle spotlight hover (radial highlight following the pointer, fine pointer only), 4 px colored left bar or dot per category.
4. Browse by type: the series as chips/cards with one-line explanations (what is inside: questions, answers, explanations) and counts.
5. Featured products: 8 ProductCards (mix of series), "View all" link.
6. Look inside: an inline preview viewer of a real product (preview pages 1-3 with arrows, page counter, the stated preview rule) and a short explanation of what is visible before purchase.
7. How it works: 3 steps (Choose, Pay with Midtrans, Read in your library), with a small illustration built from Paper components or simple SVG lines.
8. Bundles: 3-4 bundle cards with the real saving ("Save Rp 47.000 compared to buying each file").
9. Cover marquee: one slow row of covers (ambient, pauses on hover, hidden under reduced motion).
10. FAQ: 6-8 questions in native <details> elements (download? devices? refund? invoice? school purchase? contact).
11. Closing CTA band: one sentence plus "Browse the shop".

### Shop `/shop` (views/shop)
Header: h1, count, search input (filters the grid live). Filters: category, subject, series (type), level (SD / SD-SMP), price sort; desktop = left rail (240 px), mobile = "Filters" button opening a Sheet. Filters are synced to the URL (`?category=&subject=&series=&level=&sort=&q=`) on the client (read `window.location.search` in an effect; avoid `useSearchParams` without a Suspense boundary). Active filters as removable chips; result count; ProductCard grid; empty state with "Clear filters". Bundles appear in their own row above results when no filter is active.

### Product `/shop/[slug]` (views/product)
Desktop 12 columns: gallery 7 / buy box 5 (sticky top 88 px). Breadcrumb (Shop / Subject / Title). Gallery: large page viewer of preview pages with thumbnails, arrows, swipe, zoom-in modal (Sheet palette or custom dialog), the honest preview rule ("Pages 1-2 shown in full, page 3 blurred" from previewSharp, or "Answers are blurred in the preview"). Buy box: series chip, h1 title, short line, meta chips (level, questions, pages, file size, PDF), Price, BuyButtons, note "Opens in your library right after payment", payment line, 3 facts (what you get, how you read it, refund rule one-liner linking /refunds). Below: "What is inside" (description + contains list), "Who it is for", "How delivery works" (links /protection), bundle upsell from bundlesContaining with real arithmetic, related products (4 cards). Mobile sticky bottom bar (price + add) after the buy box leaves the viewport. generateStaticParams for all products and bundles. Bundle detail uses the same layout with PaperStack and the list of included files (each linking to its page). 404 for unknown slugs via notFound().

### Bundles `/bundles` (views/bundles)
h1, one line, grid of bundle cards grouped "By subject" and "By type", each showing saving.

### Checkout `/checkout`, Library `/library`, Reader `/library/[slug]`, Sign in `/signin` (views/checkout, views/library)
Checkout: two columns (form left, summary right; summary first on mobile). Fields: email (required, type=email, autocomplete=email), name (autocomplete=name), WhatsApp optional (type=tel). Summary lists items from the cart with covers and subtotal, refund checkbox ("I understand these are digital files" + link). Pay button "Pay Rp X". Payment runs in DEMO MODE until Midtrans keys are added: POST /api/checkout validates slugs server-side and returns { mode: "demo" | "midtrans", orderId, token? }. In demo mode show a clearly labelled demo payment panel (QRIS / e-wallet / VA tabs, a "Simulate successful payment" button) and then grant access. Real mode loads Snap.js with the client key and calls snap.pay(token). Library: purchased items (demo purchases are stored in a signed httpOnly cookie set by the server), "Read" buttons, empty state with suggestions. Reader page wraps the ProtectedReader component from src/components/reader.

### Content pages (views/pages)
Help (FAQ grouped: buying, reading, protection, refunds, contact), Protection (how files are protected, honest about limits, with a live demo of the per-buyer watermark), Refunds (48-hour window and the four refunded cases), Terms, Privacy, and a not-found page per language group with search and popular links.

## 7. Accessibility checklist (every page)

Real buttons and links, labelled form fields with type and autocomplete, alt text on images (decorative = alt=""), heading order without gaps, keyboard paths for every interaction (galleries: arrows; dialogs: Escape), aria-live for counts that change, contrast AA in both themes, 375 / 768 / 1280 px layouts without horizontal scroll.
