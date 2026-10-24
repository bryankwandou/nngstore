# NNG Store

A storefront for printable school worksheets (PDF) for Indonesian primary (SD) and junior high (SMP) students. 192 files across 18 subjects and 14 series, plus 32 bundles. Payment runs through Midtrans Snap. Purchased files open in a protected in-browser reader, stamped with the buyer's name, email and order number.

English is the default language (`/`); Indonesian lives under `/id`.

## Stack

- Next.js 16.3 (App Router), React 19.2, TypeScript strict
- Tailwind CSS v4, motion 14, lucide-react
- pdf-lib (server-side stamping), pdfjs-dist (client reader)
- Midtrans Snap (payment) and the Core status API (verification)
- PyMuPDF scripts that build the catalog, covers and blurred previews

## How a purchase works

1. The cart holds slugs only. `POST /api/checkout` prices every item from the catalog on the server, creates the order and asks Midtrans for a Snap token.
2. The buyer pays in the Snap popup (QRIS, e-wallets, virtual accounts, cards).
3. `POST /api/checkout/confirm` asks Midtrans for the order status from the server. Access is granted only when the status is `settlement` (or `capture` with fraud status `accept`) and the amount matches the server's own total. A message from the browser saying the payment succeeded is never enough.
4. The files are written to a signed, httpOnly library cookie.
5. `/library/[slug]` mints a 10-minute read token. `GET /api/read/[slug]` checks the cookie, the token and the request origin, then stamps the PDF for that buyer before sending it.

`POST /api/midtrans/notify` receives Midtrans HTTP notifications. It verifies `SHA512(order_id + status_code + gross_amount + serverKey)` and reads the status again from Midtrans.

### Demo mode

Without Midtrans keys the store runs in demo mode: checkout shows a labelled demo payment panel. Demo orders unlock only the first 2 pages of each file, so a deploy without keys never gives the files away.

## File protection, and its limits

- Paid PDFs sit in `private/pdfs/`. That folder has no public URL, is not in git, and is bundled only with the `/api/read` function.
- Every copy is stamped with a visible footer, a diagonal watermark, PDF metadata and an invisible fingerprint tied to the order.
- The reader blocks right-click, text selection, print and save shortcuts. Print CSS hides the document. Reading pauses when the window loses focus.
- Shop previews are images, not PDFs. Pages after the free ones are blurred in the image itself.

A browser cannot stop screenshots or a phone camera. The watermark exists so that a leaked copy can be traced back to the order it came from.

## Environment

Copy `.env.example` to `.env.local`:

| Variable | Purpose |
| --- | --- |
| `MIDTRANS_SERVER_KEY` | Server key (never exposed to the browser) |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Client key for Snap.js |
| `MIDTRANS_IS_PRODUCTION` | `true` for production, anything else for sandbox |
| `PROTECT_SECRET` | 32+ random characters for signing cookies and read tokens |
| `DATABASE_URL` / `DATABASE_URL_UNPOOLED` | Neon Postgres, pooled for the app and direct for migrations (optional) |
| `BLOB_READ_WRITE_TOKEN` | Private Vercel Blob store holding the source PDFs (optional) |

In the Midtrans dashboard, set the Notification URL to `https://<domain>/api/midtrans/notify` and the Finish URL to `https://<domain>/library`.

## Scripts

```bash
npm install
npm run dev
npm run build && npm start
npm run typecheck
npm run lint
node scripts/e2e.mjs http://localhost:3000          # with keys: Midtrans mode checks
node scripts/e2e.mjs http://localhost:3001 --demo   # without keys: full purchase and read flow
```

The paid PDFs are not in this repository. To rebuild them locally, put the source files in a folder and run `scripts/catalog/build_catalog.py` and `scripts/catalog/make_images.py`.

## Where data lives, and why traffic does not move the bill

| Data | Home | Touched by a visitor browsing? |
| --- | --- | --- |
| Catalog (titles, prices, bundles) | `src/data/catalog.json`, built into static pages | No. Every shop, product and bundle page is pre-rendered and served from the CDN. |
| Covers and previews | `public/` (pre-sized WebP, about 22 MB) | CDN only. `next/image` is not used, so the image optimizer quota is never spent. |
| Search index | `/search-index.json`, static | CDN only, loaded when search or the cart opens. |
| Cart | `localStorage` | Never leaves the browser. |
| Source PDFs | Private Vercel Blob, `pdfs/<slug>.pdf` | No. Only `/api/read` fetches them, for a buyer who owns the file. |
| Orders | Neon, one `orders` table (`db/schema.sql`) | No. Written at checkout, by the Midtrans webhook and on confirm; read on library restore. |
| A buyer's library | Signed `nng_lib` cookie | Checked without a database query. |

So 80,000 people browsing at once cost CDN bandwidth only: no function runs, Neon stays asleep (it scales to zero), and Blob is not read. Functions and the database work in proportion to sales, not visitors. Rough sizes: an order row is about 300 bytes, so 100,000 orders fit in about 30 MB of the free 0.5 GB.

### Adding a product

1. Drop the PDF into the source folder and rerun `scripts/catalog/build_catalog.py` and `make_images.py`. This changes a few KB of JSON plus two small WebP files.
2. `node --env-file=.env.local scripts/blob-sync.mjs` uploads only new or changed PDFs. It compares SHA-256 hashes stored in `data/blob-manifest.json`; files listed in `src/data/held.json` are never uploaded.
3. Commit and push. The PDF itself never enters git.

First-time database setup: `node --env-file=.env.local scripts/db-migrate.mjs` (safe to rerun).

## Known limits (MVP)

- No passwords or accounts. A library lives in a signed cookie; on a new device the buyer restores it on `/signin` with their email and one order number.
- The webhook records paid and failed orders in Neon, so a buyer who paid and closed the tab can still restore. Without `DATABASE_URL` the webhook only logs.

## Project layout

```
src/app/(en)/...        English routes (root layout, lang="en-US")
src/app/(id)/id/...     Indonesian routes (root layout, lang="id-ID")
src/app/api/...         checkout, confirm, notify, read, signout
src/views/...           one folder per page; route files stay thin
src/content/...         copy, English and Indonesian with the same shape
src/data/catalog.*      192 products and 32 bundles
src/lib/server/...      Midtrans client, signed cookies, read tokens
src/lib/protect/...     PDF stamping and fingerprinting
src/components/...      layout, product, reader, ui, motion, brand
scripts/                catalog builders, e2e and protection checks
docs/                   design research, design spec, report
```
