"use client";

import { GarmentsView } from "@/components/garments/GarmentsView";

export default function GarmentsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
        <GarmentsView />
      </main>
    </div>
  );
}
