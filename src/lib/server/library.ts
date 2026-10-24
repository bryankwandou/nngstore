import "server-only";
import { cookies } from "next/headers";
import { catalog, expandSlugs, getItem } from "@/data/catalog";
import { seal, unseal } from "./sign";

// Without a database, purchases live in a signed, httpOnly cookie on the
// buyer's browser. Product slugs are stored as catalog indexes so all 192
// files still fit in one cookie. The buyer cannot edit it: any change breaks
// the signature and the cookie is ignored.

export const LIBRARY_COOKIE = "nng_lib";
export const PENDING_COOKIE = "nng_pending";

const index = new Map(catalog.products.map((p, i) => [p.slug, i]));

export type Owner = { name: string; email: string };
export type LibraryOrder = { id: string; at: string; total: number; mode: "demo" | "midtrans" };

type Stored = { v: 1; o: Owner; p: number[]; ord: LibraryOrder[]; po: Record<string, string> };

export type Library = {
  owner: Owner | null;
  slugs: string[];
  orders: LibraryOrder[];
  /** product slug -> order id that granted it */
  orderOf: Record<string, string>;
};

export type PendingOrder = {
  id: string;
  slugs: string[];
  total: number;
  name: string;
  email: string;
  at: string;
  mode: "demo" | "midtrans";
};

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function readLibrary(): Promise<Library> {
  const jar = await cookies();
  const s = unseal<Stored>("library", jar.get(LIBRARY_COOKIE)?.value);
  if (!s || s.v !== 1) return { owner: null, slugs: [], orders: [], orderOf: {} };
  const slugs = s.p.map((i) => catalog.products[i]?.slug).filter((x): x is string => Boolean(x));
  const orderOf: Record<string, string> = {};
  for (const [k, v] of Object.entries(s.po ?? {})) {
    const slug = catalog.products[Number(k)]?.slug;
    if (slug) orderOf[slug] = v;
  }
  return { owner: s.o, slugs, orders: s.ord ?? [], orderOf };
}

/** Adds an order's files to the library cookie. A different email starts a fresh library. */
export async function grantOrder(order: PendingOrder): Promise<Library> {
  return grantOrders([order]);
}

/** Adds several orders of one buyer in one cookie write, oldest first. */
export async function grantOrders(list: PendingOrder[]): Promise<Library> {
  const current = await readLibrary();
  const last = list.at(-1);
  if (!last) return current;
  const sameOwner = current.owner?.email.toLowerCase() === last.email.toLowerCase();
  const base = sameOwner ? current : { owner: null, slugs: [], orders: [], orderOf: {} };

  const owned = new Set(base.slugs);
  const orderOf = { ...base.orderOf };
  let orders = base.orders;
  for (const order of list) {
    if (orders.some((o) => o.id === order.id)) continue;
    for (const slug of expandSlugs(order.slugs)) {
      if (!owned.has(slug)) orderOf[slug] = order.id;
      owned.add(slug);
    }
    orders = [{ id: order.id, at: order.at, total: order.total, mode: order.mode }, ...orders].slice(0, 12);
  }
  if (orders === base.orders) return base;

  const jar = await cookies();
  const stored: Stored = {
    v: 1,
    o: { name: last.name, email: last.email },
    p: [...owned].map((s) => index.get(s)).filter((x): x is number => x !== undefined),
    ord: orders,
    po: Object.fromEntries(
      Object.entries(orderOf)
        .map(([slug, id]) => [String(index.get(slug)), id])
        .filter(([k]) => k !== "undefined"),
    ),
  };
  jar.set(LIBRARY_COOKIE, seal("library", stored), { ...cookieBase, maxAge: 60 * 60 * 24 * 365 });
  return { owner: stored.o, slugs: [...owned], orders, orderOf };
}

export async function clearLibrary() {
  const jar = await cookies();
  jar.delete(LIBRARY_COOKIE);
}

export async function setPending(order: PendingOrder) {
  const jar = await cookies();
  jar.set(PENDING_COOKIE, seal("pending", order), { ...cookieBase, maxAge: 60 * 60 * 2 });
}

export async function readPending(): Promise<PendingOrder | null> {
  const jar = await cookies();
  return unseal<PendingOrder>("pending", jar.get(PENDING_COOKIE)?.value);
}

export async function clearPending() {
  const jar = await cookies();
  jar.delete(PENDING_COOKIE);
}

export function ownsSlug(lib: Library, slug: string): boolean {
  const it = getItem(slug);
  return Boolean(it && it.kind === "product" && lib.slugs.includes(slug));
}
