"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export type NavItem = { href: string; label: string };

/** Primary navigation. The current section is marked for sight and for screen readers. */
export function NavLinks({ items, className }: { items: NavItem[]; className?: string }) {
  const pathname = usePathname() || "/";
  return (
    <ul className={clsx("flex items-center gap-1", className)}>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "relative inline-flex h-10 items-center rounded-full px-3.5 text-sm transition-colors duration-200",
                active ? "text-text" : "text-muted hover:text-text",
              )}
            >
              {item.label}
              <span
                aria-hidden
                className={clsx(
                  "absolute inset-x-3.5 -bottom-px h-px origin-center bg-brand transition-transform duration-300 ease-out",
                  active ? "scale-x-100" : "scale-x-0",
                )}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
