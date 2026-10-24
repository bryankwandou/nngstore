import { notFound } from "next/navigation";

// Sends every unmatched Indonesian URL to (id)/id/not-found.tsx.
export default function Missing() {
  notFound();
}
