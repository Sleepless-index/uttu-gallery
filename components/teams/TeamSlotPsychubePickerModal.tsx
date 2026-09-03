"use client";

import { useMemo, useState } from "react";
import { visiblePsychubes } from "@/lib/data/psychubes";
import { useTrackerState } from "@/lib/hooks/useTrackerState";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";
import { PsychubePickerTile } from "@/components/psychubes/PsychubePickerTile";
import type { PsychubeProgress } from "@/lib/types";

interface TeamSlotPsychubePickerModalProps {
  /** The character in this slot, used to compute "Recommended" sorting. */
  characterId: number;
  ownedPsychubes: Record<number, PsychubeProgress>;
  /** Psychube ids already equipped on OTHER slots in this same team — shown disabled. */
  disabledIds: Set<number>;
  currentPsychubeId?: number;
  onClose: () => void;
  onPick: (psychubeId: number | null) => void;
}

function IconClose() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function TeamSlotPsychubePickerModal({
  characterId,
  ownedPsychubes,
  disabledIds,
  currentPsychubeId,
  onClose,
  onPick,
}: TeamSlotPsychubePickerModalProps) {
  useBodyScrollLock();
  const [search, setSearch] = useState("");
  const { state } = useTrackerState();

  const owned = useMemo(
    () => visiblePsychubes(state.settings.hideCn).filter((p) => ownedPsychubes[p.id]),
    [ownedPsychubes, state.settings.hideCn]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return owned
      .filter((p) => !q || p.name.toLowerCase().includes(q))
      .sort((a, b) => {
        const aRec = a.characterIds?.includes(characterId) ? 1 : 0;
        const bRec = b.characterIds?.includes(characterId) ? 1 : 0;
        if (aRec !== bRec) return bRec - aRec;
        return b.rarity - a.rarity || b.id - a.id;
      });
  }, [owned, search, characterId]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Choose a Psychube"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="text-[0.95rem] font-semibold text-[var(--color-text)]">Choose a Psychube</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          >
            <IconClose />
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-2 px-5 py-3">
          <div className="relative w-40 shrink-0 sm:w-56">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]">
              <IconSearch />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search your psychubes…"
              className="w-full min-w-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-8 pr-3 text-[0.78rem] text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-faint)]"
            />
          </div>
          {currentPsychubeId != null && (
            <button
              type="button"
              onClick={() => onPick(null)}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[0.75rem] font-medium text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
            >
              Unequip
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-[0.8rem] text-[var(--color-text-faint)]">
              {owned.length === 0 ? "You haven't added any psychubes yet." : "No psychubes match your search."}
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7">
              {filtered.map((p) => (
                <PsychubePickerTile
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  rarity={p.rarity}
                  recommended={p.characterIds?.includes(characterId)}
                  disabled={disabledIds.has(p.id)}
                  selected={p.id === currentPsychubeId}
                  onToggle={() => onPick(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
