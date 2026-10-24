import { NextResponse } from "next/server";
import { findOrder, hasDb, paidOrdersFor, setOrderStatus } from "@/lib/server/db";
import { grantOrders } from "@/lib/server/library";
import { getTransactionStatus, isPaid, midtransConfig } from "@/lib/server/midtrans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Rebuilds a buyer's library on a new device. The buyer proves ownership with
 * two things only they have: the email used at checkout and one order number
 * from that email. A pending order is re-checked with Midtrans first, which
 * covers a buyer who paid and closed the tab before the store heard back.
 * Every paid order for that email is then restored in one cookie.
 */
export async function POST(req: Request) {
  if (!hasDb()) return NextResponse.json({ status: "unavailable" }, { status: 503 });
  const body = (await req.json().catch(() => ({}))) as { email?: unknown; orderId?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 120) : "";
  const orderId = typeof body.orderId === "string" ? body.orderId.trim().toUpperCase().slice(0, 40) : "";
  if (!email || !orderId) return NextResponse.json({ status: "missing" }, { status: 400 });

  // Preview and local runs share the database in demo mode. A live store only
  // honours orders that went through Midtrans, so a demo "payment" unlocks nothing.
  const mode = midtransConfig().mode;
  const counts = (o: { mode: string }) => mode === "demo" || o.mode === "midtrans";

  const order = await findOrder(orderId);
  // Same answer for "no such order", "wrong email" and "wrong mode", so order numbers cannot be probed.
  if (!order || order.email !== email || !counts(order)) {
    return NextResponse.json({ status: "not-found" }, { status: 404 });
  }

  if (order.status === "pending" && order.mode === "midtrans" && mode === "midtrans") {
    const { http, body: fresh } = await getTransactionStatus(order.id);
    if (http < 400 && isPaid(fresh) && Math.round(Number(fresh.gross_amount)) === order.total) {
      await setOrderStatus(order.id, "paid", fresh.payment_type);
      order.status = "paid";
    }
  }
  if (order.status !== "paid") return NextResponse.json({ status: order.status });

  const paid = (await paidOrdersFor(email)).filter(counts);
  const lib = await grantOrders(
    paid.reverse().map((o) => ({
      id: o.id,
      slugs: o.slugs,
      total: o.total,
      name: o.name,
      email: o.email,
      at: new Date(o.created_at).toISOString(),
      mode: o.mode,
    })),
  );
  return NextResponse.json({ status: "paid", files: lib.slugs.length, orders: paid.length });
}
