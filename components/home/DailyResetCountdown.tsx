"use client";

import { useEffect, useState } from "react";
import { FlipNumber } from "@/components/home/FlipNumber";

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
 * Each pair of digits renders as a boxed flip-clock style FlipNumber, using
 * the app's normal sans-serif font (not the date badge's display serif). */
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
    <div className="flex flex-col items-center gap-2">
      <span className="text-[0.7rem] font-medium uppercase tracking-wide text-[var(--color-text-faint)]">
        Daily reset in
      </span>
      <div className="flex items-center gap-2">
        <FlipNumber value={h} />
        <span className="pb-1 text-[1.3rem] font-semibold text-[var(--color-text-faint)]">:</span>
        <FlipNumber value={m} />
        <span className="pb-1 text-[1.3rem] font-semibold text-[var(--color-text-faint)]">:</span>
        <FlipNumber value={s} />
      </div>
    </div>
  );
}
