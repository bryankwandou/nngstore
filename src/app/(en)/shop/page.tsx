import { ShopView, shopMetadata } from "@/views/shop";

export const generateMetadata = () => shopMetadata("en");

export default function Page() {
  return <ShopView lang="en" />;
}
