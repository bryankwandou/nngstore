import { PrivacyView, privacyMetadata } from "@/views/pages";

export const generateMetadata = () => privacyMetadata("id");

export default function Page() {
  return <PrivacyView lang="id" />;
}
