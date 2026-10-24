"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { libraryCopy } from "@/content/library";
import { Button } from "@/components/ui/button";

/** Two-step "forget this browser": asks once, then clears the library cookie. */
export function ForgetButton({ lang }: { lang: Lang }) {
  const t = libraryCopy(lang).forget;
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "confirm" | "working" | "error">("idle");
  const confirmRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (step === "confirm") confirmRef.current?.focus();
  }, [step]);

  async function forget() {
    setStep("working");
    try {
      const res = await fetch("/api/library/signout", { method: "POST", cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      router.refresh();
    } catch {
      setStep("error");
    }
  }

  if (step === "idle") {
    return (
      <div>
        <Button variant="outline" size="sm" onClick={() => setStep("confirm")}>
          <LogOut aria-hidden className="h-4 w-4" />
          {t.button}
        </Button>
        <p className="mt-2 text-xs text-muted">{t.hint}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-danger/40 bg-surface-2 p-4">
      <p ref={confirmRef} tabIndex={-1} className="text-sm leading-relaxed focus:outline-none">
        {t.confirm}
      </p>
      {step === "error" ? (
        <p role="alert" className="mt-2 text-sm text-danger">
          {t.error}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={forget}
          disabled={step === "working"}
          aria-busy={step === "working"}
          className="bg-danger text-bg hover:bg-danger hover:opacity-90"
        >
          {step === "working" ? <Loader2 aria-hidden className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : null}
          {step === "working" ? t.working : t.yes}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setStep("idle")} disabled={step === "working"}>
          {t.cancel}
        </Button>
      </div>
    </div>
  );
}
