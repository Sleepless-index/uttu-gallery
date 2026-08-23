"use client";

import { PlannerView } from "@/components/planner/PlannerView";

export default function PlannerPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <PlannerView />
      </main>
    </div>
  );
}
