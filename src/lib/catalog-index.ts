"use client";

import { useEffect, useState } from "react";
import type { IndexEntry } from "./catalog-search";

export { normalize, searchIndex, type IndexEntry } from "./catalog-search";

/**
 * A compact copy of the catalog for the browser: enough for search results and
 * the cart, nothing more. It is a static file built from src/data/catalog.ts,
 * fetched once on first use and shared by every component that asks for it.
 */
export type IndexState =
  | { status: "loading"; entries: IndexEntry[] }
  | { status: "ready"; entries: IndexEntry[] }
  | { status: "error"; entries: IndexEntry[] };

let cache: Promise<IndexEntry[]> | null = null;

function load(): Promise<IndexEntry[]> {
  if (!cache) {
    cache = fetch("/search-index.json")
      .then((r) => {
        if (!r.ok) throw new Error(`index ${r.status}`);
        return r.json() as Promise<IndexEntry[]>;
      })
      .catch((err) => {
        cache = null;
        throw err;
      });
  }
  return cache;
}

export function useCatalogIndex(enabled = true): IndexState & { retry: () => void } {
  const [state, setState] = useState<IndexState>({ status: "loading", entries: [] });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    load()
      .then((entries) => alive && setState({ status: "ready", entries }))
      .catch(() => alive && setState({ status: "error", entries: [] }));
    return () => {
      alive = false;
    };
  }, [enabled, attempt]);

  return { ...state, retry: () => setAttempt((n) => n + 1) };
}
