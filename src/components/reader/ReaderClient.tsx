"use client";

import dynamic from "next/dynamic";
import type { ProtectedReaderProps } from "./ProtectedReader";

// pdfjs touches the DOM at import time, so the reader is client-only.
const ProtectedReader = dynamic(() => import("./ProtectedReader"), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-[60vh] animate-pulse rounded-[var(--radius-md)] border border-line bg-surface-2 motion-reduce:animate-none"
      aria-hidden
    />
  ),
});

export function ReaderClient(props: ProtectedReaderProps) {
  return <ProtectedReader {...props} />;
}

export default ReaderClient;
