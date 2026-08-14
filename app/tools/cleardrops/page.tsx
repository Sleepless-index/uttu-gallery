"use client";

import { CleardropsView } from "@/components/cleardrops/CleardropsView";

export default function CleardropsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <CleardropsView />
      </main>
    </div>
  );
}
