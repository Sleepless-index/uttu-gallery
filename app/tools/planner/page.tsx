"use client";

import { PlannerView } from "@/components/planner/PlannerView";

export default function PlannerPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <PlannerView />
      </main>
    </div>
  );
}
