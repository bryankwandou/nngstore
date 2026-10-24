import { LibraryView, libraryMetadata } from "@/views/library";

export const dynamic = "force-dynamic";
export const generateMetadata = () => libraryMetadata("id");

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { order } = await searchParams;
  return <LibraryView lang="id" order={typeof order === "string" ? order : undefined} />;
}
