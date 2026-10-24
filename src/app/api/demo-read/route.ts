import { readFile } from "node:fs/promises";
import path from "node:path";
import { stampPdf } from "@/lib/protect/stamp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Demo only: stamps a sample for a fake buyer so the reader can be tested
// before payments exist. Real routes must check a read token first.
export async function GET() {
  const original = await readFile(path.join(process.cwd(), "private/samples/sample.pdf"));
  const stamped = await stampPdf(new Uint8Array(original), {
    name: "Demo Buyer",
    email: "demo.buyer@example.com",
    orderId: "NNG-DEMO-0001",
    purchasedAt: new Date().toISOString(),
  });
  return new Response(Buffer.from(stamped), {
    headers: {
      "Content-Type": "application/pdf",
      "Cache-Control": "no-store",
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
