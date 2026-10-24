import { ReaderView, readerMetadata } from "@/views/library";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return readerMetadata("id", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ReaderView lang="id" slug={slug} />;
}
