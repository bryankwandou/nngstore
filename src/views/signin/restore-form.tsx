"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";
import { path, type Lang } from "@/lib/i18n";
import { libraryCopy } from "@/content/library";
import { Button } from "@/components/ui/button";

type State = "idle" | "busy" | "not-found" | "pending" | "failed" | "unavailable" | "error";

const input = clsx(
  "block h-11 w-full min-w-0 rounded-[var(--radius-sm)] border border-line-strong bg-bg-elev px-3.5 text-base text-text placeholder:text-subtle",
  "transition-[border-color,box-shadow] duration-150 hover:border-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-ring/40",
);

/** Email plus one order number brings every paid file back to this browser. */
export function RestoreForm({ lang }: { lang: Lang }) {
  const t = libraryCopy(lang).signin.restore;
  const router = useRouter();
  const [state, setState] = useState<State>("idle");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("busy");
    try {
      const res = await fetch("/api/library/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), orderId: form.get("order") }),
      });
      const data = (await res.json().catch(() => ({}))) as { status?: string };
      if (data.status === "paid") {
        router.push(path("library", lang));
        router.refresh();
        return;
      }
      const s = data.status;
      setState(s === "not-found" || s === "pending" || s === "failed" || s === "unavailable" ? s : "error");
    } catch {
      setState("error");
    }
  }

  const message = state === "idle" || state === "busy" ? null : t.result[state];

  return (
    <form
      onSubmit={submit}
      aria-labelledby="restore-title"
      className="mt-10 rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-6"
    >
      <h2 id="restore-title" className="font-sans text-lg font-semibold">
        {t.title}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">{t.lead}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block min-w-0">
          <span className="text-sm font-medium">{t.email}</span>
          <input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            maxLength={120}
            className={clsx(input, "mt-1.5")}
          />
        </label>
        <label className="block min-w-0">
          <span className="text-sm font-medium">{t.order}</span>
          <input
            name="order"
            type="text"
            autoCapitalize="characters"
            spellCheck={false}
            required
            maxLength={40}
            placeholder="NNG-XXXXXXX-XXXXXX"
            className={clsx(input, "mt-1.5 font-mono uppercase")}
          />
        </label>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={state === "busy"}>
          {state === "busy" ? <Loader2 aria-hidden className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : null}
          {t.submit}
        </Button>
        <p role="status" aria-live="polite" className={clsx("text-sm", message ? "text-muted" : "sr-only")}>
          {message ?? ""}
        </p>
      </div>
    </form>
  );
}
