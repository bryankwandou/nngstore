import { RefundsView, refundsMetadata } from "@/views/pages";

export const generateMetadata = () => refundsMetadata("id");

export default function Page() {
  return <RefundsView lang="id" />;
}
