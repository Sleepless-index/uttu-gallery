"use client";

import { useState } from "react";
import Image from "next/image";
import { afflatusIconPath, rarityPlatePath, characterArtPath } from "@/lib/assets/characterAssets";
import type { Afflatus } from "@/lib/types";

function IconCheck() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-full w-full">
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

interface PickerCardProps {
  id: number;
  name: string;
  rarity: number;
  afflatus: Afflatus;
  italic: boolean;
  /** Multi-select checkmark state (My Characters picker). Omit for a plain
   * single-pick card (My Teams slot picker) — no checkmark overlay, no
   * pressed/selected border treatment. */
  selected?: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

/** The character tile used inside picker modals — deliberately smaller/
 * lighter than the roster's CharacterCard (no level/insight/portrait
 * chrome, since pickers show characters before any of that applies). Both
 * CharacterPickerModal and TeamSlotPickerModal render this exact component
 * so their grids always match at the same column count. */
export function PickerCard({ id, name, rarity, afflatus, italic, selected, onToggle, disabled = false }: PickerCardProps) {
  const [artLoaded, setArtLoaded] = useState(false);
  const [artErrored, setArtErrored] = useState(false);

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`Add ${name} to this slot`}
      className={`group relative pt-3 text-left outline-none ${disabled ? "cursor-not-allowed opacity-35" : ""}`}
    >
      <div className="absolute left-1.5 top-2 z-20 h-7 w-[1.1rem] sm:left-2 sm:top-1.5 sm:h-11 sm:w-7">
        <Image src={afflatusIconPath(afflatus)} alt={afflatus} fill sizes="28px" className="object-contain object-top drop-shadow-md" />
      </div>

      <div
        className={`relative overflow-hidden rounded-md border transition-all duration-150
          ${selected ? "border-[var(--color-accent)]" : "border-[var(--color-border)] group-hover:border-[var(--color-border-strong)]"}`}
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
            className={`block text-center text-[0.55rem] font-semibold leading-tight text-white sm:text-[0.95rem] ${italic ? "italic" : ""}`}
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)", fontFamily: "var(--font-display)" }}
          >
            {name}
          </span>
        </div>

        {selected != null && (
          <div
            className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/45 transition-opacity duration-150 ${selected ? "opacity-100" : "opacity-0"}`}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent)] p-1.5 text-white shadow-lg sm:h-11 sm:w-11 sm:p-2.5">
              <IconCheck />
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
