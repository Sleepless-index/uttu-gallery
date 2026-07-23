"use client";

import { useEffect, useRef, useState } from "react";

function IconChevron() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Generic dropdown shell: trigger button + panel, closes on outside click. */
export function Dropdown({
  label,
  icon,
  active,
  panelClassName,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  panelClassName?: string;
  children: (close: () => void) => React.ReactNode;
}) {
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
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[0.75rem] font-medium transition-colors
          ${
            active
              ? "border-[var(--color-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent-hover)]"
              : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-dim)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
          }`}
      >
        {icon}
        {label}
        <IconChevron />
      </button>
      {open && (
        <div
          className={`absolute top-[calc(100%+6px)] z-50 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] shadow-xl ${panelClassName ?? "left-0 w-48"}`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
