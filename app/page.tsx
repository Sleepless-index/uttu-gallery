"use client";

import { DateBadge } from "@/components/layout/DateBadge";
import { DailyResetCountdown } from "@/components/home/DailyResetCountdown";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-[var(--color-bg)] px-4 pb-10 pt-14">
      <div className="flex w-full max-w-md flex-col items-center">
        {/* Masthead rule */}
        <div className="h-px w-16 bg-[var(--color-accent)]" />

        {/* Kicker */}
        <p
          className="mt-4 text-[11px] uppercase tracking-[0.35em] text-[var(--color-text-faint)]"
          style={{ fontFamily: "var(--font-sans)", fontStyle: "italic" }}
        >
          Today&rsquo;s Reading
        </p>

        {/* Date */}
        <div className="mt-3">
          <DateBadge scale={2.2} />
        </div>

        {/* Countdown, set apart as a byline beneath the headline */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="h-px w-10 bg-[var(--color-border)]" />
          <DailyResetCountdown />
        </div>

        {/* Closing rule, mirrors the top to bracket the masthead */}
        <div className="mt-8 h-px w-16 bg-[var(--color-accent)]" />
      </div>
    </div>
  );
}
