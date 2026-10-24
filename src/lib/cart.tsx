"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

/**
 * The cart only remembers slugs. Prices, titles and covers are always read
 * from the catalog at render time, so a stale cart can never show an old price.
 * Digital files have no quantity: an item is either in the cart or not.
 */

const STORAGE_KEY = "nngstore.cart.v1";

type CartState = {
  slugs: string[];
  ready: boolean;
  isOpen: boolean;
  has: (slug: string) => boolean;
  add: (slug: string) => void;
  remove: (slug: string) => void;
  toggle: (slug: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

const CartContext = createContext<CartState | null>(null);

function readStored(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

/* One shared store so every tab and component sees the same list. */
const EMPTY: string[] = [];
let cache: string[] | null = null;
const listeners = new Set<() => void>();

function snapshot(): string[] {
  if (cache === null) cache = readStored();
  return cache;
}

function serverSnapshot(): string[] {
  return EMPTY;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    cache = readStored();
    onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function setSlugs(update: (s: string[]) => string[]) {
  cache = update(snapshot());
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    /* Private mode or blocked storage: the cart still works for this visit. */
  }
  listeners.forEach((l) => l());
}

const noSubscribe = () => () => {};

export function CartProvider({ children }: { children: ReactNode }) {
  const slugs = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const ready = useSyncExternalStore(noSubscribe, () => true, () => false);
  const [isOpen, setOpen] = useState(false);

  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);
  const add = useCallback(
    (slug: string) => setSlugs((s) => (s.includes(slug) ? s : [...s, slug])),
    [],
  );
  const remove = useCallback((slug: string) => setSlugs((s) => s.filter((x) => x !== slug)), []);
  const toggle = useCallback(
    (slug: string) => setSlugs((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug])),
    [],
  );
  const clear = useCallback(() => setSlugs(() => []), []);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ slugs, ready, isOpen, has, add, remove, toggle, clear, open, close }),
    [slugs, ready, isOpen, has, add, remove, toggle, clear, open, close],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
