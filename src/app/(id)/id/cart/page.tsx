import { redirect } from "next/navigation";
import { path } from "@/lib/i18n";

/** The cart lives in the drawer; the full-page cart is the checkout summary. */
export default function Page() {
  redirect(path("checkout", "id"));
}
