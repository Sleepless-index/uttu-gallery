"use client";

import { useEffect, useState } from "react";
import { FlipNumber } from "@/components/home/FlipNumber";

const PATCH_END = "2026-11-05T00:00:00-08:00";
const PATCH_END_CONFIRMED = false;

function patchRemaining(): { d: string; h: string; m: string } {
  const diff = Math.max(0, new Date(PATCH_END).getTime() - Date.now());
  const totalMinutes = Math.floor(diff / (1000 * 60));
  const d = Math.floor(totalMinutes / (60 * 24));
  const h = Math.floor((totalMinutes % (60 * 24)) / 60);
  const m = totalMinutes % 60;
  return {
    d: String(d).padStart(2, "0"),
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
  };
}

export function PatchCountdown() {
  const [remaining, setRemaining] = useState<{ d: string; h: string; m: string } | null>(null);

  useEffect(() => {
    setRemaining(patchRemaining());
    const interval = setInterval(() => setRemaining(patchRemaining()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (remaining === null) {
    return <div className="h-[5.4rem] sm:h-[6.15rem]" />;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[0.7rem] font-medium uppercase tracking-wide text-[var(--color-text-faint)]">
        Patch ends in{!PATCH_END_CONFIRMED && " (projected)"}
      </span>
      <div className="flex items-start gap-[1.1rem]">
        <div className="flex flex-col items-center gap-1.5">
          <FlipNumber value={remaining.d} />
          <span className="text-[0.62rem] font-semibold tracking-wide text-[var(--color-text-faint)]">DAY</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <FlipNumber value={remaining.h} />
          <span className="text-[0.62rem] font-semibold tracking-wide text-[var(--color-text-faint)]">HOUR</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <FlipNumber value={remaining.m} />
          <span className="text-[0.62rem] font-semibold tracking-wide text-[var(--color-text-faint)]">MIN</span>
        </div>
      </div>
    </div>
  );
}


