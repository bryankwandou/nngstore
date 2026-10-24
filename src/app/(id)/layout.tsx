import type { Metadata } from "next";
import "../globals.css";
import { RootShell } from "@/components/layout/root-shell";
import { buildMetadata } from "@/lib/meta";

export { viewport } from "@/lib/meta";

export const metadata: Metadata = buildMetadata("id");

export default function IndonesianLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootShell lang="id">{children}</RootShell>;
}
