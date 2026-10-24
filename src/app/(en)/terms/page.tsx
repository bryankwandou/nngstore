import { TermsView, termsMetadata } from "@/views/pages";

export const generateMetadata = () => termsMetadata("en");

export default function Page() {
  return <TermsView lang="en" />;
}
