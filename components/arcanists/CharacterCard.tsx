"use client";

import { useState } from "react";
import Image from "next/image";
import {
  characterArtPath,
  characterI2ArtPath,
  hasCharacterI2Art,
  afflatusIconPath,
  rarityPlatePath,
  insightIconPath,
} from "@/lib/assets/characterAssets";
import { garmentCardPath } from "@/lib/assets/garmentAssets";
import { garmentsForCharacter } from "@/lib/data/garments";
import { parseDisplayName } from "@/lib/data/roster";
import type { RosterCharacter, CharacterProgress } from "@/lib/types";

interface CharacterCardProps {
  character: RosterCharacter;
  progress: CharacterProgress;
  showI2Art?: boolean;
  priority?: boolean;
  /** Gallery mode ignores the user's tracked progress entirely — always
   * shows base art (or the I2 toggle) and just the name, no level/insight/
   * portrait overlay or selected-garment art. Used on the Arcanists gallery
   * page, which is meant to browse all characters' default art, not reflect
   * what's been set on the Roster page. */
  galleryMode?: boolean;
}

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

export function CharacterCard({
  character,
  progress,
  showI2Art = false,
  priority = false,
  galleryMode = false,
}: CharacterCardProps) {
  const displayName = parseDisplayName(character.name);
  const [artLoaded, setArtLoaded] = useState(false);
  const [artErrored, setArtErrored] = useState(false);
  const [plateErrored, setPlateErrored] = useState(false);
  const hasLevelInfo = !galleryMode && progress.level > 0;

  // A selected garment or the Insight 2 look (picked in the detail modal's
  // carousel) takes priority over the base/I2-toggle art. If the user hasn't
  // made an explicit choice, characters that have actually reached Insight 2
  // default to their I2 art automatically — this is what keeps the roster
  // card in sync with whatever the carousel last centered on, or with the
  // character's own progress when nothing's been picked yet. None of this
  // applies in gallery mode, which always shows base (or I2-toggle) art.
  const selectedGarment =
    !galleryMode && typeof progress.selectedGarmentId === "number"
      ? garmentsForCharacter(character.id).find((g) => g.id === progress.selectedGarmentId)
      : undefined;
  const selectedInsight2 = !galleryMode && progress.selectedGarmentId === "insight2";
  const autoInsight2 =
    !galleryMode &&
    progress.selectedGarmentId == null &&
    progress.insight >= 2 &&
    hasCharacterI2Art(character.id);

  const artSrc = selectedGarment
    ? garmentCardPath(selectedGarment)
    : selectedInsight2 || autoInsight2 || (showI2Art && hasCharacterI2Art(character.id))
      ? characterI2ArtPath(character.id)
      : characterArtPath(character.id);

  return (
    <div className="group relative pt-3">
      {/* Afflatus bookmark — hangs above the card's top edge, left side.
          Scaled down on mobile but keeps the same overhang ratio as
          the desktop version relative to the wrapper's pt-3. */}
      <div className="absolute left-1.5 top-2 z-20 h-7 w-[1.1rem] sm:left-2 sm:top-1.5 sm:h-11 sm:w-7">
        <Image
          src={afflatusIconPath(character.afflatus)}
          alt={character.afflatus}
          fill
          sizes="28px"
          className="object-contain object-top drop-shadow-md"
        />
      </div>

      <div
        className="relative overflow-hidden rounded-md border border-[var(--color-border)] transition-all duration-200 active:scale-[0.98] group-hover:-translate-y-1 group-hover:border-[var(--color-border-strong)] group-hover:shadow-lg group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-[var(--color-accent)]"
        style={{ aspectRatio: "224 / 524" }}
      >
        {/* Solid backdrop — the character art has transparent cutout edges,
            so a plain dark fill sits behind it instead of a busy texture. */}
        <div className="absolute inset-0 bg-[var(--color-surface)]" />

        {/* Dark vignette, top to bottom, with a faint rarity-colored glow
            breathing in at the base — stays inside the card's own
            atmosphere, never touches UI chrome. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.6) 100%), linear-gradient(to bottom, transparent 65%, color-mix(in srgb, ${rarityTint(character.rarity)} 8%, transparent) 100%)`,
          }}
        />

        {/* Loading skeleton — shown until the art resolves (loaded or
            errored), so the card never sits there looking dead. */}
        {!artLoaded && !artErrored && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </div>
        )}

        {/* Character art, full bleed, fills the entire card. `priority` is
            only true for the first couple rows (see page.tsx) — those are
            the images actually above the fold and worth eager-loading;
            marking every card priority would defeat lazy loading entirely. */}
        {!artErrored && (
          <Image
            src={artSrc}
            alt={displayName.text}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 140px"
            className={`origin-top scale-105 object-cover object-top transition-opacity duration-200 ${artLoaded ? "opacity-100" : "opacity-0"}`}
            priority={priority}
            onLoad={() => setArtLoaded(true)}
            onError={() => setArtErrored(true)}
          />
        )}

        {/* Broken-art fallback — initials on a flat panel, so the card
            still reads as intentional rather than an empty rectangle. */}
        {artErrored && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface-hover)]">
            <span
              className="text-3xl text-[var(--color-text-faint)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {initials(displayName.text)}
            </span>
          </div>
        )}

        {/* Rarity plate, anchored to the bottom, original asset untouched */}
        {!plateErrored && (
          <div className="absolute inset-x-0 bottom-0 h-[55%]">
            <Image
              src={rarityPlatePath(character.rarity)}
              alt=""
              fill
              sizes="140px"
              className="object-cover object-bottom"
              onError={() => setPlateErrored(true)}
            />
          </div>
        )}

        {/* Bottom info stack — name only until the user has logged a level;
            once level is set, show insight tier, level, name, and portrait
            pips, matching the in-game card layout. */}
        {hasLevelInfo ? (
          <div className="absolute inset-x-0 bottom-2 z-10 flex flex-col items-center gap-0.5">
            {progress.insight > 0 && (
              <span className="relative mb-0.5 h-3.5 w-3.5 shrink-0 sm:h-6 sm:w-6">
                <Image
                  src={insightIconPath(progress.insight as 1 | 2 | 3)}
                  alt={`Insight ${progress.insight}`}
                  fill
                  sizes="24px"
                  className="object-contain drop-shadow-md"
                />
              </span>
            )}
            <span
              className="text-[0.6rem] font-semibold leading-tight text-white/90 sm:text-[0.85rem]"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
            >
              Lv.{progress.level}
            </span>
            <span
              className={`block w-full px-1 text-center text-[0.55rem] font-semibold leading-tight text-white sm:px-2 sm:text-[0.95rem] ${displayName.italic ? "italic" : ""}`}
              style={{
                textShadow: "0 1px 4px rgba(0,0,0,0.9)",
                fontFamily: "var(--font-display)",
              }}
              title={displayName.text}
            >
              {displayName.text}
            </span>
            {progress.portrait > 0 && (
              <div className="mt-1.5 flex w-full items-center justify-between px-3">
                {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                  <span
                    key={n}
                    className={`h-[3px] flex-1 rounded-full ${n <= progress.portrait ? "bg-[var(--color-portrait-bar)]" : "bg-white/25"} ${n > 1 ? "ml-1" : ""}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-x-0 bottom-2 z-10 px-2">
            <span
              className={`block w-full px-1 text-center text-[0.55rem] font-semibold leading-tight text-white sm:px-2 sm:text-[0.95rem] ${displayName.italic ? "italic" : ""}`}
              style={{
                textShadow: "0 1px 4px rgba(0,0,0,0.9)",
                fontFamily: "var(--font-display)",
              }}
              title={displayName.text}
            >
              {displayName.text}
            </span>
          </div>
        )}

      </div>
    </div>
  );
}