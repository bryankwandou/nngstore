// Short-lived read tokens and a per-purchase device limit.
// Uses only Web Crypto, so it runs on Node, Edge and in tests.

export const TOKEN_TTL_SECONDS = 10 * 60;
export const MAX_DEVICES = 2;

// DEV FALLBACK ONLY. Production must set PROTECT_SECRET.
const DEV_SECRET = "dev-only-insecure-protect-secret-change-me";

export interface TokenClaims {
  userId: string;
  productId: string;
  deviceId: string;
  exp: number; // unix seconds
}

const enc = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array {
  const p = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(p);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function secretOf(secret?: string): string {
  if (secret) return secret;
  const env = process.env.PROTECT_SECRET;
  if (env && env.length >= 16) return env;
  if (process.env.NODE_ENV === "production") throw new Error("PROTECT_SECRET is not set.");
  return DEV_SECRET;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function signReadToken(
  claims: Omit<TokenClaims, "exp">,
  opts: { secret?: string; now?: number; ttlSeconds?: number } = {},
): Promise<string> {
  const now = opts.now ?? Math.floor(Date.now() / 1000);
  const payload: TokenClaims = { ...claims, exp: now + (opts.ttlSeconds ?? TOKEN_TTL_SECONDS) };
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const key = await hmacKey(secretOf(opts.secret));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(body)));
  return `${body}.${b64url(sig)}`;
}

export type VerifyResult =
  | { ok: true; claims: TokenClaims }
  | { ok: false; reason: "malformed" | "bad-signature" | "expired" | "mismatch" };

export async function verifyReadToken(
  token: string,
  expected: Partial<Pick<TokenClaims, "userId" | "productId" | "deviceId">> = {},
  opts: { secret?: string; now?: number } = {},
): Promise<VerifyResult> {
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { ok: false, reason: "malformed" };
  let claims: TokenClaims;
  try {
    const key = await hmacKey(secretOf(opts.secret));
    const valid = await crypto.subtle.verify("HMAC", key, fromB64url(parts[1]) as BufferSource, enc.encode(parts[0]));
    if (!valid) return { ok: false, reason: "bad-signature" };
    claims = JSON.parse(new TextDecoder().decode(fromB64url(parts[0])));
  } catch {
    return { ok: false, reason: "malformed" };
  }
  const now = opts.now ?? Math.floor(Date.now() / 1000);
  if (typeof claims.exp !== "number" || claims.exp <= now) return { ok: false, reason: "expired" };
  for (const k of ["userId", "productId", "deviceId"] as const) {
    if (expected[k] !== undefined && expected[k] !== claims[k]) return { ok: false, reason: "mismatch" };
  }
  return { ok: true, claims };
}

// ---- Entitlements and device limit ----

export interface EntitlementStore {
  hasEntitlement(userId: string, productId: string): Promise<boolean>;
  grant(userId: string, productId: string): Promise<void>;
  listDevices(userId: string, productId: string): Promise<string[]>;
  addDevice(userId: string, productId: string, deviceId: string): Promise<void>;
  removeDevice(userId: string, productId: string, deviceId: string): Promise<void>;
}

/** Development store. Replace with a Postgres implementation (see docs/protection.md). */
export class InMemoryEntitlementStore implements EntitlementStore {
  private entitlements = new Set<string>();
  private devices = new Map<string, Set<string>>();
  private k = (u: string, p: string) => `${u}\u0000${p}`;

  async hasEntitlement(u: string, p: string) {
    return this.entitlements.has(this.k(u, p));
  }
  async grant(u: string, p: string) {
    this.entitlements.add(this.k(u, p));
  }
  async listDevices(u: string, p: string) {
    return [...(this.devices.get(this.k(u, p)) ?? [])];
  }
  async addDevice(u: string, p: string, d: string) {
    const key = this.k(u, p);
    const set = this.devices.get(key) ?? new Set<string>();
    set.add(d);
    this.devices.set(key, set);
  }
  async removeDevice(u: string, p: string, d: string) {
    this.devices.get(this.k(u, p))?.delete(d);
  }
}

export type AccessDecision =
  | { allowed: true; newDevice: boolean }
  | { allowed: false; reason: "no-entitlement" | "device-limit" };

/** Registers the device if there is room; refuses a third device. */
export async function checkAndRegisterDevice(
  store: EntitlementStore,
  userId: string,
  productId: string,
  deviceId: string,
  maxDevices: number = MAX_DEVICES,
): Promise<AccessDecision> {
  if (!(await store.hasEntitlement(userId, productId))) return { allowed: false, reason: "no-entitlement" };
  const devices = await store.listDevices(userId, productId);
  if (devices.includes(deviceId)) return { allowed: true, newDevice: false };
  if (devices.length >= maxDevices) return { allowed: false, reason: "device-limit" };
  await store.addDevice(userId, productId, deviceId);
  return { allowed: true, newDevice: true };
}
