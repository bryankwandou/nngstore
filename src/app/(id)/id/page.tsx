import { HomeView, homeMetadata } from "@/views/home";

export const generateMetadata = () => homeMetadata("id");

export default function Page() {
  return <HomeView lang="id" />;
}
