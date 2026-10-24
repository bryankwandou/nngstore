import { ProtectionView, protectionMetadata } from "@/views/pages";

export const generateMetadata = () => protectionMetadata("en");

export default function Page() {
  return <ProtectionView lang="en" />;
}
