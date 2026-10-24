import Link from "next/link";
import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none " +
  "transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out " +
  "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-brand-contrast shadow-sm hover:bg-brand-strong hover:shadow-md",
  secondary:
    "bg-surface text-text border border-line shadow-sm hover:border-line-strong hover:bg-surface-2",
  outline: "border border-line-strong text-text hover:bg-surface-2",
  ghost: "text-text hover:bg-surface-2",
};

/* Every size keeps a hit area of at least 40 px. */
const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-12 px-6 text-base",
};

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function buttonClass({
  variant = "primary",
  size = "md",
  className,
}: Omit<Common, "children">) {
  return clsx(base, variants[variant], sizes[size], className);
}

export function Button({
  variant,
  size,
  className,
  children,
  type = "button",
  ...rest
}: Common & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button type={type} className={buttonClass({ variant, size, className })} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  className,
  children,
  href,
  ...rest
}: Common & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link href={href} className={buttonClass({ variant, size, className })} {...rest}>
      {children}
    </Link>
  );
}
