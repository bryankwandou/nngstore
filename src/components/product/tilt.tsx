"use client";

import { useRef, type ReactNode } from "react";

/**
 * A card element that tracks the pointer and exposes the tilt as CSS custom
 * properties (--rx, --ry). Children opt in with the `tilt-target` class. The
 * handlers live on the card itself because a stretched link covers the cover
 * image, so a wrapper around the image would never receive pointer events.
 * At most 4 degrees, fine pointers only, nothing under reduced motion.
 */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const frame = useRef(0);

  function onMove(e: React.PointerEvent<HTMLElement>) {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = el.querySelector<HTMLElement>(".tilt-target");
    if (!target) return;
    const r = target.getBoundingClientRect();
    const x = Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5));
    const y = Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5));
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--ry", `${(x * 8).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
    });
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
  }

  return (
    <article ref={ref} className={className} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </article>
  );
}
