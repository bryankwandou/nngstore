import { NextResponse } from "next/server";
import { getTransactionStatus, isPaid, midtransConfig, verifySignature } from "@/lib/server/midtrans";
import { clearPending, grantOrder, readPending } from "@/lib/server/library";
import { setOrderStatus } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The cookie grant already happened or will; a database hiccup must not block the buyer.
const logDb = (e: unknown) => console.error("[confirm:db]", e instanceof Error ? e.message : e);

/**
 * Called by the browser after Snap closes (or on the finish redirect).
 * Access is granted only after the server itself asks Midtrans for the
 * order status and the amount matches what this server priced. The browser's
 * word that a payment succeeded is never trusted.
 */
export async function POST(req: Request) {
  const { orderId } = (await req.json().catch(() => ({}))) as { orderId?: string };
  const pending = await readPending();
  if (!pending || !orderId || pending.id !== orderId) {
    return NextResponse.json({ status: "unknown" }, { status: 404 });
  }

  const cfg = midtransConfig();
  if (pending.mode === "demo") {
    if (cfg.mode !== "demo") return NextResponse.json({ status: "unknown" }, { status: 409 });
    // Restore on a live store ignores demo rows, so recording them is safe.
    await setOrderStatus(orderId, "paid", "demo").catch(logDb);
    await grantOrder(pending);
    await clearPending();
    return NextResponse.json({ status: "paid", mode: "demo" });
  }

  const { http, body } = await getTransactionStatus(orderId);
  if (http === 404 || body.status_code === "404") return NextResponse.json({ status: "pending" });
  if (http >= 400) return NextResponse.json({ status: "error" }, { status: 502 });

  const amountOk = Math.round(Number(body.gross_amount)) === pending.total;
  const signed = body.signature_key ? verifySignature(body) : true;
  if (body.order_id === orderId && amountOk && signed && isPaid(body)) {
    await setOrderStatus(orderId, "paid", body.payment_type).catch(logDb);
    await grantOrder(pending);
    await clearPending();
    return NextResponse.json({ status: "paid", mode: "midtrans" });
  }
  const s = body.transaction_status;
  if (s === "deny" || s === "cancel" || s === "expire" || s === "failure") {
    await setOrderStatus(orderId, "failed", body.payment_type).catch(logDb);
    return NextResponse.json({ status: "failed", reason: s });
  }
  return NextResponse.json({ status: "pending", paymentType: body.payment_type ?? null });
}
