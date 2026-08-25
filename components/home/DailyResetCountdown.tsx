"use client";

import { useEffect, useState } from "react";

/** Reverse:1999's daily reset is 18:00 server time (UTC+8), which is a
 * fixed 10:00 UTC every day — using UTC directly here means this is
 * correct for every viewer regardless of their own timezone, with no
 * per-timezone conversion needed. */
const RESET_HOUR_UTC = 10;

function msUntilNextReset(from: Date): number {
  const next = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), RESET_HOUR_UTC, 0, 0, 0)
  );
  if (next.getTime() <= from.getTime()) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next.getTime() - from.getTime();
}

function formatDuration(ms: number): { h: string; m: string; s: string } {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return {
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
  };
}

/** "HH:MM:SS until daily reset" — ticks every second, always counting down
 * to the next reset boundary. Renders nothing until mounted so the
 * server-rendered markup never disagrees with the client's own clock.
 *
 * Styled to match the date badge's editorial-serif language: a delicate
 * italic label above oversized high-contrast serif numerals, rather than a
 * generic monospace timer readout. */
export function DailyResetCountdown() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    setRemaining(msUntilNextReset(new Date()));
    const id = setInterval(() => {
      setRemaining(msUntilNextReset(new Date()));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (remaining == null) return null;

  const { h, m, s } = formatDuration(remaining);

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="text-[0.8rem] italic tracking-[0.25em] text-[var(--color-text-faint)]"
        style={{ fontFamily: "var(--font-date-badge)", fontWeight: 300 }}
      >
        Daily reset in
      </span>
      <div
        className="flex items-baseline gap-[2px] font-extrabold tabular-nums text-[var(--color-text)]"
        style={{ fontFamily: "var(--font-date-badge)", fontSize: "2.1rem", lineHeight: 1 }}
      >
        <span>{h}</span>
        <span className="mx-0.5 text-[var(--color-accent)]">:</span>
        <span>{m}</span>
        <span className="mx-0.5 text-[var(--color-accent)]">:</span>
        <span>{s}</span>
      </div>
    </div>
  );
}
