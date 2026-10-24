import { notFound } from "next/navigation";

// Sends every unmatched English URL to (en)/not-found.tsx.
export default function Missing() {
  notFound();
}
