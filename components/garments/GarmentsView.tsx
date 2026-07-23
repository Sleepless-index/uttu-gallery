"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { roster } from "@/lib/data/roster";
import { garments } from "@/lib/data/garments";
import { garmentCardPath, garmentDisplayName } from "@/lib/assets/garmentAssets";
import { rarityPlatePath } from "@/lib/assets/characterAssets";
import { parseDisplayName } from "@/lib/data/roster";
import { GarmentModal } from "@/components/garments/GarmentModal";
import { Dropdown } from "@/components/ui/Dropdown";
import { FilterSection } from "@/components/ui/FilterSection";
import { MenuItem } from "@/components/ui/MenuItem";
import { IconFilter } from "@/components/ui/IconFilter";

type GarmentCategoryFilter = "all" | string;

const CATEGORY_ORDER = ["unique", "advanced", "basic", "roar_jukebox", "free"];
const CATEGORY_LABEL: Record<string, string> = {
  unique: "Unique",
  advanced: "Advanced",
  basic: "Basic",
  roar_jukebox: "Roar Jukebox",
  free: "Free",
};

export function GarmentsView() {
  const [openGarmentId, setOpenGarmentId] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<GarmentCategoryFilter>("all");

  const characterRarityById = useMemo(() => {
    const map = new Map<number, number>();
    for (const c of roster) map.set(c.id, c.rarity);
    return map;
  }, []);

  const characterNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of roster) map.set(c.id, c.name);
    return map;
  }, []);

  const availableCategories = useMemo(() => {
    const set = new Set(garments.map((g) => g.category));
    return CATEGORY_ORDER.filter((c) => set.has(c));
  }, []);

  const filtered = useMemo(() => {
    const list =
      categoryFilter === "all" ? garments : garments.filter((g) => g.category === categoryFilter);
    return [...list].sort((a, b) => {
      const rarityA = characterRarityById.get(a.characterId) ?? 0;
      const rarityB = characterRarityById.get(b.characterId) ?? 0;
      return rarityB - rarityA || b.characterId - a.characterId;
    });
  }, [categoryFilter, characterRarityById]);

  const openGarment = garments.find((g) => g.id === openGarmentId) ?? null;
  const openCharacter = openGarment
    ? roster.find((c) => c.id === openGarment.characterId) ?? null
    : null;

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[0.8rem] font-medium text-[var(--color-text-dim)]">
          Showing {filtered.length} garment{filtered.length === 1 ? "" : "s"}
        </h2>

        {/* Filters dropdown, matching the Arcanist page's Filters button */}
        <Dropdown
          label="Filters"
          icon={<IconFilter />}
          active={categoryFilter !== "all"}
          panelClassName="right-0 w-56"
        >
          {() => (
            <FilterSection title="Category">
              <div className="flex flex-col gap-0.5">
                <MenuItem
                  active={categoryFilter === "all"}
                  onClick={() => setCategoryFilter("all")}
                >
                  All
                </MenuItem>
                {availableCategories.map((c) => (
                  <MenuItem
                    key={c}
                    active={categoryFilter === c}
                    onClick={() => setCategoryFilter(c)}
                  >
                    {CATEGORY_LABEL[c] ?? c}
                  </MenuItem>
                ))}
              </div>
            </FilterSection>
          )}
        </Dropdown>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-[0.8rem] text-[var(--color-text-faint)]">
          No garments match your filters.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {filtered.map((g) => {
            const charName = characterNameById.get(g.characterId) ?? "";
            return (
              <button
                key={g.id}
                onClick={() => setOpenGarmentId(g.id)}
                className="group relative"
              >
                <div
                  className="relative w-full overflow-hidden rounded-md border border-[var(--color-border-strong)] transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg"
                  style={{ aspectRatio: "224 / 524" }}
                >
                  {/* Solid backdrop behind cutout art */}
                  <div className="absolute inset-0 bg-[var(--color-surface)]" />

                  {/* Dark gradient vignette */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/60" />

                  <Image
                    src={garmentCardPath(g)}
                    alt={garmentDisplayName(g)}
                    fill
                    sizes="(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 140px"
                    className="object-cover object-top"
                  />

                  {/* Rarity plate, anchored to the bottom — uses the character's rarity */}
                  <div className="absolute inset-x-0 bottom-0 h-[55%]">
                    <Image
                      src={rarityPlatePath(characterRarityById.get(g.characterId) ?? 6)}
                      alt=""
                      fill
                      sizes="140px"
                      className="object-cover object-bottom"
                    />
                  </div>

                  {/* Name, raised off the bottom edge */}
                  <div className="absolute inset-x-0 bottom-5 z-10 flex flex-col gap-0.5 px-2 leading-[1.15]">
                    <span
                      className={`block text-center text-[0.68rem] font-medium text-white/60 ${parseDisplayName(charName).italic ? "italic" : ""}`}
                      style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
                    >
                      {parseDisplayName(charName).text}
                    </span>
                    <span
                      className="block text-balance text-center text-[0.95rem] font-semibold text-white"
                      style={{
                        textShadow: "0 1px 4px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.7)",
                        fontFamily: "var(--font-display)",
                      }}
                      title={garmentDisplayName(g)}
                    >
                      {garmentDisplayName(g)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <GarmentModal
        garment={openGarment}
        character={openCharacter}
        onClose={() => setOpenGarmentId(null)}
      />
    </>
  );
}
