import { BundlesView, bundlesMetadata } from "@/views/bundles";

export const generateMetadata = () => bundlesMetadata("en");

export default function Page() {
  return <BundlesView lang="en" />;
}
