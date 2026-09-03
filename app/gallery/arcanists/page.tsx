"use client";

import { useMemo, useState } from "react";
import { visibleRoster } from "@/lib/data/roster";
import { useTrackerState } from "@/lib/hooks/useTrackerState";
import { compareVersionDesc } from "@/lib/version";
import { FilterBar } from "@/components/arcanists/FilterBar";
import { CharacterCard } from "@/components/arcanists/CharacterCard";
import type { Afflatus, RarityFilter } from "@/lib/types";

export default function ArcanistsPage() {
  const { state, hydrated, getProgress } = useTrackerState();

  const [rarity, setRarity] = useState<RarityFilter>("all");
  const [afflatus, setAfflatus] = useState<Afflatus | "all">("all");
  const [showI2Art, setShowI2Art] = useState(false);

  const filtered = useMemo(() => {
    const result = visibleRoster(state.settings.hideCn).filter((c) => {
      if (rarity !== "all" && c.rarity !== rarity) return false;
      if (afflatus !== "all" && c.afflatus !== afflatus) return false;
      return true;
    });

    return [...result].sort((a, b) => b.rarity - a.rarity || compareVersionDesc(a.version, b.version));
  }, [rarity, afflatus, state.settings.hideCn]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <span className="text-[0.75rem] text-[var(--color-text-faint)]">Loading…</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[0.8rem] font-medium text-[var(--color-text-dim)]">
            Showing {filtered.length} arcanist{filtered.length === 1 ? "" : "s"}
          </h2>

          <div className="ml-auto">
            <FilterBar
              rarity={rarity}
              onRarityChange={setRarity}
              afflatus={afflatus}
              onAfflatusChange={setAfflatus}
              showI2Art={showI2Art}
              onToggleI2Art={() => setShowI2Art((v) => !v)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="py-16 text-center text-[0.8rem] text-[var(--color-text-faint)]">
            No arcanists match your filters.
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:gap-4 sm:grid-cols-4 md:grid-cols-5 lg:[grid-template-columns:repeat(auto-fill,minmax(140px,1fr))]">
            {filtered.map((c, i) => (
              <CharacterCard
                key={c.id}
                character={c}
                progress={getProgress(c.id)}
                showI2Art={showI2Art}
                priority={i < 12}
                galleryMode
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
