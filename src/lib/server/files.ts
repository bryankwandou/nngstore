import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { get } from "@vercel/blob";

// Source PDFs live in a private Vercel Blob store at pdfs/<slug>.pdf, uploaded
// by scripts/blob-sync.mjs. Locally, or before the store exists, they are read
// from private/pdfs. A warm function keeps recent files in memory, so a buyer
// paging back and forth does not pay for the same download twice.

const CACHE_BYTES = 48 * 1024 * 1024;
const cache = new Map<string, Uint8Array>();
let cached = 0;

function remember(slug: string, bytes: Uint8Array) {
  if (bytes.byteLength > CACHE_BYTES / 4) return;
  cache.set(slug, bytes);
  cached += bytes.byteLength;
  for (const [k, v] of cache) {
    if (cached <= CACHE_BYTES) break;
    cache.delete(k);
    cached -= v.byteLength;
  }
}

async function fromBlob(slug: string): Promise<Uint8Array | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  const res = await get(`pdfs/${slug}.pdf`, { access: "private" });
  if (!res || res.statusCode !== 200) return null;
  return new Uint8Array(await new Response(res.stream).arrayBuffer());
}

async function fromDisk(slug: string): Promise<Uint8Array | null> {
  try {
    return new Uint8Array(await readFile(path.join(process.cwd(), "private", "pdfs", `${slug}.pdf`)));
  } catch {
    return null;
  }
}

/** The unstamped source PDF for one product, or null when it cannot be found anywhere. */
export async function loadSourcePdf(slug: string): Promise<Uint8Array | null> {
  const hit = cache.get(slug);
  if (hit) {
    cache.delete(slug);
    cache.set(slug, hit);
    return hit;
  }
  const bytes = (await fromBlob(slug).catch(() => null)) ?? (await fromDisk(slug));
  if (bytes) remember(slug, bytes);
  return bytes;
}
