"use client";

import { useMemo, useState } from "react";
import { roster } from "@/lib/data/roster";
import { useTrackerState } from "@/lib/hooks/useTrackerState";
import { AppHeader } from "@/components/layout/AppHeader";
import { FilterBar } from "@/components/arcanists/FilterBar";
import { CharacterCard } from "@/components/arcanists/CharacterCard";
import { EditModal } from "@/components/arcanists/EditModal";
import { GarmentsView } from "@/components/garments/GarmentsView";
import type { Afflatus, RarityFilter, OwnedFilter, SortOrder } from "@/lib/types";

type PageTab = "arcanists" | "garments";

const PAGE_TABS: { key: PageTab; label: string }[] = [
  { key: "arcanists", label: "Characters" },
  { key: "garments", label: "Garments" },
];

export default function Home() {
  const {
    state,
    hydrated,
    stats,
    getProgress,
    updateProgress,
    toggleWishlist,
    resetAll,
  } = useTrackerState();

  const [pageTab, setPageTab] = useState<PageTab>("arcanists");
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState<RarityFilter>("all");
  const [afflatus, setAfflatus] = useState<Afflatus | "all">("all");
  const [owned, setOwned] = useState<OwnedFilter>("all");
  const [sort, setSort] = useState<SortOrder>("default");
  const [editMode, setEditMode] = useState(false);
  const [showI2Art, setShowI2Art] = useState(false);
  const [openCharacterId, setOpenCharacterId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = roster.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q)) return false;
      if (rarity !== "all" && c.rarity !== rarity) return false;
      if (afflatus !== "all" && c.afflatus !== afflatus) return false;

      const p = state.progress[c.id];
      if (owned === "owned" && !p?.owned) return false;
      if (owned === "unowned" && p?.owned) return false;
      if (owned === "wishlist" && !state.wishlist.includes(c.id)) return false;

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
  }, [search, rarity, afflatus, owned, sort, state]);

  const openCharacter = roster.find((c) => c.id === openCharacterId) ?? null;
  const openProgress = openCharacterId != null ? getProgress(openCharacterId) : null;

  function handleReset() {
    if (confirm("Clear all tracked data and reset the dashboard? This can't be undone.")) {
      resetAll();
    }
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <span className="text-[0.75rem] text-[var(--color-text-faint)]">Loading…</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      {/* Edit mode indicator strip — persistent, unmistakable */}
      {editMode && (
        <div className="flex h-8 items-center justify-center gap-2 bg-[var(--color-accent)]">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          <span className="text-[0.72rem] font-semibold uppercase tracking-wide text-white">
            Edit mode — click any arcanist to update progress
          </span>
        </div>
      )}

      {/* Header */}
      <AppHeader
        rightSlot={
          <span className="text-[0.75rem] text-[var(--color-text-dim)]">
            {stats.owned}/{stats.total} filed
          </span>
        }
        subTabs={PAGE_TABS.map((t) => ({ key: t.key, label: t.label }))}
        activeSubTab={pageTab}
        onSubTabChange={(key) => setPageTab(key as PageTab)}
      />

      <main className="flex-1 overflow-y-auto px-6 py-8">
        {pageTab === "arcanists" ? (
          <>
            {/* Grid header — inline filter row, matching Garments */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[0.8rem] font-medium text-[var(--color-text-dim)]">
                Showing {filtered.length} arcanist{filtered.length === 1 ? "" : "s"}
              </h2>

              <FilterBar
                search={search}
                onSearchChange={setSearch}
                rarity={rarity}
                onRarityChange={setRarity}
                afflatus={afflatus}
                onAfflatusChange={setAfflatus}
                status={owned}
                onStatusChange={setOwned}
                sort={sort}
                onSortChange={setSort}
                editMode={editMode}
                onToggleEditMode={() => setEditMode((v) => !v)}
                onReset={handleReset}
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
                    editMode={editMode}
                    onOpen={setOpenCharacterId}
                    wishlisted={state.wishlist.includes(c.id)}
                    showI2Art={showI2Art}
                    priority={i < 12}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <GarmentsView />
        )}
      </main>

      <EditModal
        character={openCharacter}
        progress={openProgress}
        onClose={() => setOpenCharacterId(null)}
        onUpdateProgress={updateProgress}
        onToggleWishlist={toggleWishlist}
        wishlisted={openCharacterId != null && state.wishlist.includes(openCharacterId)}
        editable={editMode}
        showI2Art={showI2Art}
      />
    </div>
  );
}
