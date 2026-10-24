import { CheckoutView, checkoutMetadata } from "@/views/checkout";

export const dynamic = "force-dynamic";
export const generateMetadata = () => checkoutMetadata("en");

export default function Page() {
  return <CheckoutView lang="en" />;
}
