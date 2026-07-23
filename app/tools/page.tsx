"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { CleardropsView } from "@/components/cleardrops/CleardropsView";
import { PlannerView } from "@/components/planner/PlannerView";

type Tab = "cleardrops" | "planner";

const TABS: { key: Tab; label: string }[] = [
  { key: "cleardrops", label: "Cleardrops" },
  { key: "planner", label: "Planner" },
];

export default function ToolsPage() {
  const [tab, setTab] = useState<Tab>("cleardrops");

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <AppHeader
        subTabs={TABS}
        activeSubTab={tab}
        onSubTabChange={(key) => setTab(key as Tab)}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        {tab === "cleardrops" ? <CleardropsView /> : <PlannerView />}
      </main>
    </div>
  );
}
