import { ProductView, productMetadata, productStaticParams } from "@/views/product";

export const dynamicParams = false;

export function generateStaticParams() {
  return productStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return productMetadata(slug, "en");
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductView slug={slug} lang="en" />;
}
