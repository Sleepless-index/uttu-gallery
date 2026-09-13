"use client";

import { useEffect, useRef, useState } from "react";
import { useTrackerState } from "@/lib/hooks/useTrackerState";
import { IconSettings } from "@/components/layout/navIcons";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ${
        checked ? "justify-end bg-[var(--color-accent)]" : "justify-start bg-[var(--color-surface-hover)]"
      }`}
    >
      <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
    </button>
  );
}

interface SettingsDropdownProps {
  /** Renders just the icon button with no extra label — used in tight
   * spaces like the mobile top bar and the collapsed desktop rail. */
  iconOnly?: boolean;
  className?: string;
}

/** A dropdown rather than a modal — there's currently just the one Hide CN
 * toggle, so a full-screen dialog is more ceremony than the content needs.
 * Self-contained: owns its own open state and outside-click-to-close,
 * same pattern as components/ui/Dropdown.tsx, but with a bare icon
 * trigger instead of that component's labeled-pill button style. */
export function SettingsDropdown({ iconOnly = true, className = "" }: SettingsDropdownProps) {
  const { state, updateSettings } = useTrackerState();
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
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Settings"
        aria-expanded={open}
        className={`flex items-center gap-2.5 rounded-lg text-[var(--color-text-dim)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] ${
          iconOnly ? "h-8 w-8 justify-center" : "w-full px-2.5 py-2 text-[0.8rem] font-medium"
        }`}
      >
        <span className={iconOnly ? "flex h-full w-full items-center justify-center" : "flex h-5 w-5 shrink-0 items-center justify-center"}>
          <IconSettings />
        </span>
        {!iconOnly && <span className="truncate">Settings</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-64 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] shadow-xl">
          <div className="flex items-center justify-between gap-3 px-3.5 py-3">
            <span className="text-[0.8rem] font-medium text-[var(--color-text)]">Hide CN content</span>
            <Toggle checked={state.settings.hideCn} onChange={(next) => updateSettings({ hideCn: next })} />
          </div>
        </div>
      )}
    </div>
  );
}
