import { HelpView, helpMetadata } from "@/views/pages";

export const generateMetadata = () => helpMetadata("id");

export default function Page() {
  return <HelpView lang="id" />;
}
