"use client";

import { DateBadge } from "@/components/layout/DateBadge";
import { DailyResetCountdown } from "@/components/home/DailyResetCountdown";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-[var(--color-bg)] px-4 pb-10 pt-12">
      <div className="flex w-full max-w-md flex-col items-center">
        <DateBadge scale={2.2} />

        <div className="mt-6">
          <DailyResetCountdown />
        </div>
      </div>
    </div>
  );
}
