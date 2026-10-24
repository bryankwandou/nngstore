// Uploads private/pdfs/*.pdf to the private Blob store as pdfs/<slug>.pdf.
// Only new or changed files are sent: each file's SHA-256 is kept in
// data/blob-manifest.json, so adding one product uploads one file.
// Run: node --env-file=.env.local scripts/blob-sync.mjs [--dry]
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { put } from "@vercel/blob";

const root = new URL("../", import.meta.url);
const dir = new URL("private/pdfs/", root);
const manifestUrl = new URL("data/blob-manifest.json", root);
const dry = process.argv.includes("--dry");

if (!dry && !process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN is not set. Run `vercel env pull .env.local` after linking a Blob store.");
  process.exit(1);
}

const catalog = JSON.parse(await readFile(new URL("src/data/catalog.json", root), "utf8"));
const held = JSON.parse(await readFile(new URL("src/data/held.json", root), "utf8"));
const live = new Set(catalog.products.map((p) => p.slug).filter((s) => !held.slugs.includes(s)));

let manifest = {};
try {
  manifest = JSON.parse(await readFile(manifestUrl, "utf8"));
} catch {
  /* First run. */
}

const files = (await readdir(dir)).filter((f) => f.endsWith(".pdf"));
let sent = 0;
let skipped = 0;
let bytes = 0;
for (const file of files) {
  const slug = file.slice(0, -4);
  if (!live.has(slug)) continue; // Held or unknown files never leave this machine.
  const body = await readFile(new URL(file, dir));
  const sha = createHash("sha256").update(body).digest("hex");
  if (manifest[slug]?.sha === sha) {
    skipped += 1;
    continue;
  }
  if (!dry) {
    await put(`pdfs/${slug}.pdf`, body, {
      access: "private",
      contentType: "application/pdf",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    manifest[slug] = { sha, size: body.byteLength };
  }
  sent += 1;
  bytes += body.byteLength;
  if (sent % 20 === 0) console.log(`  ${sent} uploaded`);
}

if (!dry) {
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(manifestUrl, JSON.stringify(sorted, null, 2) + "\n");
}
console.log(`${dry ? "would upload" : "uploaded"} ${sent} (${(bytes / 1e6).toFixed(1)} MB), unchanged ${skipped}, live ${live.size}`);
