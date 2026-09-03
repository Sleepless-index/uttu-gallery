"use client";

import { useTrackerState } from "@/lib/hooks/useTrackerState";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";

interface SettingsModalProps {
  onClose: () => void;
}

function IconClose() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

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

export function SettingsModal({ onClose }: SettingsModalProps) {
  useBodyScrollLock();
  const { state, updateSettings } = useTrackerState();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <h2 className="text-[0.95rem] font-semibold text-[var(--color-text)]">Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          >
            <IconClose />
          </button>
        </div>

        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[0.85rem] font-medium text-[var(--color-text)]">Hide CN content</span>
            <Toggle
              checked={state.settings.hideCn}
              onChange={(next) => updateSettings({ hideCn: next })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
