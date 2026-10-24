import { SigninView, signinMetadata } from "@/views/signin";

export const generateMetadata = () => signinMetadata("en");

export default function Page() {
  return <SigninView lang="en" />;
}
