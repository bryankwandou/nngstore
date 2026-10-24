import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getItem } from "@/data/catalog";
import { createSnapTransaction, midtransConfig } from "@/lib/server/midtrans";
import { setPending, type PendingOrder } from "@/lib/server/library";
import { recordOrder } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function orderId() {
  return `NNG-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

/**
 * Validates the cart against the catalog (prices never come from the client),
 * remembers the order in a signed cookie, and returns a Snap token when
 * Midtrans keys are configured. Without keys the store runs in demo mode.
 */
export async function POST(req: Request) {
  let body: { slugs?: unknown; email?: unknown; name?: unknown; phone?: unknown; lang?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad-json" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().slice(0, 120) : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 60) : "";
  const phone = typeof body.phone === "string" ? body.phone.replace(/[^\d+]/g, "").slice(0, 16) : "";
  const lang = body.lang === "id" ? "id" : "en";
  if (!EMAIL.test(email)) return NextResponse.json({ error: "email" }, { status: 400 });

  const raw = Array.isArray(body.slugs) ? body.slugs.filter((s): s is string => typeof s === "string") : [];
  const unique = [...new Set(raw)].slice(0, 60);
  const found = unique.map((s) => getItem(s)).filter((x) => x !== undefined);
  // A file already inside a bundle in the same cart is not charged twice.
  const inBundles = new Set(found.flatMap((it) => (it.kind === "bundle" ? it.items : [])));
  const items = found.filter((it) => it.kind === "bundle" || !inBundles.has(it.slug));
  if (items.length === 0) return NextResponse.json({ error: "empty" }, { status: 400 });

  const total = items.reduce((s, it) => s + it.priceIdr, 0);
  const cfg = midtransConfig();
  const order: PendingOrder = {
    id: orderId(),
    slugs: items.map((it) => it.slug),
    total,
    name: name || email.split("@")[0],
    email,
    at: new Date().toISOString(),
    mode: cfg.mode,
  };

  if (cfg.mode === "demo") {
    await setPending(order);
    await recordOrder(order).catch((e) => console.error("[checkout:db]", e instanceof Error ? e.message : e));
    return NextResponse.json({ mode: "demo", orderId: order.id, total });
  }

  const origin = new URL(req.url).origin;
  const finishUrl = `${origin}${lang === "id" ? "/id" : ""}/library?order=${order.id}`;
  try {
    const snap = await createSnapTransaction({
      orderId: order.id,
      gross: total,
      items: items.map((it) => ({
        id: it.slug.slice(0, 50),
        price: it.priceIdr,
        quantity: 1,
        name: it.title.en.slice(0, 50),
      })),
      customer: { name: order.name, email, phone: phone || undefined },
      finishUrl,
    });
    await setPending(order);
    await recordOrder(order).catch((e) => console.error("[checkout:db]", e instanceof Error ? e.message : e));
    return NextResponse.json({
      mode: "midtrans",
      orderId: order.id,
      total,
      token: snap.token,
      redirectUrl: snap.redirectUrl,
      clientKey: cfg.clientKey,
      production: cfg.production,
    });
  } catch (e) {
    console.error("[checkout]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "gateway" }, { status: 502 });
  }
}
