// Browser-side calls to the checkout API. Shared by the checkout and library views.

export type CheckoutResponse =
  | { mode: "demo"; orderId: string; total: number }
  | {
      mode: "midtrans";
      orderId: string;
      total: number;
      token: string;
      redirectUrl: string;
      clientKey: string;
      production: boolean;
    };

export type CheckoutError = "email" | "empty" | "bad-json" | "gateway" | "network";

export type ConfirmStatus = "paid" | "pending" | "failed" | "unknown" | "error";

export async function startCheckout(body: {
  slugs: string[];
  email: string;
  name: string;
  phone?: string;
  lang: "en" | "id";
}): Promise<{ ok: true; data: CheckoutResponse } | { ok: false; error: CheckoutError }> {
  let res: Response;
  try {
    res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: "network" };
  }
  const json = (await res.json().catch(() => null)) as (Partial<CheckoutResponse> & { error?: string }) | null;
  if (!res.ok || !json || !json.orderId) {
    const e = json?.error;
    if (e === "email" || e === "empty" || e === "bad-json" || e === "gateway") return { ok: false, error: e };
    return { ok: false, error: res.status >= 500 ? "gateway" : "network" };
  }
  return { ok: true, data: json as CheckoutResponse };
}

/** Asks the server to check the order. In demo mode this call is the simulated payment. */
export async function confirmOrder(orderId: string): Promise<ConfirmStatus> {
  try {
    const res = await fetch("/api/checkout/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
      cache: "no-store",
    });
    const json = (await res.json().catch(() => null)) as { status?: string } | null;
    const s = json?.status;
    if (s === "paid" || s === "pending" || s === "failed" || s === "unknown" || s === "error") return s;
    return "error";
  } catch {
    return "error";
  }
}

const SNAP_PROD = "https://app.midtrans.com/snap/snap.js";
const SNAP_SANDBOX = "https://app.sandbox.midtrans.com/snap/snap.js";

/** Loads Snap.js once. Rejects on network failure, a blocker, or after 20 s. */
export function loadSnap(clientKey: string, production: boolean): Promise<void> {
  const src = production ? SNAP_PROD : SNAP_SANDBOX;
  if (window.snap) return Promise.resolve();
  return new Promise((resolve, reject) => {
    let el = document.querySelector<HTMLScriptElement>("script[data-nng-snap]");
    if (el && el.src !== src) {
      el.remove();
      el = null;
    }
    if (!el) {
      el = document.createElement("script");
      el.src = src;
      el.async = true;
      el.setAttribute("data-client-key", clientKey);
      el.setAttribute("data-nng-snap", "");
      document.head.appendChild(el);
    }
    const script = el;
    const timer = window.setTimeout(() => fail(), 20000);
    function done() {
      window.clearTimeout(timer);
      if (window.snap) resolve();
      else fail();
    }
    function fail() {
      window.clearTimeout(timer);
      script.remove();
      reject(new Error("snap"));
    }
    script.addEventListener("load", done, { once: true });
    script.addEventListener("error", fail, { once: true });
  });
}
