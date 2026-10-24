// Pure helpers shared by the stamper and scripts/verify-protect.mjs.
// No "server-only" here on purpose: the verify script imports this file directly.
import { createHmac, timingSafeEqual } from "node:crypto";

// DEV FALLBACK ONLY. Production must set PROTECT_SECRET (32+ random bytes).
// Anyone who knows this constant can forge fingerprints.
export const DEV_FALLBACK_SECRET = "dev-only-insecure-protect-secret-change-me";

export function getSecret(): string {
  const s = process.env.PROTECT_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("PROTECT_SECRET is not set (or shorter than 16 characters).");
  }
  return DEV_FALLBACK_SECRET;
}

/** b***@g***.com style mask. Never returns the full address. */
export function maskEmail(email: string): string {
  const e = email.trim();
  const at = e.lastIndexOf("@");
  if (at < 1 || at === e.length - 1) return "***";
  const local = e.slice(0, at);
  const domain = e.slice(at + 1);
  const dot = domain.indexOf(".");
  const host = dot === -1 ? domain : domain.slice(0, dot);
  const tld = dot === -1 ? "" : domain.slice(dot);
  return `${local[0]}***@${host[0]}***${tld}`;
}

/** 32 hex chars (128 bits) of HMAC-SHA256(orderId). */
export function fingerprint(orderId: string, secret: string = getSecret()): string {
  return createHmac("sha256", secret).update(orderId).digest("hex").slice(0, 32);
}

export function verifyFingerprint(
  orderId: string,
  claimed: string,
  secret: string = getSecret(),
): boolean {
  const a = Buffer.from(fingerprint(orderId, secret));
  const b = Buffer.from(claimed);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Keep only characters the standard Helvetica (WinAnsi) font can encode. */
export function toWinAnsi(text: string): string {
  let out = "";
  for (const ch of text.normalize("NFC")) {
    const c = ch.codePointAt(0)!;
    out += (c >= 0x20 && c <= 0x7e) || (c >= 0xa1 && c <= 0xff) ? ch : c === 0xa0 ? " " : "?";
  }
  return out;
}
