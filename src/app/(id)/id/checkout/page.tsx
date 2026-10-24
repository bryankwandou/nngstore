import { CheckoutView, checkoutMetadata } from "@/views/checkout";

export const dynamic = "force-dynamic";
export const generateMetadata = () => checkoutMetadata("id");

export default function Page() {
  return <CheckoutView lang="id" />;
}
