"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { roster } from "@/lib/data/roster";
import { parseDisplayName } from "@/lib/data/roster";
import { afflatusIconPath, rarityPlatePath, characterArtPath } from "@/lib/assets/characterAssets";
import { AFFLATUS_META } from "@/lib/afflatus";
import type { Afflatus, RarityFilter } from "@/lib/types";
import { Dropdown } from "@/components/ui/Dropdown";
import { FilterSection } from "@/components/ui/FilterSection";
import { IconFilter } from "@/components/ui/IconFilter";

interface CharacterPickerModalProps {
  /** Currently-selected character ids (owned/added), used to pre-check and to diff on Done. */
  selectedIds: Set<number>;
  onClose: () => void;
  /** Called once with the final selection when the user presses Done. */
  onDone: (ids: Set<number>) => void;
}

const AFFLATUS_ORDER: Afflatus[] = ["Star", "Plant", "Mineral", "Beast", "Spirit", "Intelligence"];

const RARITY_LABEL: Record<string, string> = {
  all: "All rarities",
  "6": "6★",
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

function IconCheck() {
  return (
    <svg width="26" height="26" viewBox="0 0 16 16" fill="none">
      <path d="M3.5 8.3l2.8 2.8 6.2-6.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function PickerCard({
  id,
  name,
  rarity,
  afflatus,
  italic,
  selected,
  onToggle,
}: {
  id: number;
  name: string;
  rarity: number;
  afflatus: Afflatus;
  italic: boolean;
  selected: boolean;
  onToggle: () => void;
}) {
  const [artLoaded, setArtLoaded] = useState(false);
  const [artErrored, setArtErrored] = useState(false);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className="group relative pt-3 text-left outline-none"
    >
      <div className="absolute left-2 top-1.5 z-20 h-9 w-6">
        <Image src={afflatusIconPath(afflatus)} alt={afflatus} fill sizes="24px" className="object-contain object-top drop-shadow-md" />
      </div>

      <div
        className={`relative overflow-hidden rounded-md border transition-all duration-150
          ${selected ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-panel)]" : "border-[var(--color-border)] group-hover:border-[var(--color-border-strong)]"}`}
        style={{ aspectRatio: "224 / 524" }}
      >
        <div className="absolute inset-0 bg-[var(--color-surface)]" />

        {!artLoaded && !artErrored && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </div>
        )}

        {!artErrored && (
          <Image
            src={characterArtPath(id)}
            alt={name}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 130px"
            className={`origin-top scale-105 object-cover object-top transition-opacity duration-200 ${artLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setArtLoaded(true)}
            onError={() => setArtErrored(true)}
          />
        )}

        {artErrored && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface-hover)]">
            <span className="text-2xl text-[var(--color-text-faint)]" style={{ fontFamily: "var(--font-display)" }}>
              {initials(name)}
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-[50%]">
          <Image src={rarityPlatePath(rarity)} alt="" fill sizes="130px" className="object-cover object-bottom" />
        </div>

        <div className="absolute inset-x-0 bottom-1.5 z-10 px-2">
          <span
            className={`block text-center text-[0.9rem] font-semibold leading-tight text-white ${italic ? "italic" : ""}`}
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)", fontFamily: "var(--font-display)" }}
          >
            {name}
          </span>
        </div>

        {/* Dim + check overlay when selected */}
        <div
          className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/45 transition-opacity duration-150 ${selected ? "opacity-100" : "opacity-0"}`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-accent)] text-white shadow-lg">
            <IconCheck />
          </span>
        </div>
      </div>
    </button>
  );
}

export function CharacterPickerModal({ selectedIds, onClose, onDone }: CharacterPickerModalProps) {
  const [draft, setDraft] = useState<Set<number>>(() => new Set(selectedIds));
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState<RarityFilter>("all");
  const [afflatus, setAfflatus] = useState<Afflatus | "all">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return roster
      .filter((c) => {
        if (q && !c.name.toLowerCase().includes(q)) return false;
        if (rarity !== "all" && c.rarity !== rarity) return false;
        if (afflatus !== "all" && c.afflatus !== afflatus) return false;
        return true;
      })
      .sort((a, b) => b.rarity - a.rarity || b.id - a.id);
  }, [search, rarity, afflatus]);

  function toggle(id: number) {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Add characters">
      <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <h2 className="text-[0.95rem] font-semibold text-[var(--color-text)]">Add Characters</h2>
            <p className="text-[0.72rem] text-[var(--color-text-faint)]">
              {draft.size} selected
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-dim)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          >
            <IconClose />
          </button>
        </div>

        {/* Filters */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--color-border)] px-5 py-3">
          <div className="relative">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]">
              <IconSearch />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search arcanists…"
              className="w-44 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-8 pr-3 text-[0.78rem] text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-faint)]"
            />
          </div>

          <Dropdown
            label="Filters"
            icon={<IconFilter />}
            active={rarity !== "all" || afflatus !== "all"}
            panelClassName="left-0 w-72"
          >
            {(close) => (
              <div>
                <FilterSection title="Rarity">
                  <div className="flex flex-wrap gap-1">
                    {(["all", 6, 5, 4, 3, 2] as RarityFilter[]).map((key) => (
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
                </FilterSection>

                <FilterSection title="Afflatus">
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => setAfflatus("all")}
                      className={`rounded-lg px-2.5 py-1.5 text-[0.72rem] font-medium transition-colors
                        ${afflatus === "all" ? "bg-[var(--color-accent)] text-white" : "bg-[var(--color-surface)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"}`}
                    >
                      All
                    </button>
                    {AFFLATUS_ORDER.map((a) => (
                      <button
                        key={a}
                        onClick={() => setAfflatus(a)}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.72rem] font-medium transition-colors
                          ${afflatus === a ? "bg-[var(--color-accent)] text-white" : "bg-[var(--color-surface)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"}`}
                      >
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ background: afflatus === a ? "white" : AFFLATUS_META[a].colorVar }}
                        />
                        {a}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                <div className="p-2">
                  <button
                    onClick={() => {
                      setRarity("all");
                      setAfflatus("all");
                      close();
                    }}
                    className="w-full rounded-lg px-3 py-1.5 text-center text-[0.72rem] font-medium text-[var(--color-text-faint)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </Dropdown>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-[0.8rem] text-[var(--color-text-faint)]">
              No arcanists match your filters.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7">
              {filtered.map((c) => {
                const displayName = parseDisplayName(c.name);
                return (
                  <PickerCard
                    key={c.id}
                    id={c.id}
                    name={displayName.text}
                    italic={displayName.italic}
                    rarity={c.rarity}
                    afflatus={c.afflatus}
                    selected={draft.has(c.id)}
                    onToggle={() => toggle(c.id)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
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
