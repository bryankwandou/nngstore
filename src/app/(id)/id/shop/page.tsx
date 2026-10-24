import { ShopView, shopMetadata } from "@/views/shop";

export const generateMetadata = () => shopMetadata("id");

export default function Page() {
  return <ShopView lang="id" />;
}
