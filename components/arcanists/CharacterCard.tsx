"use client";

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
}

export function CharacterCard({
  character,
  progress,
  editMode,
  onOpen,
  wishlisted,
  showI2Art = false,
}: CharacterCardProps) {
  const displayName = parseDisplayName(character.name);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(character.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen(character.id);
      }}
      className="group relative cursor-pointer pt-3"
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
        className="relative overflow-hidden rounded-md border border-[var(--color-border-strong)] transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg"
        style={{ aspectRatio: "224 / 524" }}
      >
        {/* Solid backdrop — the character art has transparent cutout edges,
            so a plain dark fill sits behind it instead of a busy texture. */}
        <div className="absolute inset-0 bg-[var(--color-surface)]" />

        {/* Dark gradient, subtle vignette from top to bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/60" />

        {/* Character art, full bleed, fills the entire card */}
        <Image
          src={
            showI2Art && hasCharacterI2Art(character.id)
              ? characterI2ArtPath(character.id)
              : characterArtPath(character.id)
          }
          alt={displayName.text}
          fill
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 140px"
          className="object-cover object-top"
        />

        {/* Rarity plate, anchored to the bottom, original asset untouched */}
        <div className="absolute inset-x-0 bottom-0 h-[55%]">
          <Image
            src={rarityPlatePath(character.rarity)}
            alt=""
            fill
            sizes="140px"
            className="object-cover object-bottom"
          />
        </div>

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
              textShadow: "0 1px 4px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.7)",
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
