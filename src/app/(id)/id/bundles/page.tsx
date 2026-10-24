import { BundlesView, bundlesMetadata } from "@/views/bundles";

export const generateMetadata = () => bundlesMetadata("id");

export default function Page() {
  return <BundlesView lang="id" />;
}
