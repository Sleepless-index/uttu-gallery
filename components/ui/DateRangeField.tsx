"use client";

import { useEffect, useRef, useState } from "react";
import { daysBetween } from "@/lib/calculations/cleardrops";

interface DateRangeFieldProps {
  label: string;
  startDate: string;
  endDate: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
}

function parseDate(iso: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatShort(iso: string): string {
  const d = parseDate(iso);
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatRangeLabel(startDate: string, endDate: string): string {
  if (!startDate && !endDate) return "Select dates";
  if (!endDate) return `${formatShort(startDate)} – …`;
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) return "Select dates";
  const year = end.getFullYear();
  return `${formatShort(startDate)} – ${formatShort(endDate)}, ${year}`;
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function CalendarMonth({
  monthDate,
  startDate,
  endDate,
  onPick,
}: {
  monthDate: Date;
  startDate: string;
  endDate: string;
  onPick: (iso: string) => void;
}) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  return (
    <div className="flex flex-col gap-2">
      <span className="text-center text-sm font-medium text-[var(--color-text)]">
        {monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </span>
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((w, i) => (
          <span
            key={i}
            className="flex h-6 items-center justify-center text-[0.625rem] text-[var(--color-text-faint)]"
          >
            {w}
          </span>
        ))}
        {cells.map((date, i) => {
          if (!date) return <span key={i} />;
          const iso = toIso(date);
          const isStart = iso === startDate;
          const isEnd = iso === endDate;
          const inRange =
            startDate && endDate && iso > startDate && iso < endDate;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onPick(iso)}
              className={`flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors
                ${
                  isStart || isEnd
                    ? "bg-[var(--color-accent)] font-semibold text-white"
                    : inRange
                      ? "bg-[var(--color-accent-dim)] text-[var(--color-accent-hover)]"
                      : "text-[var(--color-text-dim)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DateRangeField({
  label,
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}: DateRangeFieldProps) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => parseDate(startDate) ?? new Date());
  const [pickingStart, setPickingStart] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  const days = daysBetween(startDate, endDate);
  const weeks = Math.round((days / 7) * 10) / 10;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function handlePick(iso: string) {
    if (pickingStart) {
      onStartChange(iso);
      onEndChange("");
      setPickingStart(false);
      return;
    }
    if (iso < startDate) {
      onEndChange(startDate);
      onStartChange(iso);
    } else {
      onEndChange(iso);
    }
    setPickingStart(true);
  }

  function shiftMonth(delta: number) {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  return (
    <div className="flex flex-col gap-1.5" ref={ref}>
      <span className="text-xs font-medium text-[var(--color-text-dim)]">
        {label}
      </span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`flex h-11 items-center gap-2.5 rounded-xl border bg-[var(--color-surface)] px-4 text-[0.9rem] font-medium text-[var(--color-text)] outline-none transition-all duration-150
            ${
              open
                ? "border-[var(--color-accent)] shadow-[0_0_0_4px_var(--color-accent-dim)]"
                : "border-[var(--color-border)] shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:border-[var(--color-border-strong)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.24)]"
            }`}
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[var(--color-text-faint)]">
            <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M2.5 6.5H13.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5.5 2V4.5M10.5 2V4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span>{formatRangeLabel(startDate, endDate)}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={`shrink-0 text-[var(--color-text-faint)] transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          >
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && (
          <div className="animate-[popover-in_0.15s_ease] absolute left-0 top-[calc(100%+6px)] z-50 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3 shadow-[0_12px_30px_rgba(0,0,0,0.35)] origin-top">
            <div className="mb-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-text-faint)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                aria-label="Previous month"
              >
                ‹
              </button>
              <span className="text-xs text-[var(--color-text-faint)]">
                {pickingStart ? "Pick a start date" : "Pick an end date"}
              </span>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-text-faint)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                aria-label="Next month"
              >
                ›
              </button>
            </div>
            <CalendarMonth
              monthDate={viewMonth}
              startDate={startDate}
              endDate={endDate}
              onPick={handlePick}
            />
            <div className="mt-2 flex items-center justify-between border-t border-[var(--color-border)] pt-2">
              <span className="text-[0.625rem] text-[var(--color-text-faint)]">
                {days > 0 ? `${days} days (≈ ${weeks} wk)` : "Pick both dates"}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md bg-[var(--color-accent)] px-2.5 py-1 text-xs font-medium text-white"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
