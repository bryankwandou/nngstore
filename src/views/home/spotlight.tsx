"use client";

import type { ReactNode } from "react";

/**
 * Event delegation for the spotlight tiles: one listener on the grid moves a
 * soft radial highlight (drawn in CSS by `.spot::before`) under a mouse
 * pointer. Touch and pen never set it, so tiles stay flat there.
 */
export function SpotlightGrid({ children, className }: { children: ReactNode; className?: string }) {
  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const tile = (e.target as HTMLElement).closest<HTMLElement>("[data-spot]");
    if (!tile) return;
    const r = tile.getBoundingClientRect();
    tile.style.setProperty("--mx", `${e.clientX - r.left}px`);
    tile.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <div className={className} onPointerMove={onMove}>
      {children}
    </div>
  );
}
