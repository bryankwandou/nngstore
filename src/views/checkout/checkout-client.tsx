"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { clsx } from "clsx";
import { AlertCircle, ArrowRight, CheckCircle2, Clock, Loader2, Lock, ShieldCheck, ShoppingBag, XCircle } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useCatalogIndex, type IndexEntry } from "@/lib/catalog-index";
import { formatIdr } from "@/lib/format";
import { path, type Lang } from "@/lib/i18n";
import { checkoutCopy } from "@/content/checkout";
import { Button, ButtonLink } from "@/components/ui/button";
import { confirmOrder, loadSnap, startCheckout } from "./api";
import { DemoPayment } from "./demo-payment";
import { OrderSummary, OrderSummarySkeleton, type SummaryLine } from "./order-summary";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const POLL_MS = 3000;
const POLL_TRIES = 40; // about 2 minutes

type Phase =
  | { k: "form" }
  | { k: "submitting" }
  | { k: "demo"; orderId: string; total: number }
  | { k: "opening"; orderId: string; total: number }
  | { k: "waiting"; orderId: string; total: number; slow: boolean; round: number }
  | { k: "failed"; orderId: string }
  | { k: "paid"; orderId: string };

type Banner = "gateway" | "network" | "script" | "empty" | "closed" | "expired" | null;

export type CheckoutOwner = { name: string; email: string } | null;

export function CheckoutClient({ lang, owner, owned }: { lang: Lang; owner: CheckoutOwner; owned: string[] }) {
  const t = checkoutCopy(lang);
  const router = useRouter();
  const { slugs, ready, remove, clear } = useCart();
  const index = useCatalogIndex(true);

  const [email, setEmail] = useState(owner?.email ?? "");
  const [name, setName] = useState(owner?.name ?? "");
  const [phone, setPhone] = useState("");
  const [ack, setAck] = useState(false);
  const [errors, setErrors] = useState<{ email?: boolean; ack?: boolean }>({});
  const [phase, setPhase] = useState<Phase>({ k: "form" });
  const [banner, setBanner] = useState<Banner>(null);
  const [demoBusy, setDemoBusy] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const ackRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const panelHeadingRef = useRef<HTMLHeadingElement>(null);
  const phaseRef = useRef<Phase>(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  /* ---------- cart lines, resolved from the shared catalog index ---------- */
  const bySlug = useMemo(() => new Map(index.entries.map((e) => [e.s, e])), [index.entries]);
  const ownedSet = useMemo(() => new Set(owned), [owned]);
  const lines: SummaryLine[] = useMemo(() => {
    const entries = slugs.map((s) => bySlug.get(s)).filter((e): e is IndexEntry => Boolean(e));
    const coveredBy = new Map<string, string>();
    for (const e of entries) if (e.k === "bundle") for (const m of e.i ?? []) coveredBy.set(m, e.t[lang]);
    return entries.map((e) => {
      const members = e.k === "bundle" ? (e.i ?? []).map((m) => bySlug.get(m)).filter((x): x is IndexEntry => Boolean(x)) : [];
      const owns = e.k === "bundle" ? (e.i?.length ?? 0) > 0 && (e.i ?? []).every((m) => ownedSet.has(m)) : ownedSet.has(e.s);
      return { entry: e, members, owned: owns, insideBundle: e.k === "product" ? coveredBy.get(e.s) : undefined };
    });
  }, [slugs, bySlug, ownedSet, lang]);
  const total = lines.reduce((s, l) => s + l.entry.p, 0);

  /* ---------- focus and announcements ---------- */
  const focusKey = phase.k === "waiting" ? `waiting-${phase.slow}` : phase.k;
  useEffect(() => {
    if (focusKey === "demo" || focusKey.startsWith("waiting") || focusKey === "failed") panelHeadingRef.current?.focus();
  }, [focusKey]);

  useEffect(() => {
    if (banner) bannerRef.current?.focus();
  }, [banner]);

  const finish = useCallback(
    (orderId: string) => {
      setPhase({ k: "paid", orderId });
      clear();
      router.push(`${path("library", lang)}?order=${encodeURIComponent(orderId)}`);
    },
    [clear, router, lang],
  );

  /* ---------- polling after Snap reports success or pending ---------- */
  const waitingKey = phase.k === "waiting" && !phase.slow ? `${phase.orderId}:${phase.round}` : null;
  useEffect(() => {
    if (!waitingKey) return;
    const p = phaseRef.current;
    if (p.k !== "waiting") return;
    const { orderId } = p;
    let alive = true;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      tries += 1;
      const s = await confirmOrder(orderId);
      if (!alive) return;
      if (s === "paid") return finish(orderId);
      if (s === "failed") return setPhase({ k: "failed", orderId });
      if (s === "unknown") {
        /* Another tab may have finished it; the library checks once more and explains. */
        router.push(`${path("library", lang)}?order=${encodeURIComponent(orderId)}`);
        return;
      }
      if (tries >= POLL_TRIES) {
        setPhase((cur) => (cur.k === "waiting" ? { ...cur, slow: true } : cur));
        return;
      }
      timer = setTimeout(tick, POLL_MS);
    };
    timer = setTimeout(tick, 600);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [waitingKey, finish, router, lang]);

  /* ---------- submit ---------- */
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (phase.k === "submitting") return;
    const emailOk = EMAIL.test(email.trim());
    const next = { email: !emailOk, ack: !ack };
    setErrors(next);
    if (next.email) return emailRef.current?.focus();
    if (next.ack) return ackRef.current?.focus();
    if (lines.length === 0) return;

    setBanner(null);
    setPhase({ k: "submitting" });
    const res = await startCheckout({
      slugs: lines.map((l) => l.entry.s),
      email: email.trim(),
      name: name.trim(),
      phone: phone.trim() || undefined,
      lang,
    });

    if (!res.ok) {
      setPhase({ k: "form" });
      if (res.error === "email") {
        setErrors({ email: true });
        emailRef.current?.focus();
      } else if (res.error === "empty") setBanner("empty");
      else if (res.error === "gateway") setBanner("gateway");
      else setBanner("network");
      return;
    }

    const d = res.data;
    if (d.mode === "demo") {
      setDemoError(null);
      setPhase({ k: "demo", orderId: d.orderId, total: d.total });
      return;
    }

    setPhase({ k: "opening", orderId: d.orderId, total: d.total });
    try {
      await loadSnap(d.clientKey, d.production);
    } catch {
      if (d.redirectUrl) {
        window.location.assign(d.redirectUrl);
        return;
      }
      setPhase({ k: "form" });
      setBanner("script");
      return;
    }
    const wait = () =>
      setPhase((cur) =>
        cur.k === "opening" || cur.k === "form" ? { k: "waiting", orderId: d.orderId, total: d.total, slow: false, round: 0 } : cur,
      );
    window.snap?.pay(d.token, {
      language: lang,
      onSuccess: wait,
      onPending: wait,
      onError: () => setPhase({ k: "failed", orderId: d.orderId }),
      onClose: () => {
        if (phaseRef.current.k !== "opening") return;
        setPhase({ k: "form" });
        setBanner("closed");
      },
    });
  }

  async function simulate() {
    if (phase.k !== "demo" || demoBusy) return;
    setDemoBusy(true);
    setDemoError(null);
    const s = await confirmOrder(phase.orderId);
    setDemoBusy(false);
    if (s === "paid") return finish(phase.orderId);
    if (s === "unknown") {
      setPhase({ k: "form" });
      setBanner("expired");
      return;
    }
    setDemoError(t.errors.confirm);
  }

  /* ---------- states ---------- */
  const status =
    phase.k === "submitting"
      ? t.preparing
      : phase.k === "opening"
        ? t.status.opening
        : phase.k === "waiting"
          ? phase.slow
            ? t.status.slowTitle
            : t.status.waitingTitle
          : phase.k === "failed"
            ? t.status.failedTitle
            : phase.k === "paid"
              ? t.status.paid
              : phase.k === "demo"
                ? t.demo.title
                : "";

  const live = (
    <p className="sr-only" role="status" aria-live="polite">
      {status}
    </p>
  );

  if (phase.k === "paid") {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        {live}
        <CheckCircle2 aria-hidden className="mx-auto h-10 w-10 text-success" />
        <p className="mt-4 font-medium">{t.status.paid}</p>
        <Loader2 aria-hidden className="mx-auto mt-4 h-5 w-5 animate-spin text-muted motion-reduce:animate-none" />
      </div>
    );
  }

  const loadingCart = !ready;
  const loadingIndex = slugs.length > 0 && index.status === "loading";

  if (loadingCart) {
    return (
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:gap-12">
        <div aria-hidden className="order-2 h-[28rem] animate-pulse rounded-[var(--radius-lg)] border border-line bg-surface motion-reduce:animate-none lg:order-1" />
        <div className="order-1 lg:order-2">
          <OrderSummarySkeleton label={t.summary.loading} />
        </div>
      </div>
    );
  }

  const isEmpty = slugs.length === 0 || (index.status === "ready" && lines.length === 0);
  if (isEmpty) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-12 text-center sm:py-16">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-muted">
          <ShoppingBag aria-hidden className="h-6 w-6" strokeWidth={1.6} />
        </span>
        <h2 className="mt-5 font-sans text-xl font-semibold tracking-tight">{t.empty.title}</h2>
        <p className="mt-2 text-muted">{t.empty.body}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink href={path("shop", lang)}>
            {t.empty.shop}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href={path("bundles", lang)} variant="secondary">
            {t.empty.bundles}
          </ButtonLink>
        </div>
        {owner ? (
          <Link href={path("library", lang)} className="mt-6 text-sm font-medium text-brand underline-offset-4 hover:underline">
            {t.empty.library}
          </Link>
        ) : null}
      </div>
    );
  }

  const locked = phase.k !== "form" && phase.k !== "submitting";
  const busy = phase.k === "submitting" || loadingIndex;

  const bannerText =
    banner === "closed"
      ? t.status.closed
      : banner === "expired"
        ? t.errors.expired
        : banner
          ? t.errors[banner]
          : null;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:gap-12">
      {live}
      <div className="order-2 min-w-0 lg:order-1">
        {phase.k === "demo" ? (
          <DemoPayment
            ref={panelHeadingRef}
            lang={lang}
            orderId={phase.orderId}
            total={phase.total}
            busy={demoBusy}
            error={demoError}
            onSimulate={simulate}
            onEdit={() => setPhase({ k: "form" })}
          />
        ) : phase.k === "waiting" || phase.k === "opening" ? (
          <StatusPanel
            headingRef={panelHeadingRef}
            icon={phase.k === "waiting" && phase.slow ? "clock" : "spin"}
            title={phase.k === "opening" ? t.status.opening : phase.slow ? t.status.slowTitle : t.status.waitingTitle}
            body={phase.k === "opening" ? null : phase.slow ? t.status.slowBody : t.status.waitingBody}
            orderLabel={t.status.orderNo}
            orderId={phase.orderId}
          >
            {phase.k === "waiting" ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  variant={phase.slow ? "primary" : "secondary"}
                  onClick={() => setPhase({ ...phase, slow: false, round: phase.round + 1 })}
                >
                  {t.status.checkNow}
                </Button>
                {phase.slow ? (
                  <ButtonLink variant="secondary" href={`${path("library", lang)}?order=${encodeURIComponent(phase.orderId)}`}>
                    {t.status.openLibrary}
                  </ButtonLink>
                ) : null}
              </div>
            ) : null}
          </StatusPanel>
        ) : phase.k === "failed" ? (
          <StatusPanel
            headingRef={panelHeadingRef}
            icon="fail"
            title={t.status.failedTitle}
            body={t.status.failedBody}
            orderLabel={t.status.orderNo}
            orderId={phase.orderId}
          >
            <div className="mt-6">
              <Button onClick={() => setPhase({ k: "form" })}>{t.status.tryAgain}</Button>
            </div>
          </StatusPanel>
        ) : (
          <form
            noValidate
            onSubmit={onSubmit}
            aria-busy={phase.k === "submitting"}
            className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-7"
          >
            {bannerText ? (
              <div
                ref={bannerRef}
                tabIndex={-1}
                role="alert"
                className={clsx(
                  "mb-6 flex gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-sm focus:outline-none",
                  banner === "closed" ? "border-line bg-surface-2 text-text" : "border-danger/40 bg-surface-2 text-text",
                )}
              >
                <AlertCircle aria-hidden className={clsx("mt-0.5 h-4 w-4 shrink-0", banner === "closed" ? "text-muted" : "text-danger")} />
                <p>{bannerText}</p>
              </div>
            ) : null}

            <fieldset disabled={phase.k === "submitting"} className="min-w-0">
              <legend className="font-sans text-base font-semibold">{t.details.legend}</legend>
              {owner ? <p className="mt-2 text-sm text-muted">{t.details.returning(owner.email)}</p> : null}

              <div className="mt-5 space-y-5">
                <Field
                  id="co-email"
                  label={t.details.email}
                  hint={t.details.emailHint}
                  error={errors.email ? t.errors.email : undefined}
                >
                  <input
                    ref={emailRef}
                    id="co-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    maxLength={120}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((x) => ({ ...x, email: false }));
                    }}
                    aria-invalid={errors.email || undefined}
                    aria-describedby={errors.email ? "co-email-error co-email-hint" : "co-email-hint"}
                    className={inputClass(errors.email)}
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="co-name" label={t.details.name} hint={t.details.nameHint}>
                    <input
                      id="co-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      maxLength={60}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      aria-describedby="co-name-hint"
                      className={inputClass(false)}
                    />
                  </Field>
                  <Field id="co-phone" label={t.details.phone} optional={t.details.optional} hint={t.details.phoneHint}>
                    <input
                      id="co-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={20}
                      placeholder="08xx xxxx xxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      aria-describedby="co-phone-hint"
                      className={inputClass(false)}
                    />
                  </Field>
                </div>
              </div>

              <div className="mt-7 border-t border-line pt-6">
                <div className="flex gap-3">
                  <input
                    ref={ackRef}
                    id="co-ack"
                    type="checkbox"
                    checked={ack}
                    onChange={(e) => {
                      setAck(e.target.checked);
                      if (errors.ack) setErrors((x) => ({ ...x, ack: false }));
                    }}
                    aria-invalid={errors.ack || undefined}
                    aria-describedby={errors.ack ? "co-ack-error" : undefined}
                    className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded accent-[var(--brand)]"
                  />
                  <label htmlFor="co-ack" className="cursor-pointer text-sm leading-relaxed">
                    {t.ack.before}{" "}
                    <Link
                      href={path("refunds", lang)}
                      target="_blank"
                      className="font-medium text-brand underline underline-offset-4"
                    >
                      {t.ack.link}
                    </Link>
                    {t.ack.after}
                  </label>
                </div>
                {errors.ack ? (
                  <p id="co-ack-error" className="mt-2 flex items-center gap-1.5 pl-8 text-sm text-danger">
                    <AlertCircle aria-hidden className="h-4 w-4 shrink-0" />
                    {t.errors.ack}
                  </p>
                ) : null}
              </div>

              <Button type="submit" size="lg" disabled={busy} aria-busy={busy} className="mt-7 w-full">
                {phase.k === "submitting" ? (
                  <>
                    <Loader2 aria-hidden className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                    {t.preparing}
                  </>
                ) : (
                  <>
                    <Lock aria-hidden className="h-4 w-4" />
                    <span className="tabular">{t.pay(formatIdr(total))}</span>
                  </>
                )}
              </Button>
            </fieldset>

            <div className="mt-5 space-y-1.5 text-xs text-muted">
              <p className="flex items-start gap-2">
                <ShieldCheck aria-hidden className="mt-px h-4 w-4 shrink-0 text-success" />
                <span>{t.secure}</span>
              </p>
              <p className="pl-6">{t.methods}</p>
            </div>
          </form>
        )}
      </div>

      <div className="order-1 min-w-0 lg:sticky lg:top-24 lg:order-2">
        {loadingIndex ? (
          <OrderSummarySkeleton label={t.summary.loading} />
        ) : index.status === "error" ? (
          <div role="alert" className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 text-sm sm:p-6">
            <p>{t.summary.error}</p>
            <Button variant="secondary" size="sm" onClick={index.retry} className="mt-4">
              {t.summary.retry}
            </Button>
          </div>
        ) : (
          <OrderSummary lang={lang} lines={lines} total={total} locked={locked} onRemove={remove} />
        )}
      </div>
    </div>
  );
}

function inputClass(invalid?: boolean) {
  return clsx(
    "block h-11 w-full min-w-0 rounded-[var(--radius-sm)] border bg-bg-elev px-3.5 text-base text-text placeholder:text-subtle",
    "transition-[border-color,box-shadow] duration-150 focus:border-brand focus:outline-none focus:ring-2 focus:ring-ring/40",
    "disabled:opacity-60",
    invalid ? "border-danger" : "border-line-strong hover:border-subtle",
  );
}

function Field({
  id,
  label,
  optional,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 flex items-baseline gap-1.5 text-sm font-medium">
        {label}
        {optional ? <span className="text-xs font-normal text-subtle">({optional})</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-sm text-danger">
          <AlertCircle aria-hidden className="h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}
      {hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs leading-relaxed text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function StatusPanel({
  headingRef,
  icon,
  title,
  body,
  orderLabel,
  orderId,
  children,
}: {
  headingRef: React.Ref<HTMLHeadingElement>;
  icon: "spin" | "clock" | "fail";
  title: string;
  body: string | null;
  orderLabel: string;
  orderId: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-[var(--shadow-sm)] sm:p-8">
      <span
        className={clsx(
          "inline-flex h-11 w-11 items-center justify-center rounded-full",
          icon === "fail" ? "bg-surface-2 text-danger" : icon === "clock" ? "bg-surface-2 text-warning" : "bg-brand-soft text-brand",
        )}
      >
        {icon === "spin" ? (
          <Loader2 aria-hidden className="h-5 w-5 animate-spin motion-reduce:animate-none" />
        ) : icon === "clock" ? (
          <Clock aria-hidden className="h-5 w-5" />
        ) : (
          <XCircle aria-hidden className="h-5 w-5" />
        )}
      </span>
      <h2 ref={headingRef} tabIndex={-1} className="mt-4 font-sans text-xl font-semibold tracking-tight focus:outline-none">
        {title}
      </h2>
      {body ? <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted">{body}</p> : null}
      <p className="mt-4 text-xs text-muted">
        {orderLabel}: <span className="tabular font-mono text-text">{orderId}</span>
      </p>
      {children}
    </section>
  );
}
