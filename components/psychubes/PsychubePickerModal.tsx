"use client";

import { useMemo, useState } from "react";
import { visiblePsychubes } from "@/lib/data/psychubes";
import { useTrackerState } from "@/lib/hooks/useTrackerState";
import type { RarityFilter } from "@/lib/types";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";
import { PsychubePickerTile } from "@/components/psychubes/PsychubePickerTile";

interface PsychubePickerModalProps {
  selectedIds: Set<number>;
  onClose: () => void;
  onDone: (ids: Set<number>) => void;
}

const RARITY_LABEL: Record<string, string> = {
  all: "All rarities",
  "5": "5★",
  "4": "4★",
  "3": "3★",
  "2": "2★",
};

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PsychubePickerModal({ selectedIds, onClose, onDone }: PsychubePickerModalProps) {
  useBodyScrollLock();
  const [draft, setDraft] = useState<Set<number>>(() => new Set(selectedIds));
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState<RarityFilter>("all");
  const { state } = useTrackerState();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return visiblePsychubes(state.settings.hideCn)
      .filter((p) => {
        if (q && !p.name.toLowerCase().includes(q)) return false;
        if (rarity !== "all" && p.rarity !== rarity) return false;
        return true;
      })
      .sort((a, b) => b.rarity - a.rarity || b.id - a.id);
  }, [search, rarity, state.settings.hideCn]);

  function toggle(id: number) {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Add Psychubes">
      <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-2xl">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <h2 className="text-[0.95rem] font-semibold text-[var(--color-text)]">Add Psychubes</h2>
            <p className="text-[0.72rem] text-[var(--color-text-faint)]">{draft.size} selected</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          >
            <IconClose />
          </button>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 px-5 py-3">
          <div className="relative w-40 shrink-0 sm:w-44">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]">
              <IconSearch />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search psychubes…"
              className="w-full min-w-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-8 pr-3 text-[0.78rem] text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-faint)]"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {(["all", 5, 4, 3, 2] as RarityFilter[]).map((key) => (
              <button
                key={String(key)}
                onClick={() => setRarity(key)}
                className={`rounded-lg px-2.5 py-1.5 text-[0.72rem] font-medium transition-colors
                  ${rarity === key ? "bg-[var(--color-accent)] text-white" : "bg-[var(--color-surface)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"}`}
              >
                {RARITY_LABEL[String(key)]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-[0.8rem] text-[var(--color-text-faint)]">No psychubes match your filters.</p>
          ) : (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7">
              {filtered.map((p) => (
                <PsychubePickerTile
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  rarity={p.rarity}
                  selected={draft.has(p.id)}
                  onToggle={() => toggle(p.id)}
                />
              ))}
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
            onClick={() => onDone(draft)}
            className="rounded-lg bg-[var(--color-accent)] px-5 py-2 text-[0.78rem] font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
