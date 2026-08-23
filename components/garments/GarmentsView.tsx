"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { roster } from "@/lib/data/roster";
import { garments } from "@/lib/data/garments";
import { garmentCardPath, garmentDisplayName } from "@/lib/assets/garmentAssets";
import { rarityPlatePath } from "@/lib/assets/characterAssets";
import { parseDisplayName } from "@/lib/data/roster";
import { Dropdown } from "@/components/ui/Dropdown";
import { FilterSection } from "@/components/ui/FilterSection";
import { MenuItem } from "@/components/ui/MenuItem";
import { IconFilter } from "@/components/ui/IconFilter";

type Garment = (typeof garments)[number];

type GarmentCategoryFilter = "all" | string;

const CATEGORY_ORDER = ["unique", "advanced", "basic", "roar_jukebox", "free"];
const CATEGORY_LABEL: Record<string, string> = {
  unique: "Unique",
  advanced: "Advanced",
  basic: "Basic",
  roar_jukebox: "Roar Jukebox",
  free: "Free",
};

// Rarity → CSS color var, for the tinted vignette. Falls back to the
// lowest rarity tone if an unexpected value shows up.
const RARITY_TINT: Record<number, string> = {
  6: "var(--color-rarity-6)",
  5: "var(--color-rarity-5)",
  4: "var(--color-rarity-4)",
  3: "var(--color-rarity-3)",
  2: "var(--color-rarity-2)",
};

function rarityTint(rarity: number): string {
  return RARITY_TINT[rarity] ?? RARITY_TINT[2];
}

// Initials fallback for when the art fails to load — first letter of
// up to the first two words of the display name.
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

interface GarmentCardProps {
  garment: Garment;
  charName: string;
  rarity: number;
}

function GarmentCard({ garment, charName, rarity }: GarmentCardProps) {
  const [artLoaded, setArtLoaded] = useState(false);
  const [artErrored, setArtErrored] = useState(false);
  const [plateErrored, setPlateErrored] = useState(false);
  const name = garmentDisplayName(garment);
  const character = parseDisplayName(charName);

  return (
    <div className="group relative">
      <div
        className="relative w-full overflow-hidden rounded-md border border-[var(--color-border)] transition-all duration-200 active:scale-[0.98] group-hover:-translate-y-1 group-hover:border-[var(--color-border-strong)] group-hover:shadow-lg group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-[var(--color-accent)]"
        style={{ aspectRatio: "224 / 524" }}
      >
        {/* Solid backdrop behind cutout art */}
        <div className="absolute inset-0 bg-[var(--color-surface)]" />

        {/* Dark vignette, top to bottom, with a faint rarity-colored glow
            breathing in at the base. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.6) 100%), linear-gradient(to bottom, transparent 65%, color-mix(in srgb, ${rarityTint(rarity)} 8%, transparent) 100%)`,
          }}
        />

        {/* Loading skeleton — shown until the art resolves */}
        {!artLoaded && !artErrored && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </div>
        )}

        {!artErrored && (
          <Image
            src={garmentCardPath(garment)}
            alt={name}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 140px"
            className={`origin-top scale-110 object-cover object-top transition-opacity duration-200 ${artLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setArtLoaded(true)}
            onError={() => setArtErrored(true)}
          />
        )}

        {/* Broken-art fallback — initials on a flat panel */}
        {artErrored && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface-hover)]">
            <span
              className="text-3xl text-[var(--color-text-faint)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {initials(name)}
            </span>
          </div>
        )}

        {/* Rarity plate, anchored to the bottom — uses the character's rarity */}
        {!plateErrored && (
          <div className="absolute inset-x-0 bottom-0 h-[55%]">
            <Image
              src={rarityPlatePath(rarity)}
              alt=""
              fill
              sizes="140px"
              className="object-cover object-bottom"
              onError={() => setPlateErrored(true)}
            />
          </div>
        )}

        {/* Name, raised off the bottom edge */}
        <div className="absolute inset-x-0 bottom-2 z-10 flex flex-col gap-0.5 px-2 leading-[1.15]">
          <span
            className={`block text-center text-[0.5rem] font-medium text-white/60 sm:text-[0.68rem] ${character.italic ? "italic" : ""}`}
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
          >
            {character.text}
          </span>
          <span
            className="block text-balance text-center text-[0.55rem] font-semibold text-white sm:text-[0.95rem]"
            style={{
              textShadow: "0 1px 4px rgba(0,0,0,0.9)",
              fontFamily: "var(--font-display)",
            }}
            title={name}
          >
            {name}
          </span>
        </div>
      </div>
    </div>
  );
}

export function GarmentsView() {
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

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[0.8rem] font-medium text-[var(--color-text-dim)]">
          Showing {filtered.length} garment{filtered.length === 1 ? "" : "s"}
        </h2>

        {/* Filters dropdown, matching the Arcanist page's Filters button.
            Wrapped in ml-auto so it stays pinned to the right edge even if
            flex-wrap drops it to its own line on narrow screens. */}
        <div className="ml-auto">
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
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-[0.8rem] text-[var(--color-text-faint)]">
          No garments match your filters.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-4 sm:grid-cols-4 md:grid-cols-5 lg:[grid-template-columns:repeat(auto-fill,minmax(140px,1fr))]">
          {filtered.map((g) => (
            <GarmentCard
              key={g.id}
              garment={g}
              charName={characterNameById.get(g.characterId) ?? ""}
              rarity={characterRarityById.get(g.characterId) ?? 6}
            />
          ))}
        </div>
      )}
    </>
  );
}