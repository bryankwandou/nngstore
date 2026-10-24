import { NotFoundView, notFoundMetadata } from "@/views/pages";

export const metadata = notFoundMetadata("id");

export default function NotFound() {
  return <NotFoundView lang="id" />;
}
