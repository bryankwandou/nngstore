import { PrivacyView, privacyMetadata } from "@/views/pages";

export const generateMetadata = () => privacyMetadata("en");

export default function Page() {
  return <PrivacyView lang="en" />;
}
