"use client";

interface CheckToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  valueLabel?: string;
}

export function CheckToggle({
  label,
  description,
  checked,
  onChange,
  valueLabel,
}: CheckToggleProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        className="flex items-center gap-2.5 text-left"
      >
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs transition-colors
            ${
              checked
                ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                : "border-[var(--color-border-strong)] bg-[var(--color-surface)] text-transparent"
            }`}
        >
          ✓
        </span>
        <div className="flex flex-col">
          <span
            className={`text-sm font-medium ${checked ? "text-[var(--color-text)]" : "text-[var(--color-text-dim)]"}`}
          >
            {label}
          </span>
          {description && (
            <span className="text-xs text-[var(--color-text-faint)]">
              {description}
            </span>
          )}
        </div>
      </button>
      {valueLabel && (
        <span className="shrink-0 font-mono text-xs font-semibold text-[var(--color-text-dim)]">
          {valueLabel}
        </span>
      )}
    </div>
  );
}
