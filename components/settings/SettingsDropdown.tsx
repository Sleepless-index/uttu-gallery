"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const PANEL_WIDTH = 256; // matches w-64
const VIEWPORT_MARGIN = 12;

/** A dropdown rather than a modal — there's currently just the one Hide CN
 * toggle, so a full-screen dialog is more ceremony than the content needs.
 *
 * The panel is rendered via a portal into document.body rather than as a
 * normal DOM child. Both places this mounts (the mobile top bar and the
 * desktop sidebar rail) have `overflow-hidden` on an ancestor for
 * unrelated reasons (truncating the date badge, clipping the rail's
 * rounded corners) — a normally-nested absolutely-positioned panel gets
 * silently clipped by that, which is what made it invisible on mobile and
 * appear to misbehave on desktop. Portaling escapes that entirely; the
 * panel's screen position is computed from the trigger button's own
 * bounding rect instead of relying on CSS positioning context. */
export function SettingsDropdown({ iconOnly = true, className = "" }: SettingsDropdownProps) {
  const { state, updateSettings } = useTrackerState();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function computeCoords() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Anchor to the trigger's right edge, growing left, then clamp so the
    // panel never runs off either side of the viewport regardless of
    // where the trigger sits (mobile top-right, desktop rail at various
    // widths when expanded/collapsed).
    let left = rect.right - PANEL_WIDTH;
    left = Math.max(VIEWPORT_MARGIN, Math.min(left, window.innerWidth - PANEL_WIDTH - VIEWPORT_MARGIN));
    setCoords({ top: rect.bottom + 6, left });
  }

  useEffect(() => {
    if (!open) return;
    computeCoords();
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    // Recompute on resize/scroll so the panel tracks the trigger — the
    // trigger's ancestors include a fixed-position rail and a scrollable
    // page, either of which can move it after the initial open.
    window.addEventListener("resize", computeCoords);
    window.addEventListener("scroll", computeCoords, true);
    document.addEventListener("mousedown", handleClick);
    return () => {
      window.removeEventListener("resize", computeCoords);
      window.removeEventListener("scroll", computeCoords, true);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Settings"
        aria-expanded={open}
        className={`flex items-center gap-2.5 rounded-lg text-[var(--color-text-dim)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] ${
          iconOnly ? "h-8 w-8 justify-center" : "w-full px-2.5 py-2 text-[0.8rem] font-medium"
        } ${className}`}
      >
        <span className={iconOnly ? "flex h-full w-full items-center justify-center" : "flex h-5 w-5 shrink-0 items-center justify-center"}>
          <IconSettings />
        </span>
        {!iconOnly && <span className="truncate">Settings</span>}
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "fixed", top: coords.top, left: coords.left, width: PANEL_WIDTH }}
            className="z-[70] overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] shadow-xl"
          >
            <div className="flex items-center justify-between gap-3 px-3.5 py-3">
              <span className="text-[0.8rem] font-medium text-[var(--color-text)]">Hide CN content</span>
              <Toggle checked={state.settings.hideCn} onChange={(next) => updateSettings({ hideCn: next })} />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
