"use client";

import { useEffect, useState } from "react";

const PATCH_END = "2026-11-05T00:00:00-08:00";
const PATCH_END_CONFIRMED = true;

function daysRemaining(): number {
  const end = new Date(PATCH_END).getTime();
  const now = Date.now();
  const diff = end - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function PatchCountdown() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(daysRemaining());
    const interval = setInterval(() => setDays(daysRemaining()), 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (days === null) {
    return <div className="h-[2.375rem] sm:h-[2.875rem]" />;
  }

  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-sans text-[1.5rem] font-bold tabular-nums text-[var(--color-text)] sm:text-[1.9rem]">
        {days}
      </span>
      <span className="text-[0.75rem] font-medium text-[var(--color-text-dim)] sm:text-[0.85rem]">
        {days === 1 ? "day" : "days"}
      </span>
      {!PATCH_END_CONFIRMED && (
        <span className="text-[0.6rem] text-[var(--color-text-faint)]">(projected)</span>
      )}
    </div>
  );
}
