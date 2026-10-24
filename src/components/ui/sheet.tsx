"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { clsx } from "clsx";

/**
 * A modal panel built on the native <dialog>. The parent owns `open`; Escape,
 * a click on the backdrop and the browser's own close all route through
 * onClose, so the parent state never drifts from what is on screen.
 */
export function Sheet({
  open,
  onClose,
  label,
  side = "right",
  variant = "sheet",
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  side?: "left" | "right";
  variant?: "sheet" | "palette";
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      data-side={side}
      className={clsx(variant, className)}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={() => {
        if (open) onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </dialog>
  );
}
