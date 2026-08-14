"use client";

import { useMemo, useState } from "react";
import { roster } from "@/lib/data/roster";
import { useTrackerState } from "@/lib/hooks/useTrackerState";
import { FilterBar } from "@/components/arcanists/FilterBar";
import { CharacterCard } from "@/components/arcanists/CharacterCard";
import type { Afflatus, RarityFilter, OwnedFilter, SortOrder } from "@/lib/types";

export default function ArcanistsPage() {
  const { state, hydrated, stats, getProgress } = useTrackerState();

  const [rarity, setRarity] = useState<RarityFilter>("all");
  const [afflatus, setAfflatus] = useState<Afflatus | "all">("all");
  const [owned, setOwned] = useState<OwnedFilter>("all");
  const [sort, setSort] = useState<SortOrder>("default");
  const [showI2Art, setShowI2Art] = useState(false);

  const filtered = useMemo(() => {
    const result = roster.filter((c) => {
      if (rarity !== "all" && c.rarity !== rarity) return false;
      if (afflatus !== "all" && c.afflatus !== afflatus) return false;

      const p = state.progress[c.id];
      if (owned === "owned" && !p?.owned) return false;
      if (owned === "unowned" && p?.owned) return false;

      return true;
    });

    switch (sort) {
      case "rarity-desc":
        return [...result].sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name));
      case "rarity-asc":
        return [...result].sort((a, b) => a.rarity - b.rarity || a.name.localeCompare(b.name));
      case "name-asc":
        return [...result].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return [...result].sort((a, b) => b.rarity - a.rarity || b.id - a.id);
    }
  }, [rarity, afflatus, owned, sort, state]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <span className="text-[0.75rem] text-[var(--color-text-faint)]">Loading…</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[0.8rem] font-medium text-[var(--color-text-dim)]">
            Showing {filtered.length} arcanist{filtered.length === 1 ? "" : "s"}
            <span className="ml-3 text-[var(--color-text-faint)]">
              {stats.owned}/{stats.total} filed
            </span>
          </h2>

          <FilterBar
            rarity={rarity}
            onRarityChange={setRarity}
            afflatus={afflatus}
            onAfflatusChange={setAfflatus}
            status={owned}
            onStatusChange={setOwned}
            sort={sort}
            onSortChange={setSort}
            showI2Art={showI2Art}
            onToggleI2Art={() => setShowI2Art((v) => !v)}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="py-16 text-center text-[0.8rem] text-[var(--color-text-faint)]">
            No arcanists match your filters.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:[grid-template-columns:repeat(auto-fill,minmax(140px,1fr))]">
            {filtered.map((c, i) => (
              <CharacterCard
                key={c.id}
                character={c}
                progress={getProgress(c.id)}
                showI2Art={showI2Art}
                priority={i < 12}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
