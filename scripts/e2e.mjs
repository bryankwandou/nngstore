// End-to-end checks against a running `next start`.
//   node scripts/e2e.mjs http://localhost:3100            (Midtrans mode: keys set)
//   node scripts/e2e.mjs http://localhost:3101 --demo     (demo mode: keys blank)
// Midtrans mode never pays anything: it creates one Snap token and confirms the
// order is still unpaid, so no access is granted.
import { createHash } from "node:crypto";
import { PDFDocument } from "pdf-lib";

const base = process.argv[2] ?? "http://localhost:3100";
const demo = process.argv.includes("--demo");
const slug = "worksheet-1000-biology";
let pass = 0;
let fail = 0;

function check(name, ok, extra = "") {
  if (ok) pass++;
  else fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? `  (${extra})` : ""}`);
}

const jar = new Map();
function cookieHeader() {
  return [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
}
function keep(res) {
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [pair] = c.split(";");
    const i = pair.indexOf("=");
    const k = pair.slice(0, i);
    const v = pair.slice(i + 1);
    if (v === "" || /max-age=0/i.test(c) || /expires=Thu, 01 Jan 1970/i.test(c)) jar.delete(k);
    else jar.set(k, v);
  }
}
async function req(path, init = {}) {
  const res = await fetch(base + path, {
    redirect: "manual",
    ...init,
    headers: { cookie: cookieHeader(), "sec-fetch-site": "same-origin", ...(init.headers ?? {}) },
  });
  keep(res);
  return res;
}
const post = (path, body) =>
  req(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

// 1. Pages render in both languages
const pages = ["/", "/shop", `/shop/${slug}`, "/shop/bundle-subject-biology", "/bundles", "/checkout", "/library", "/help", "/protection", "/refunds", "/terms", "/privacy", "/signin"];
for (const p of pages) {
  for (const prefix of ["", "/id"]) {
    const url = prefix ? (p === "/" ? "/id" : prefix + p) : p;
    const r = await req(url);
    const html = r.status === 200 ? await r.text() : "";
    const lang = prefix ? 'lang="id-ID"' : 'lang="en-US"';
    check(`GET ${url}`, r.status === 200 && html.includes(lang), String(r.status));
  }
}
check("unknown product is 404", (await req("/shop/does-not-exist")).status === 404);
check("search index served", (await req("/search-index.json")).status === 200);
check("paid PDFs are not public", (await req(`/private/pdfs/${slug}.pdf`)).status === 404);

// 2. Checkout validation: the server prices the cart, the client cannot
check("bad email rejected", (await post("/api/checkout", { slugs: [slug], email: "nope" })).status === 400);
check("empty cart rejected", (await post("/api/checkout", { slugs: ["fake"], email: "a@b.co" })).status === 400);

// 3. Access control before payment
check("read without purchase is 403", (await req(`/api/read/${slug}?t=x`)).status === 403);
jar.set("nng_lib", "eyJ2IjoxfQ.forged");
check("forged library cookie is 403", (await req(`/api/read/${slug}?t=x`)).status === 403);
jar.delete("nng_lib");

// 4. Notification endpoint rejects bad signatures
const forged = { order_id: "NNG-X", status_code: "200", gross_amount: "19000.00", transaction_status: "settlement", signature_key: "00" };
check("notify with forged signature is 401", (await post("/api/midtrans/notify", forged)).status === 401);

const r = await post("/api/checkout", { slugs: [slug], email: "e2e.buyer@example.com", name: "E2E Buyer", lang: "en" });
const order = await r.json();
check("checkout returns an order", r.status === 200 && typeof order.orderId === "string", JSON.stringify(order).slice(0, 80));
check("server-side total", order.total === 29000, String(order.total));

if (!demo) {
  check("midtrans mode", order.mode === "midtrans");
  check("snap token issued", typeof order.token === "string" && order.token.length > 20);
  const c = await (await post("/api/checkout/confirm", { orderId: order.orderId })).json();
  check("unpaid order is not granted", c.status === "pending", c.status);
  check("still no access after unpaid confirm", (await req(`/api/read/${slug}?t=x`)).status === 403);
  const restore = await post("/api/library/restore", { email: "e2e.buyer@example.com", orderId: order.orderId });
  if (restore.status === 503) console.log("SKIP  restore (no database configured)");
  else check("restore of an unpaid order grants nothing", (await restore.json()).status === "pending");
  const key = process.env.MIDTRANS_SERVER_KEY;
  if (key) {
    const body = { order_id: order.orderId, status_code: "201", gross_amount: "29000.00", transaction_status: "pending" };
    body.signature_key = createHash("sha512").update(body.order_id + body.status_code + body.gross_amount + key).digest("hex");
    check("notify with valid signature is 200", (await post("/api/midtrans/notify", body)).status === 200);
  }
} else {
  check("demo mode", order.mode === "demo");
  check("confirm with wrong order id refused", (await post("/api/checkout/confirm", { orderId: "NNG-NOPE" })).status === 404);
  const c = await (await post("/api/checkout/confirm", { orderId: order.orderId })).json();
  check("demo payment granted", c.status === "paid", c.status);
  const lib = await (await req("/library")).text();
  check("library lists the file", lib.includes(slug));
  const html = await (await req(`/library/${slug}`)).text();
  const m = html.match(/\/api\/read\/[a-z0-9-]+\?t=[A-Za-z0-9_.-]+/);
  check("reader page carries a read token", Boolean(m));
  if (m) {
    const url = m[0].replace(/&amp;/g, "&");
    const pdf = await req(url);
    const bytes = new Uint8Array(await pdf.arrayBuffer());
    check("stamped PDF served", pdf.status === 200 && pdf.headers.get("content-type") === "application/pdf");
    check("no-store on PDF", (pdf.headers.get("cache-control") ?? "").includes("no-store"));
    const doc = await PDFDocument.load(bytes);
    check("demo copy is cut to 2 pages", doc.getPageCount() === 2, String(doc.getPageCount()));
    check("copy is stamped with the order", (doc.getSubject() ?? "").includes(order.orderId), doc.getSubject());
    check("cross-site fetch refused", (await req(url, { headers: { "sec-fetch-site": "cross-site" } })).status === 403);
    check("token for another file refused", (await req(url.replace(slug, "answer-key-1000-biology"))).status === 403);
    const saved = new Map(jar);
    jar.clear();
    check("token alone (no cookie) refused", (await req(url)).status === 403);
    for (const [k, v] of saved) jar.set(k, v);
  }
  check("signout clears access", (await post("/api/library/signout", {})).status === 200 && !(await (await req("/library")).text()).includes(`/library/${slug}"`));

  const wrong = await post("/api/library/restore", { email: "someone.else@example.com", orderId: order.orderId });
  if (wrong.status === 503) console.log("SKIP  restore (no database configured)");
  else {
    check("restore with the wrong email refused", wrong.status === 404);
    const back = await post("/api/library/restore", { email: "e2e.buyer@example.com", orderId: order.orderId });
    check("restore with email and order brings the file back", back.status === 200 && (await (await req("/library")).text()).includes(`/library/${slug}"`));
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
