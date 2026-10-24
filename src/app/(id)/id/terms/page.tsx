import { TermsView, termsMetadata } from "@/views/pages";

export const generateMetadata = () => termsMetadata("id");

export default function Page() {
  return <TermsView lang="id" />;
}
