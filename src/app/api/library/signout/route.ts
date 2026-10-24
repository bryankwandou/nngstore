import { NextResponse } from "next/server";
import { clearLibrary, clearPending } from "@/lib/server/library";

export const runtime = "nodejs";

/** Forgets this browser's library (for shared or school computers). */
export async function POST() {
  await clearLibrary();
  await clearPending();
  return NextResponse.json({ ok: true });
}
