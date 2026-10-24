import { NotFoundView, notFoundMetadata } from "@/views/pages";

export const metadata = notFoundMetadata("en");

export default function NotFound() {
  return <NotFoundView lang="en" />;
}
