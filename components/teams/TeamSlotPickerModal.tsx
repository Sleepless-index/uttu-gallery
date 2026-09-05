"use client";

import { useMemo, useState } from "react";
import { PickerCard } from "@/components/characters/PickerCard";
import { parseDisplayName } from "@/lib/data/roster";
import type { RosterCharacter } from "@/lib/types";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";

interface TeamSlotPickerModalProps {
  /** The user's owned characters to choose from. */
  characters: RosterCharacter[];
  /** Ids currently occupying this team's slots — shown pre-selected
   * (not disabled), since deselecting one is how a slot gets freed up to
   * pick someone new into. */
  currentIds: number[];
  /** Total slots in the team — selection is capped here. */
  teamSize: number;
  onClose: () => void;
  /** Called once with the final full selection, in pick order (existing
   * members keep their relative order from `currentIds`, newly-added ones
   * appended after in the order they were picked). The caller reconciles
   * this against currentIds itself — removed ids vacate their slot, new
   * ids fill vacated/empty slots in order. */
  onConfirm: (characterIds: number[]) => void;
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

export function TeamSlotPickerModal({
  characters,
  currentIds,
  teamSize,
  onClose,
  onConfirm,
}: TeamSlotPickerModalProps) {
  useBodyScrollLock();
  const [search, setSearch] = useState("");
  // Seeded with the team's current occupants, pre-selected — order matters
  // (existing members first in their current order, newly-picked ones
  // appended after), since that order is what the caller uses to decide
  // which physical slot a newly-added character lands in.
  const [pickedOrder, setPickedOrder] = useState<number[]>(currentIds);
  const atCapacity = pickedOrder.length >= teamSize;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return characters
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .sort((a, b) => b.rarity - a.rarity || b.id - a.id);
  }, [characters, search]);

  function toggle(id: number) {
    setPickedOrder((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= teamSize) return prev; // at capacity, ignore new picks
      return [...prev, id];
    });
  }

  const hasChanges =
    pickedOrder.length !== currentIds.length || pickedOrder.some((id, i) => id !== currentIds[i]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Choose characters"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <h2 className="text-[0.95rem] font-semibold text-[var(--color-text)]">Choose Characters</h2>
            <p className="text-[0.72rem] text-[var(--color-text-faint)]">
              {pickedOrder.length} / {teamSize} selected
            </p>
          </div>
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
              placeholder="Search your characters…"
              className="w-full min-w-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-8 pr-3 text-[0.78rem] text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-faint)]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-[0.8rem] text-[var(--color-text-faint)]">
              {characters.length === 0
                ? "You haven't added any characters yet."
                : "No characters match your search."}
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7">
              {filtered.map((c) => {
                const pickIndex = pickedOrder.indexOf(c.id);
                const picked = pickIndex !== -1;
                // Disabled only when at capacity and this one isn't
                // already picked — picked ones (including current team
                // members) stay clickable so they can be deselected.
                const disabled = atCapacity && !picked;
                const displayName = parseDisplayName(c.name);
                return (
                  <PickerCard
                    key={c.id}
                    id={c.id}
                    name={displayName.text}
                    italic={displayName.italic}
                    rarity={c.rarity}
                    afflatus={c.afflatus}
                    disabled={disabled}
                    selected={picked}
                    selectedNumber={picked ? pickIndex + 1 : undefined}
                    onToggle={() => toggle(c.id)}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[var(--color-border)] px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-[0.78rem] font-medium text-[var(--color-text-dim)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(pickedOrder)}
            disabled={!hasChanges}
            className="rounded-lg bg-[var(--color-accent)] px-5 py-2 text-[0.78rem] font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
