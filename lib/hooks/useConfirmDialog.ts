"use client";

import { useCallback, useState } from "react";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface PendingConfirm extends ConfirmOptions {
  onConfirm: () => void;
}

/** Pairs with <ConfirmDialog>: call `requestConfirm({ title, ... }, () =>
 * doTheThing())` from a click handler, then render `dialog &&
 * <ConfirmDialog {...dialog} onConfirm={...} onCancel={...} />` once in
 * the component. Replaces window.confirm(...) callers one-for-one. */
export function useConfirmDialog() {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const requestConfirm = useCallback((options: ConfirmOptions, onConfirm: () => void) => {
    setPending({ ...options, onConfirm });
  }, []);

  const dialogProps = pending
    ? {
        title: pending.title,
        description: pending.description,
        confirmLabel: pending.confirmLabel,
        cancelLabel: pending.cancelLabel,
        danger: pending.danger,
        onConfirm: () => {
          pending.onConfirm();
          setPending(null);
        },
        onCancel: () => setPending(null),
      }
    : null;

  return { requestConfirm, dialogProps };
}
