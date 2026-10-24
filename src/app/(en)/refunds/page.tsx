import { RefundsView, refundsMetadata } from "@/views/pages";

export const generateMetadata = () => refundsMetadata("en");

export default function Page() {
  return <RefundsView lang="en" />;
}
