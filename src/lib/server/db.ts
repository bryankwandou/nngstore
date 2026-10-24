import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type { PendingOrder } from "./library";

// Neon over HTTP: one round trip per query, no pool to hold open, so idle
// functions cost nothing and the database can scale to zero between sales.
// Browsing never reaches this file. Only checkout, the Midtrans webhook,
// payment confirmation and library restore write or read here.

let client: NeonQueryFunction<false, false> | null | undefined;

function sql() {
  if (client === undefined) {
    const url = (process.env.DATABASE_URL || process.env.POSTGRES_URL)?.trim();
    client = url ? neon(url) : null;
  }
  return client;
}

export function hasDb() {
  return sql() !== null;
}

export type OrderStatus = "pending" | "paid" | "failed";

export type OrderRow = {
  id: string;
  email: string;
  name: string;
  slugs: string[];
  total: number;
  mode: "demo" | "midtrans";
  status: OrderStatus;
  created_at: string;
};

/** Records the order the moment Midtrans issues a token. Safe to call twice. */
export async function recordOrder(o: PendingOrder) {
  const q = sql();
  if (!q) return;
  await q`
    insert into orders (id, email, name, slugs, total, mode, status, created_at)
    values (${o.id}, ${o.email.toLowerCase()}, ${o.name}, ${o.slugs}, ${o.total}, ${o.mode}, 'pending', ${o.at})
    on conflict (id) do nothing`;
}

/**
 * Moves an order to its final state. A paid order never goes back to pending
 * or failed, whatever order the webhook and the browser arrive in.
 */
export async function setOrderStatus(id: string, status: OrderStatus, paymentType?: string | null) {
  const q = sql();
  if (!q) return;
  await q`
    update orders
       set status = ${status},
           payment_type = coalesce(${paymentType ?? null}, payment_type),
           paid_at = case when ${status} = 'paid' then coalesce(paid_at, now()) else paid_at end,
           updated_at = now()
     where id = ${id} and status <> 'paid'`;
}

export async function findOrder(id: string): Promise<OrderRow | null> {
  const q = sql();
  if (!q) return null;
  const rows = (await q`
    select id, email, name, slugs, total, mode, status, created_at
      from orders where id = ${id} limit 1`) as OrderRow[];
  return rows[0] ?? null;
}

/** Every paid order for one email, newest first. Used to rebuild a library on a new device. */
export async function paidOrdersFor(email: string): Promise<OrderRow[]> {
  const q = sql();
  if (!q) return [];
  return (await q`
    select id, email, name, slugs, total, mode, status, created_at
      from orders where email = ${email.toLowerCase()} and status = 'paid'
     order by created_at desc limit 50`) as OrderRow[];
}
