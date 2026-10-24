import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// DEV FALLBACK ONLY. Production must set PROTECT_SECRET (32+ random chars).
const DEV_SECRET = "dev-only-insecure-protect-secret-change-me";

export function secret(): string {
  const s = process.env.PROTECT_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production" && process.env.VERCEL) throw new Error("PROTECT_SECRET is not set.");
  return DEV_SECRET;
}

function mac(purpose: string, body: string): string {
  return createHmac("sha256", secret()).update(`${purpose}.${body}`).digest("base64url");
}

/** Signs a JSON value for one purpose, so a token minted for one use cannot be replayed as another. */
export function seal(purpose: string, value: unknown): string {
  const body = Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${body}.${mac(purpose, body)}`;
}

export function unseal<T>(purpose: string, token: string | undefined | null): T | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const want = Buffer.from(mac(purpose, body));
  const got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}
