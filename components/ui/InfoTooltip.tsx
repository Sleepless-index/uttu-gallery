"use client";

import { useEffect, useRef, useState } from "react";

interface InfoTooltipProps {
  children: React.ReactNode;
}

export function InfoTooltip({ children }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        aria-label="More info"
        aria-expanded={open}
        className={`flex h-4 w-4 items-center justify-center rounded-full border text-[0.55rem] font-semibold transition-colors
          ${
            open
              ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
              : "border-[var(--color-border-strong)] text-[var(--color-text-faint)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
          }`}
      >
        i
      </button>
      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute left-0 top-[calc(100%+6px)] z-50 w-56 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-3 text-xs leading-relaxed text-[var(--color-text-dim)] shadow-xl"
        >
          {children}
        </div>
      )}
    </div>
  );
}
