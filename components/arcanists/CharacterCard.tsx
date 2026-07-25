"use client";

import { useState } from "react";
import Image from "next/image";
import {
  characterArtPath,
  characterI2ArtPath,
  hasCharacterI2Art,
  afflatusIconPath,
  rarityPlatePath,
} from "@/lib/assets/characterAssets";
import { parseDisplayName } from "@/lib/data/roster";
import type { RosterCharacter, CharacterProgress } from "@/lib/types";

interface CharacterCardProps {
  character: RosterCharacter;
  progress: CharacterProgress;
  editMode: boolean;
  onOpen: (id: number) => void;
  wishlisted: boolean;
  showI2Art?: boolean;
  priority?: boolean;
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
  editMode,
  onOpen,
  wishlisted,
  showI2Art = false,
  priority = false,
}: CharacterCardProps) {
  const displayName = parseDisplayName(character.name);
  const [artLoaded, setArtLoaded] = useState(false);
  const [artErrored, setArtErrored] = useState(false);
  const [plateErrored, setPlateErrored] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(character.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen(character.id);
      }}
      className="group relative cursor-pointer pt-3 outline-none"
    >
      {/* Afflatus bookmark — hangs above the card's top edge, left side */}
      <div className="absolute left-2 top-1.5 z-20 h-11 w-7">
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
            src={
              showI2Art && hasCharacterI2Art(character.id)
                ? characterI2ArtPath(character.id)
                : characterArtPath(character.id)
            }
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

        {/* Wishlist badge, top-right — solid chip, only shown when active */}
        {wishlisted && (
          <div className="absolute right-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded bg-[var(--color-accent)] text-[0.62rem] text-white">
            ★
          </div>
        )}

        {/* Name, raised off the bottom edge with breathing room below it */}
        <div className="absolute inset-x-0 bottom-5 z-10 px-2">
          <span
            className={`block truncate text-center text-[1.05rem] font-semibold leading-tight text-white ${displayName.italic ? "italic" : ""}`}
            style={{
              textShadow: "0 1px 4px rgba(0,0,0,0.9)",
              fontFamily: "var(--font-display)",
            }}
            title={displayName.text}
          >
            {displayName.text}
          </span>
        </div>

        {/* Edit mode indicator — solid accent border, no transparency */}
        {editMode && (
          <div className="pointer-events-none absolute inset-0 z-10 border-2 border-transparent transition-colors duration-150 group-hover:border-[var(--color-accent)]" />
        )}
        {editMode && (
          <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex translate-y-[-100%] items-center justify-center bg-[var(--color-accent)] py-1 transition-transform duration-150 group-hover:translate-y-0">
            <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-white">
              Click to edit
            </span>
          </div>
        )}
      </div>
    </div>
  );
}