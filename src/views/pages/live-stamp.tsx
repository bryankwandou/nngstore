"use client";

import { useSyncExternalStore } from "react";
import type { Lang } from "@/lib/i18n";

/**
 * The reader's live watermark, reproduced for the demo: buyer name plus the
 * current date and time, refreshed every 30 seconds like the real reader.
 * The server renders the name alone, so there is no hydration mismatch.
 */
const STEP = 30_000;

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, STEP);
  return () => window.clearInterval(id);
}

const snapshot = () => Math.floor(Date.now() / STEP) * STEP;
const serverSnapshot = () => null;

export function LiveStamp({ name, lang }: { name: string; lang: Lang }) {
  const now = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const time =
    now === null
      ? null
      : new Date(now).toLocaleString(lang === "id" ? "id-ID" : "en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        });
  return (
    <span className="tabular">
      {name}
      {time ? ` · ${time}` : null}
    </span>
  );
}
