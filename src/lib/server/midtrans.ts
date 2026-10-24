import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

// Midtrans Snap and Core status API. Keys come from the environment only.
// MIDTRANS_IS_PRODUCTION=true switches both base URLs; anything else is sandbox.

export type PayMode = "demo" | "midtrans";

export function midtransConfig() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY?.replace(/^﻿/, "").trim() || "";
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY?.replace(/^﻿/, "").trim() || "";
  const production = process.env.MIDTRANS_IS_PRODUCTION?.trim() === "true";
  return {
    serverKey,
    clientKey,
    production,
    mode: (serverKey && clientKey ? "midtrans" : "demo") as PayMode,
    snapBase: production ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com",
    apiBase: production ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com",
  };
}

function auth(serverKey: string) {
  return "Basic " + Buffer.from(`${serverKey}:`).toString("base64");
}

export type SnapItem = { id: string; price: number; quantity: number; name: string };

export async function createSnapTransaction(input: {
  orderId: string;
  gross: number;
  items: SnapItem[];
  customer: { name: string; email: string; phone?: string };
  finishUrl: string;
}): Promise<{ token: string; redirectUrl: string }> {
  const cfg = midtransConfig();
  const res = await fetch(`${cfg.snapBase}/snap/v1/transactions`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: auth(cfg.serverKey) },
    body: JSON.stringify({
      transaction_details: { order_id: input.orderId, gross_amount: input.gross },
      item_details: input.items,
      customer_details: {
        first_name: input.customer.name.slice(0, 50),
        email: input.customer.email,
        ...(input.customer.phone ? { phone: input.customer.phone } : {}),
      },
      credit_card: { secure: true },
      callbacks: { finish: input.finishUrl },
      expiry: { unit: "minutes", duration: 60 },
    }),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as { token?: string; redirect_url?: string; error_messages?: string[] };
  if (!res.ok || !data.token) {
    throw new Error(`Midtrans ${res.status}: ${(data.error_messages ?? []).join("; ") || "no token"}`);
  }
  return { token: data.token, redirectUrl: data.redirect_url ?? "" };
}

export type MidtransStatus = {
  status_code?: string;
  order_id?: string;
  gross_amount?: string;
  transaction_status?: string;
  fraud_status?: string;
  payment_type?: string;
  signature_key?: string;
  status_message?: string;
};

export async function getTransactionStatus(orderId: string): Promise<{ http: number; body: MidtransStatus }> {
  const cfg = midtransConfig();
  const res = await fetch(`${cfg.apiBase}/v2/${encodeURIComponent(orderId)}/status`, {
    headers: { Accept: "application/json", Authorization: auth(cfg.serverKey) },
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({}))) as MidtransStatus;
  return { http: res.status, body };
}

/** settlement, or capture that passed fraud screening. */
export function isPaid(s: MidtransStatus): boolean {
  if (s.transaction_status === "settlement") return true;
  return s.transaction_status === "capture" && (s.fraud_status ?? "accept") === "accept";
}

/** SHA512(order_id + status_code + gross_amount + serverKey), as Midtrans signs notifications and status replies. */
export function verifySignature(s: MidtransStatus, serverKey = midtransConfig().serverKey): boolean {
  if (!s.signature_key || !s.order_id || !s.status_code || !s.gross_amount || !serverKey) return false;
  const want = createHash("sha512").update(s.order_id + s.status_code + s.gross_amount + serverKey).digest("hex");
  const a = Buffer.from(want);
  const b = Buffer.from(s.signature_key);
  return a.length === b.length && timingSafeEqual(a, b);
}
