import { HelpView, helpMetadata } from "@/views/pages";

export const generateMetadata = () => helpMetadata("en");

export default function Page() {
  return <HelpView lang="en" />;
}
