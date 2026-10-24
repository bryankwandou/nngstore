import type { Metadata } from "next";
import "../globals.css";
import { RootShell } from "@/components/layout/root-shell";
import { buildMetadata } from "@/lib/meta";

export { viewport } from "@/lib/meta";

export const metadata: Metadata = buildMetadata("en");

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootShell lang="en">{children}</RootShell>;
}
