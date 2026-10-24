import { NextResponse } from "next/server";
import { getTransactionStatus, isPaid, verifySignature, type MidtransStatus } from "@/lib/server/midtrans";
import { findOrder, setOrderStatus } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FAILED = new Set(["deny", "cancel", "expire", "failure"]);

/**
 * Midtrans HTTP notification endpoint (Settings > Payment > Notification URL:
 * https://<domain>/api/midtrans/notify). The signature is checked, then the
 * status is re-read from Midtrans so a forged body cannot mark anything paid.
 * The verified result is written to the orders table, so a buyer who closes
 * the tab before returning can still restore the purchase later.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as MidtransStatus | null;
  if (!body?.order_id) return NextResponse.json({ ok: false }, { status: 400 });
  if (!verifySignature(body)) return NextResponse.json({ ok: false }, { status: 401 });

  const { http, body: fresh } = await getTransactionStatus(body.order_id);
  if (http >= 500) return NextResponse.json({ ok: false }, { status: 502 });

  const order = await findOrder(body.order_id);
  const amountOk = order ? Math.round(Number(fresh.gross_amount)) === order.total : false;
  const status = isPaid(fresh) && amountOk ? "paid" : FAILED.has(fresh.transaction_status ?? "") ? "failed" : null;
  if (order && status) await setOrderStatus(order.id, status, fresh.payment_type);

  console.info("[midtrans:notify]", body.order_id, fresh.transaction_status, status ?? "no-change", order ? "" : "not-in-db");
  // Midtrans retries on anything but 2xx; a verified notification is always acknowledged.
  return NextResponse.json({ ok: true });
}
