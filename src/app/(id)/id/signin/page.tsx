import { SigninView, signinMetadata } from "@/views/signin";

export const generateMetadata = () => signinMetadata("id");

export default function Page() {
  return <SigninView lang="id" />;
}
