"use client";

import { CleardropsView } from "@/components/cleardrops/CleardropsView";

export default function CleardropsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <CleardropsView />
      </main>
    </div>
  );
}
