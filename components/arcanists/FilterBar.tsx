"use client";

import Image from "next/image";
import { AFFLATUS_META } from "@/lib/afflatus";
import type { Afflatus, RarityFilter, OwnedFilter, SortOrder } from "@/lib/types";
import { Dropdown } from "@/components/ui/Dropdown";
import { FilterSection } from "@/components/ui/FilterSection";
import { MenuItem } from "@/components/ui/MenuItem";
import { IconFilter } from "@/components/ui/IconFilter";

interface FilterBarProps {
  rarity: RarityFilter;
  onRarityChange: (r: RarityFilter) => void;
  afflatus: Afflatus | "all";
  onAfflatusChange: (a: Afflatus | "all") => void;
  status: OwnedFilter;
  onStatusChange: (o: OwnedFilter) => void;
  sort: SortOrder;
  onSortChange: (s: SortOrder) => void;
  showI2Art: boolean;
  onToggleI2Art: () => void;
}

const AFFLATUS_ORDER: Afflatus[] = [
  "Star",
  "Plant",
  "Mineral",
  "Beast",
  "Spirit",
  "Intelligence",
];

const STATUS_LABEL: Record<OwnedFilter, string> = {
  all: "All arcanists",
  owned: "Owned",
  unowned: "Not owned",
};

const RARITY_LABEL: Record<string, string> = {
  all: "All rarities",
  "6": "6★ Only",
  "5": "5★ Only",
  "4": "4★ Only",
  "3": "3★ Only",
  "2": "2★ Only",
};

const SORT_LABEL: Record<SortOrder, string> = {
  default: "Default order",
  "rarity-desc": "Rarity: High to low",
  "rarity-asc": "Rarity: Low to high",
  "name-asc": "Name: A to Z",
};

export function FilterBar({
  rarity,
  onRarityChange,
  afflatus,
  onAfflatusChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  showI2Art,
  onToggleI2Art,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Consolidated filters */}
      <Dropdown
        label="Filters"
        icon={<IconFilter />}
        active={status !== "all" || rarity !== "all" || afflatus !== "all" || sort !== "default"}
        panelClassName="right-0 w-72"
      >
        {(close) => (
          <div>
            <FilterSection title="Status">
              <div className="flex flex-col gap-0.5">
                {(Object.keys(STATUS_LABEL) as OwnedFilter[])
                  .filter((key) => key !== "owned")
                  .map((key) => (
                    <MenuItem
                      key={key}
                      active={status === key}
                      onClick={() => onStatusChange(key)}
                    >
                      {STATUS_LABEL[key]}
                    </MenuItem>
                  ))}
              </div>
            </FilterSection>

            <FilterSection title="Rarity">
              <div className="flex flex-wrap gap-1">
                {(["all", 6, 5, 4, 3, 2] as RarityFilter[]).map((key) => (
                  <button
                    key={String(key)}
                    onClick={() => onRarityChange(key)}
                    className={`rounded-lg px-2.5 py-1.5 text-[0.72rem] font-medium transition-colors
                      ${
                        rarity === key
                          ? "bg-[var(--color-accent)] text-white"
                          : "bg-[var(--color-surface)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                      }`}
                  >
                    {RARITY_LABEL[String(key)]}
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Afflatus">
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => onAfflatusChange("all")}
                  className={`rounded-lg px-2.5 py-1.5 text-[0.72rem] font-medium transition-colors
                    ${
                      afflatus === "all"
                        ? "bg-[var(--color-accent)] text-white"
                        : "bg-[var(--color-surface)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                    }`}
                >
                  All
                </button>
                {AFFLATUS_ORDER.map((a) => (
                  <button
                    key={a}
                    onClick={() => onAfflatusChange(a)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.72rem] font-medium transition-colors
                      ${
                        afflatus === a
                          ? "bg-[var(--color-accent)] text-white"
                          : "bg-[var(--color-surface)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                      }`}
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

            <FilterSection title="Sort">
              <div className="flex flex-col gap-0.5">
                {(Object.keys(SORT_LABEL) as SortOrder[]).map((key) => (
                  <MenuItem key={key} active={sort === key} onClick={() => onSortChange(key)}>
                    {SORT_LABEL[key]}
                  </MenuItem>
                ))}
              </div>
            </FilterSection>

            <div className="p-2">
              <button
                onClick={() => {
                  onStatusChange("all");
                  onRarityChange("all");
                  onAfflatusChange("all");
                  onSortChange("default");
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

      {/* Global I2 art toggle */}
      <button
        type="button"
        onClick={onToggleI2Art}
        aria-pressed={showI2Art}
        aria-label="Toggle Insight 2 art"
        title="Insight 2 art"
        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors
          ${
            showI2Art
              ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
              : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-dim)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
          }`}
      >
        <span className="relative h-5 w-5">
          <Image src="/insight/insight-2.webp" alt="Insight 2" fill sizes="20px" className="object-contain" />
        </span>
      </button>
    </div>
  );
}
