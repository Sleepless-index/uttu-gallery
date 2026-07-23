"use client";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}

export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
  suffix,
}: NumberFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[var(--color-text-dim)]">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isNaN(n)) return;
            const clamped = max !== undefined ? Math.min(max, Math.max(min, n)) : Math.max(min, n);
            onChange(clamped);
          }}
          className="w-24 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
        />
        {suffix && (
          <span className="text-xs text-[var(--color-text-faint)]">{suffix}</span>
        )}
      </div>
    </div>
  );
}
