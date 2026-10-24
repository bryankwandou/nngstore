import { ProtectionView, protectionMetadata } from "@/views/pages";

export const generateMetadata = () => protectionMetadata("id");

export default function Page() {
  return <ProtectionView lang="id" />;
}
