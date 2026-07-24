"use client";

import { useEffect, useState } from "react";

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
  // The input's raw typed text is tracked separately from `value`. When this
  // was just `value={value}` on the <input>, typing "5" over a displayed "0"
  // sent the browser's raw string ("05") through Number(), which correctly
  // parsed to 5 — but React saw the *previous* number render as unchanged in
  // some cases and didn't reconcile the DOM string, leaving stray leading
  // digits like "01237" behind. Keeping the field's displayed text as its
  // own state means every keystroke fully replaces what's on screen.
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  function commit(raw: string) {
    const n = Number(raw);
    if (raw.trim() === "" || Number.isNaN(n)) {
      setText(String(value));
      return;
    }
    const clamped = max !== undefined ? Math.min(max, Math.max(min, n)) : Math.max(min, n);
    onChange(clamped);
    setText(String(clamped));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[var(--color-text-dim)]">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={text}
          min={min}
          max={max}
          onChange={(e) => setText(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          onFocus={(e) => e.currentTarget.select()}
          className="w-24 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
        />
        {suffix && (
          <span className="text-xs text-[var(--color-text-faint)]">{suffix}</span>
        )}
      </div>
    </div>
  );
}
