"use client";

import { useMemo, useState } from "react";
import { PickerCard } from "@/components/characters/PickerCard";
import { parseDisplayName } from "@/lib/data/roster";
import type { RosterCharacter } from "@/lib/types";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";

interface TeamSlotPickerModalProps {
  /** The user's owned characters to choose from. */
  characters: RosterCharacter[];
  /** Ids already placed in other slots of this team — shown but disabled,
   * since the same character can't fill two slots in one team. */
  disabledIds: Set<number>;
  onClose: () => void;
  onPick: (characterId: number) => void;
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
  disabledIds,
  onClose,
  onPick,
}: TeamSlotPickerModalProps) {
  useBodyScrollLock();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return characters
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .sort((a, b) => b.rarity - a.rarity || b.id - a.id);
  }, [characters, search]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Choose a character"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="text-[0.95rem] font-semibold text-[var(--color-text)]">Choose a Character</h2>
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
                const disabled = disabledIds.has(c.id);
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
                    onToggle={() => onPick(c.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
