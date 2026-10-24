import "server-only";
import { seal, unseal } from "./sign";

export const READ_TTL_SECONDS = 10 * 60;

type ReadClaims = { s: string; e: string; x: number };

/** A 10-minute link to one file for one buyer. */
export function mintReadToken(slug: string, email: string, now = Date.now()): string {
  return seal("read", { s: slug, e: email.toLowerCase(), x: Math.floor(now / 1000) + READ_TTL_SECONDS } satisfies ReadClaims);
}

export function checkReadToken(token: string | null, slug: string, email: string, now = Date.now()) {
  const c = unseal<ReadClaims>("read", token);
  if (!c) return "bad" as const;
  if (c.x <= Math.floor(now / 1000)) return "expired" as const;
  if (c.s !== slug || c.e !== email.toLowerCase()) return "mismatch" as const;
  return "ok" as const;
}
