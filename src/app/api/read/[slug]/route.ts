import { PDFDocument } from "pdf-lib";
import { loadSourcePdf } from "@/lib/server/files";
import { getProduct } from "@/data/catalog";
import { readLibrary } from "@/lib/server/library";
import { checkReadToken } from "@/lib/server/read-token";
import { stampPdf } from "@/lib/protect/stamp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO_PAGES = 2;

/**
 * Serves one purchased file, stamped for the buyer who owns it. Three checks:
 * the signed library cookie lists the file, the short read token was minted
 * for this file and this buyer, and the request comes from this site.
 * Demo orders (no payment taken) only ever receive the first pages.
 */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return new Response("Not found", { status: 404 });

  const lib = await readLibrary();
  if (!lib.owner || !lib.slugs.includes(slug)) return new Response("Forbidden", { status: 403 });

  const token = new URL(req.url).searchParams.get("t");
  const check = checkReadToken(token, slug, lib.owner.email);
  if (check !== "ok") return new Response(check === "expired" ? "Expired" : "Forbidden", { status: 403 });

  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return new Response("Forbidden", { status: 403 });

  const orderId = lib.orderOf[slug] ?? lib.orders[0]?.id ?? "NNG";
  const order = lib.orders.find((o) => o.id === orderId);
  const demo = order?.mode !== "midtrans";

  let bytes = await loadSourcePdf(slug);
  if (!bytes) return new Response("File unavailable", { status: 503 });

  if (demo) {
    const src = await PDFDocument.load(bytes);
    const out = await PDFDocument.create();
    const n = Math.min(DEMO_PAGES, src.getPageCount());
    const pages = await out.copyPages(src, [...Array(n).keys()]);
    pages.forEach((p) => out.addPage(p));
    bytes = await out.save();
  }

  const stamped = await stampPdf(bytes, {
    name: lib.owner.name,
    email: lib.owner.email,
    orderId: demo ? `${orderId} DEMO` : orderId,
    purchasedAt: order?.at ?? new Date().toISOString(),
  });

  return new Response(Buffer.from(stamped), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
