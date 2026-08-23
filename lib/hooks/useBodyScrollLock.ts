"use client";

import { useEffect } from "react";

/**
 * Locks page scroll for as long as the calling component is mounted —
 * intended for modals/overlays so the page behind them can't be scrolled.
 * Restores the previous overflow value on unmount.
 */
export function useBodyScrollLock() {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);
}
