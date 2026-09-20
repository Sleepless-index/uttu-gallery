"use client";

import { useEffect, useRef } from "react";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";

interface ConfirmDialogProps {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button red instead of the default accent color —
   * use for destructive actions (resets, deletes). */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** App-styled stand-in for window.confirm(). Renders as a centered card
 * matching the other modals (PfpPickerModal, CharacterPickerModal, etc.)
 * instead of the browser's native dialog, which shows the raw page URL
 * and can't be restyled. See useConfirm() below for the usual way to
 * trigger one from an event handler. */
export function ConfirmDialog({
  title,
  description,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useBodyScrollLock();
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[0.95rem] font-semibold text-[var(--color-text)]">{title}</h2>
        {description && (
          <p className="mt-2 text-[0.78rem] leading-relaxed text-[var(--color-text-faint)]">{description}</p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-[0.78rem] font-medium text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-3.5 py-2 text-[0.78rem] font-medium text-white transition-colors ${
              danger
                ? "bg-[var(--color-danger)] hover:brightness-110"
                : "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
