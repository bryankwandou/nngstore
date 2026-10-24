# NNG Store design research

Date: 2026-10-11. 15 fetches/searches used. Where a source failed (TPT 403, Etsy 403, KaryaKarsa help pages not indexed), the decision is marked "own design" and is not presented as observed.

# Part 1. Decisions

## 1.1 Information architecture

Routes, each with sections in order. Routes exist in /en and /id.

1. Home `/`
   1. Header (sticky)
   2. Hero: left column statement + search box + 2 CTAs; right column a live stack of 5 real cover pages (page-flip on hover). Not a centered headline.
   3. Trust strip: 192 PDFs, 12 subjects, SD + SMP, instant after payment, QRIS/e-wallet/VA badges (real numbers from the catalog, counted at build time).
   4. Browse by subject (12 tiles, each with the real count of files).
   5. Browse by type (Kunci Jawaban, Latihan 100, Latihan 1.000, HOTS, Pilihan Ganda, Asesmen, Naskah Ujian, Paket Lengkap Resmi).
   6. Newest 8 products (product cards).
   7. "Look inside" demo: a real PDF first page opened in the preview viewer, so the visitor tries the feature before buying.
   8. How it works in 3 steps (Choose, Pay with Midtrans, Read in your library).
   9. Bundles (Paket Lengkap) with price compared to the sum of single files.
   10. FAQ (8 questions: can I download, which device, refund, invoice, school purchase, WhatsApp).
   11. Footer.
2. Catalog `/products`: filter bar (level SD/SMP, grade, subject, type, price range, sort), result count, grid 4/3/2/1 columns, URL-synced filters, empty state with WhatsApp link.
3. Subject page `/subjects/[slug]`: header with subject name and count, type chips, grid. Same component as catalog, pre-filtered.
4. Product page `/products/[slug]` (see 1.4).
5. Bundles `/bundles` and `/bundles/[slug]`: same layout as product page plus a list of included files.
6. Cart `/cart` (drawer on desktop, page on mobile).
7. Checkout `/checkout`: email, name, optional WhatsApp, order summary, "Pay" opens Midtrans Snap.
8. Order status `/orders/[id]`: pending, paid, expired, failed; polls the server every 3 s for 60 s after the popup closes, then every 15 s.
9. Library `/library` (login by email magic link): purchased files list, last opened page, "Read" button.
10. Reader `/library/[id]/read` (see 1.7).
11. Support/legal: `/help`, `/refund`, `/terms`, `/privacy`, `/contact`.
12. Account `/account`: email, language, theme, receipts.
13. 404 and error pages with search box.

## 1.2 Header, nav and footer

Header (height 64 px desktop, 56 px mobile, 1 px hairline bottom, becomes translucent with backdrop blur 12 px after 8 px scroll):
- Left: logo (NNG Store wordmark, 24 px tall).
- Center (desktop): Shop, Subjects (mega menu: 12 subjects in 3 columns with counts), Bundles, Help.
- Right: search button (opens command palette, shortcut Ctrl/Cmd+K, hint shown), language switch EN/ID, theme toggle (light/dark/system), cart icon with count badge, Library (avatar or "Sign in").
- Mobile: logo, search, cart, menu button; menu opens a full-height sheet with the same links. Bottom sticky bar on product pages only (price + Add to cart).
- No announcement bar unless a real promo exists.

Footer (4 columns desktop, accordion mobile; 64 px top padding):
- Col 1: logo, one sentence ("Digital worksheets for SD and SMP. Read in your library after payment."), Instagram @nngstoreofficial, WhatsApp.
- Col 2: Shop (all links real). Col 3: Help (How it works, Refund, Contact). Col 4: Legal.
- Payment row: QRIS, GoPay, OVO, DANA, ShopeePay, BCA, BNI, BRI, Mandiri badges (monochrome, 24 px tall) with "Secured by Midtrans".
- Bottom line: "Sister of NNG Esport", motto "Now or Never", copyright. No dead "#" links.

## 1.3 Product card

Size: 4 per row at 1200 px container (gap 24), 3 at 1024, 2 at 640, 1 at 360 with horizontal compact variant (cover 88 px left).
Anatomy top to bottom:
1. Cover: real page 1 rendered to WebP, aspect 3:4 (A4 ratio 1:1.414 cropped to 3:4 is not allowed; use true 1:1.414), radius 8, 1 px hairline, soft shadow level 1. Corner chip: type ("Kunci Jawaban"), top-left, 12 px uppercase, tracking 0.06em.
2. Hover (pointer devices only): cover tilts max 4 degrees, second page fades in (200 ms); a "Look inside" pill appears bottom-center. On touch: no hover; tap goes to product page.
3. Title, max 2 lines, 16 px weight 500: "PKn Kelas 5 SD - Kunci Jawaban".
4. Meta line, 14 px muted: "SD, Class 5 - 48 pages - PDF".
5. Price row: "Rp 19.000" 18 px weight 650 tabular numbers; struck-through old price only if a real previous price exists.
6. Quick add: icon button 40 px, bottom-right (Plus icon, becomes Check after add, 150 ms).
Whole card is one link; the quick-add button is a separate focus target. No star rating until real reviews exist.

## 1.4 Product page

Desktop 12 columns: gallery cols 1-7, buy box cols 8-12 (sticky, top 88 px).
Order:
1. Breadcrumb (Shop / Subject / Title).
2. Gallery: large page viewer showing page 1 of preview pages; thumbnail strip below (first 4 to 6 pages); arrows and swipe; "Open full preview" opens a modal viewer.
3. Buy box: title (H1), meta chips (level, grade, subject, type, pages, language), price, "Add to cart" (primary) and "Buy now" (secondary), instant-access note, payment badges, 3 bullet facts (what you get, how you read it, refund rule one-liner).
4. Tabs below, anchored, not hidden: What is inside (table of contents with page numbers), Who it is for, How it is delivered, FAQ.
5. "Pages you can preview" strip: 4 to 6 pages, with a stated rule "Preview shows pages 1-4 of 48. Answers beyond page 4 are blurred."
6. Bundle upsell: "Also in Paket Lengkap, saves Rp X" with real arithmetic.
7. Related (same subject, other types), 4 cards.
8. Sticky mobile bottom bar (price + Add to cart) appears after the buy box leaves the viewport.
Trust items on this page: page count, file size, exact curriculum label (Kurikulum Merdeka or K13 as true for the file), last updated date, preview, refund rule, WhatsApp link.

## 1.5 Preview strategy

Problem: buyer cannot fully see a PDF. Solution in three layers.
1. Cover: page 1 of every PDF rendered at build time (pdf to WebP, 900 px wide, plus 300 px for cards). Own design: store as static files; they are public by intent.
2. Preview pages: pages 1 to N (N = 4, or 10 percent of pages, whichever larger, max 8) rendered to WebP with a tiled diagonal "PREVIEW - NNG Store" watermark at 6 percent opacity. Pages after N are not shipped to the browser at all (not blurred by CSS, because CSS blur can be removed in devtools). A blurred placeholder image is generated server-side only for the "locked pages" strip.
3. Table of contents text and page count in HTML (also good for SEO).
Answer-key products: show the question page in full and one answer page, never the full key.
Viewer: modal, keyboard arrows, pinch zoom, 1x to 3x, "Page 2 of 4", closes on Esc, focus trapped. The page-flip effect is used only on the home hero stack and the card hover, not in the reader.

## 1.6 Cart and checkout

- Add to cart: button shows spinner 0 ms (no spinner for local state), cart drawer slides from right 300 ms, shows item, subtotal, "Checkout" button. Cart stored in localStorage and merged with server cart on login.
- Quantity is always 1 per product (digital). Duplicate add shows "Already in your cart". Already owned shows "In your library, Read".
- Checkout (single page, 2 columns desktop; summary on top in an accordion on mobile): 1) Email (receipt and magic link go here), 2) Name, 3) WhatsApp optional (for support only), 4) Voucher, 5) Summary with total in "Rp 38.000" format, 6) tick: "I understand these are digital files, see Refund rule" (link), 7) "Pay Rp 38.000" button.
- Pay opens Midtrans Snap popup (Snap.js); user picks QRIS, e-wallet, VA, or convenience store inside it. Server creates the transaction token first; button shows loading until the token returns (target under 1 s).
- Result handling: the order is marked paid only by the Midtrans webhook with SHA-512 signature check; the popup success callback only navigates to `/orders/[id]`, which polls.
- Pending VA/QRIS: order page shows countdown to expiry, payment instructions repeated, "Open payment again" button, and "Check status" button.
- After paid: confetti is not used. A 400 ms check-mark draw, then two buttons: "Read now" and "Go to library". Email with receipt and link sent.
- Failure/expired: plain sentence with reason and "Try again" button; the cart is preserved.

## 1.7 Library and reader

Library: grid of purchased covers, filter by subject, "Continue reading" row at top (last page saved per file), search. Empty state shows 3 suggested products.
Reader (own design, modeled on the principle that the file is shown, not handed over):
- No direct PDF URL. Pages are rendered server-side as images (or streamed to PDF.js from a route that checks the session on every request) and delivered through short-lived signed URLs (60 to 120 s expiry), `Cache-Control: private, no-store`.
- Per-buyer visible watermark on every page: buyer email partial (a***@gmail.com) and order ID in the footer margin at 8 percent opacity; plus an invisible per-buyer mark (tiny offset pattern or metadata) so a leaked file can be traced.
- Reader UI: page-by-page or continuous scroll, zoom, page jump, bookmark, dark reader mode (inverts paper to a dark gray, not pure black), full-screen. Disabled: right-click save, print-to-PDF button, text selection on answer keys (these are deterrents only; say so in internal docs, never claim "unpirateable").
- Optional download is a product decision: v1 offers read-in-browser only; v2 may add a watermarked PDF download per buyer, limited to 3 downloads per order.
- Rate limit: 60 page requests per minute per session; concurrent sessions per account limited to 2; abnormal page-rate flags the account.
- Reader works on a 360 px phone: single page fit-width, bottom toolbar 56 px.

## 1.8 Motion inventory

Library: motion/react. Easing tokens from the handbook: standard `cubic-bezier(0.2,0,0,1)`, enter `cubic-bezier(0.22,1,0.36,1)`, exit `cubic-bezier(0.32,0,0.67,0)`, position change `cubic-bezier(0.65,0,0.35,1)`. Spring for hand-driven motion: stiffness 300, damping 30, mass 0.8. All entrances must have visible final state in plain HTML (never server-render `opacity:0` for important content; handbook 8.4 documents CTAs that never appeared).

| Where | Trigger | Duration ms | Easing |
|---|---|---|---|
| Button hover / press color | pointer | 100 | standard |
| Card cover tilt + second page fade | hover (fine pointer) | 200 | enter |
| Card lift | hover on link cards | 150, translateY -2 px only | standard |
| Hero statement words rise | page load | 700, stagger 40 ms for first 8 words | enter |
| Hero cover stack fan-out | page load, after 200 ms | 600 | enter |
| Hero cover stack page-flip | hover or tap on top cover | 450 | position change |
| Section reveal (translateY 16 px + fade) | enters viewport 20 percent, once | 500 | enter |
| Grid card stagger | viewport enter | 400, stagger 50 ms, first 8 only | enter |
| Number ticker (192 files, 12 subjects) | viewport enter, once | 800 | ease-out cubic |
| Subject tile hover | pointer | 200 | standard |
| Header blur/background | scroll > 8 px | 200 | standard |
| Mega menu | hover/focus | 200 in, 140 out | enter / exit |
| Command palette | Ctrl+K | 200 in, 140 out; results stagger none | enter / exit |
| Cart drawer | add to cart / click | 300 in, 200 out | enter / exit |
| Add button Plus to Check | click | 150 | standard |
| Cart badge bump | item added | 250, scale 1 to 1.2 to 1 spring | spring |
| Preview modal | open | 320 in, 200 out; shared-element zoom from the clicked cover | position change |
| Page turn in preview/reader | arrow / swipe | 250 | position change |
| Locked-pages strip shimmer | none (static) | - | - |
| Theme toggle | click | 200 color crossfade | standard |
| Toast | event | 250 in, 3000 hold, 180 out | enter / exit |
| Order paid check mark | status = paid | 400 stroke draw | enter |
| Magnetic primary CTA (hero only) | pointer near, max 8 px shift | spring 150/15 | spring |
| Marquee of covers (home, one row) | ambient | 60 s loop, linear, pauses on hover | linear |

Reduced motion: entrances show final state, marquee stops, tilt and magnetic off, tickers show final value, modal uses opacity only. Keep only color crossfades.
Budget: animate transform and opacity only; at most 2 simultaneous ambient animations per screen; no smooth-scroll library (it breaks anchors and find-in-page).

## 1.9 Type scale and spacing

Fonts: one sans for UI and body with Latin plus good numerals (Inter or Geist, with tabular figures), one display face for H1/display only (a humane serif or grotesk, max 2 families, max 3 weights: 400, 500, 650). Indonesian and English share the same families; no CJK font on the UI, but product titles with Japanese/Korean/Mandarin text need `Noto Sans JP/KR/SC` fallbacks loaded only when present.

| Token | Size | Weight | Line height | Tracking |
|---|---|---|---|---|
| display | clamp(44px, 1.6rem+5vw, 72px) | 650 | 1.05 | -0.03em |
| h1 | clamp(32px, 1.4rem+2.6vw, 48px) | 650 | 1.1 | -0.02em |
| h2 | clamp(24px, 1.2rem+1.4vw, 36px) | 650 | 1.2 | -0.01em |
| h3 | 20 to 24 | 500 | 1.3 | -0.005em |
| body | 16 (static) | 400 | 1.6 | 0 |
| small | 14 | 400/500 | 1.45 | 0 |
| micro/eyebrow | 12, uppercase | 500 | 1.3 | 0.08em |
| price | 18 to 28 | 650, tabular-nums | 1.1 | 0 |

Spacing base 4: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Section padding 64 (mobile) / 96 (desktop). Card padding 16 (product), 24 (panel). In-group gap at most half of between-group gap. Container max 1280; side margin clamp(20px, 5vw, 64px); grid 12 / 8 / 4 columns with gutter 24 / 20 / 16. Reading width 65ch. Radius: 6 inputs, 8 cards and covers, 12 panels and modals, 9999 buttons and chips. Shadows: L0 none; L1 `0 1px 3px rgba(16,24,40,.08)`; L2 `0 8px 24px rgba(16,24,40,.08), 0 2px 6px rgba(16,24,40,.04)`; dark theme uses 1 px light border instead of shadow. Touch targets at least 44 px.
Prices: `Intl.NumberFormat("id-ID")` giving "Rp 19.000", no decimals, space after Rp, same format in the English UI.

## 1.10 Color usage rules

- One action accent only (used for primary button, links, focus ring, active filter). Choose it from NNG brand assets; neutral base is warm paper, not default zinc/slate.
- Light: canvas `#FBFAF7`-type warm white, surface white, ink near-black (not `#000`), hairline 1 px at about 8 percent ink. Dark: canvas about `#0F1012`, surface one step lighter, ink about `#ECECEA` (not `#FFF`), borders at 10 percent white.
- Text contrast at least 4.5:1 measured for both themes, including accent on button, and state colors measured on their own wash.
- Subject colors: 12 muted tags used only as a 4 px left bar or small dot on subject tiles and chips, never as backgrounds of whole sections.
- Semantic colors (success, warning, error) only for state. Payment status: pending = amber, paid = green, expired/failed = red, each with icon plus text (not color alone).
- No gradient text, no purple-to-blue hero gradient, no neon glow, no blurred color blobs. Hero background is flat canvas with the cover stack as the visual.
- Cover images are never recolored or filtered; they are the product.
- Seams between sections by hairline and grid change, not alternating background stripes.

## 1.11 Copy voice and 8 do/don't pairs

Voice: plain, specific, calm, counts instead of adjectives, says what the file is and is not, no urgency tricks. English default; Indonesian uses "kamu" for students and "Anda" for parents/teachers pages only if consistent site-wide (choose "kamu" site-wide for warmth, "Anda" in legal pages).

| # | Do (EN) | Don't (EN) | Do (ID) | Don't (ID) |
|---|---|---|---|---|
| 1 | "48 pages, answer key for PKn Class 5." | "The ultimate answer key for top grades!" | "48 halaman, kunci jawaban PKn Kelas 5." | "Kunci jawaban terlengkap dan terbaik!" |
| 2 | "Read it in your library right after payment." | "Seamless instant access experience." | "Baca di perpustakaanmu begitu pembayaran masuk." | "Pengalaman akses instan yang mulus." |
| 3 | "Preview pages 1-4. The rest unlocks after purchase." | "Sneak peek of our amazing content." | "Pratinjau halaman 1-4. Sisanya terbuka setelah pembelian." | "Intip konten luar biasa kami." |
| 4 | "Files open only in your account; we do not send a PDF by email." | "100% unhackable protection." | "File hanya terbuka di akunmu; kami tidak mengirim PDF lewat email." | "Dijamin 100% anti bajak." |
| 5 | "Rp 19.000. Pay with QRIS, GoPay, OVO, DANA, ShopeePay or bank VA." | "Unbeatable price, don't miss out!" | "Rp 19.000. Bayar dengan QRIS, GoPay, OVO, DANA, ShopeePay, atau VA bank." | "Harga super murah, jangan sampai ketinggalan!" |
| 6 | "Payment did not go through. Nothing was charged. Try again." | "Oops! Something went wrong." | "Pembayaran belum berhasil. Tidak ada dana yang terpotong. Coba lagi." | "Ups! Terjadi kesalahan." |
| 7 | "If the file will not open, tell us within 48 hours and we fix it or refund you." | "No refunds under any circumstances." | "Kalau file tidak bisa dibuka, kabari kami dalam 48 jam; kami perbaiki atau kembalikan dana." | "Tidak ada pengembalian dana dalam kondisi apa pun." |
| 8 | "Made for Kurikulum Merdeka, SD Class 1-6 and SMP Class 7-9." | "Perfect for every student everywhere." | "Disusun untuk Kurikulum Merdeka, SD Kelas 1-6 dan SMP Kelas 7-9." | "Cocok untuk semua pelajar di mana saja." |

Extra rules: no exclamation marks; no fake countdowns or "only 3 left" on files; no testimonials until real, with a name and role; no "official" claim unless the file is an official pack and the label is true; if a claim cannot be proven, write what is true now.
Refund wording for digital goods: state before payment (checkout checkbox), list exceptions that are refunded (file broken, wrong file delivered, paid but not delivered within 2 hours, double payment), give a window (48 hours), give channel (WhatsApp + email form). Avoid an absolute "no refund" clause; the search result itself flagged absolute clauses as challengeable under Indonesian consumer law; confirm with a lawyer.

Indonesian conventions applied: price "Rp 19.000"; badges QRIS, GoPay, OVO, DANA, ShopeePay, BCA/BNI/BRI/Mandiri VA; WhatsApp floating button bottom-right 48 px (hidden in reader and checkout step 2 to avoid overlap), prefilled message with product name; invoice/receipt by email; seller identity and contact in footer; Midtrans Snap popup over the site (not redirect), webhook-driven status.

# Part 2. Evidence

## Teachers Pay Teachers and digital-product sellers (search results; direct TPT and Etsy pages returned 403)
- Seller advice says previews matter most for products priced $3 and up, with full-size example pages, a table of contents and teacher notes rather than tiny thumbnails. https://jenniferfindley.com/download/18785
- TpT video previews are under 2 minutes and flagged by a video icon in the second thumbnail slot. https://lauracandler.com/?p=11192
- Sellers describe a complete but secure preview that shows the whole product without a downloadable file, because secured PDFs can be worked around. https://www.myprimaryparadise.com/2015/03/26/how-to-create-a-complete-secure-product-preview-for-tpt/
- A thumbnail-vs-preview episode treats the thumbnail as required and the preview as the trust tool. https://theterrificteacherpreneur.buzzsprout.com/1552243/episodes/16249262-thumbnails-vs-previews
- Not confirmed: exact TpT review placement and bundle display; Etsy card anatomy (403). Decisions on those are own design.

## KaryaKarsa and reader protection
- No KaryaKarsa help page on protection was found; search shows purchase by Kakoin and mobile-optimized in-platform reading of novels and comics (read inside the platform, with login on the buyer account). https://www.goodreads.com/author_blog_posts/20646208-saya-bergabung-dengan-karyakarsa and https://apps.apple.com/id/app/karyakarsa/id1546196520
- Google Play Books: ACS4 encrypted EPUB/PDF per authorized device, authentication once per device, DRM books over 128 MB not downloadable, publishers may turn DRM off. https://support.google.com/books/partner/answer/3309439?hl=en
- Watermarking is described as the lighter alternative to DRM encryption (not confirmed for Google). https://hackmag.com/security/ebook-drm-hack and https://documents.turbine.ai/blog/pdf-drm
- Scribd: nothing found. Section 1.7 is therefore own design built on in-site reading, signed URLs and per-buyer watermark.

## Design-system references
- awesome-design-md has 73 brands (Stripe, Linear, Vercel, Airbnb, Shopify, Nike, Apple and more), each DESIGN.md with 9 sections: theme, color roles, typography, components, layout, depth, do/don't, responsive, agent prompt guide. https://github.com/VoltAgent/awesome-design-md
- Stripe DESIGN.md: type 56/32/22/16/14/13 with negative tracking at large sizes, weight 300 display; spacing 2,4,8,12,16,24,32,64; radius 4,6,8,12,16 and pill buttons; shadow `rgba(0,55,112,.08) 0 8px 24px`; hairline `#e3e8ee`; one primary indigo `#533afd`; no motion tokens. https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/stripe/DESIGN.md
- Shopify DESIGN.md: black pill primary 12x24 padding, card radius 12 with 1 px `#e4e4e7` border and 32 px padding, input radius 8, tags 4x12 pill, cream canvas `#fbfbf5`, pressed `#3f3f46`, buttons at least 44 px high, breakpoints 768/1024/1440; no motion tokens. https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/shopify/DESIGN.md
- Both files are silent on motion, so motion numbers come from the owner's handbook (below).
- Borrowed: pill buttons, 1 px hairlines, 8-based spacing, one accent, warm canvas, large display with negative tracking.

## Owner's handbook (E:\Download\Telegram Desktop\DESIGN-HANDBOOK-blockbite - Copy.md)
- Motion: instant 80-120 ms, small 150-200, medium 200-300, large 300-450, page entrance 500-850; exit 60-75 percent of entrance; stagger 30-60 ms, total about 400 ms (lines 2349-2390).
- Easing tokens and spring starting values (stiffness 300, damping 30, mass 0.8) (lines 2366-2380); magnetic shift max 6-12 px (line 2494); counters 400-800 ms with tabular numbers (line 2539).
- Type clamp scale, tracking per size, max 3 weights, 4-px spacing scale with 1:2 grouping, 12/8/4 grid, 65ch measure (lines 1720-1972).
- Copy: specific claims, banned filler phrases (seamless, empower, unlock the power of), "if no fact yet, write what is true now" (lines 2120-2160).
- Skiper adaptation lessons: drop global smooth scroll, replace hardcoded colors with tokens, define reduced-motion behavior, check license attribution (lines 2589-2603).
- Pitfall: server-rendered `opacity:0` entrances left CTAs invisible (line 2389).

## Component libraries
- Skiper UI: 106+ "un-common" shadcn components, single file each with no extra packages, free and premium ($129 / $549) tiers; page lists image reveal, hover members, drag and scroll, dynamic island, image cursor trail. `npx shadcn add @skiper-ui/skiper40` installs one component file; the page does not name it, but the handbook identifies skiper40 as a link underline sweep (CssLink). https://skiper-ui.com and handbook line 2589.
- 21st.dev: categories are marketing blocks (heroes, pricing, testimonials), UI primitives, templates, shadcn themes, shaders/gradients; ecommerce, marquee and command palette not confirmed on the front page. https://21st.dev
- Landingfolio: inspiration plus copy-paste Tailwind sections; closest category is "Product" with 209 examples; no ecommerce category. https://www.landingfolio.com

Fit for NNG Store:
- Use: stacked/page-flip cover preview (core product), one-row cover marquee, number ticker, spotlight/hover on subject tiles (subtle), command-palette search (cmdk-style, 192 items is searchable client side), scroll reveal (once), shared-element zoom to preview modal, underline-sweep links (skiper40-style, as plain CSS).
- Gimmicky here: cursor image trail, dynamic island, 3D scene, parallax, kinetic text beyond the hero H1, global smooth scroll, confetti, magnetic on more than the hero CTA, aurora/blob backgrounds, card-in-card tilt on every card.

## Indonesian e-commerce and Midtrans
- Snap popup keeps the shopper on the site and covers cards, bank transfer (BCA, BNI, BRI, Mandiri, Permata), GoPay, OVO, ShopeePay, DANA, LinkAja, QRIS, Indomaret, Alfamart; method list depends on the merchant account setting. https://builtbybit.com/resources/midtrans-payment-gateway-for-paymenter.106470/ and https://ecosire.com/apps/odoo/odoo-midtrans-payment-gateway
- Treat the Midtrans HTTP notification (SHA-512 signature) as truth, not the browser return. Same sources.
- Refund examples: Dataindonesia refunds only if the file cannot be downloaded or is not received in under 2 hours; Mach37 replaces broken files if reported within 48 hours; Google Play allows requests within 48 hours. https://dataindonesia.id/refund-policy , https://mach37.com/policies/refund-policy , https://www.inews.id/techno/internet/cara-mengajukan-pengembalian-dana-di-google-play
- Pattern: state digital nature before payment, short window, exceptions for broken or wrong file.

# Part 3. Anti-patterns (what looks AI-generated or cheap)

1. Centered headline + gray subline + two buttons over a purple-blue gradient (handbook slop items 1, 17).
2. Laptop/phone mockup of a screenshot instead of the real product (real covers fix this).
3. "Trusted by" logo cloud, fake testimonials with stock avatars, fake "12,483 happy students" counters (items 4, 15).
4. Three-column feature grid with icons in colored circles; every section a card; cards inside cards (items 9-11).
5. Hover lift of 8 px with a large shadow on every card; glow shadows; blurred color blobs (items 12, 19, 20).
6. Gradient text in headlines, three equal accent colors, default zinc/slate gray, pure `#000` on `#FFF` in dark mode (items 18, 21, 23, 24).
7. Footer with 20 dead "#" links; "Most popular" badge with scale 1.05 on a product that has no tiers (items 8, 16).
8. Filler copy: seamless, unlock, empower, "ultimate", "premium quality", exclamation marks, fake urgency timers on files that never run out.
9. Entrance animations that set `opacity:0` in server HTML, animation on every element, global smooth scroll, parallax without reduced-motion fallback.
10. Preview done by CSS blur of the full page (inspectable) or tiny thumbnails nobody can read.
11. Emoji as icons, mixed icon sets, 5 font weights, spacing values like 13 px and 27 px.
12. Price shown as "Rp 19000", "IDR 19,000.00" or with a decimals, mixed currency format between EN and ID.
13. Absolute claims such as "100% anti piracy" or "no refund ever" that cannot be proven or defended.
