"use client";

import { useState } from "react";
import Image from "next/image";
import { psychubeArtPath } from "@/lib/assets/psychubeAssets";
import { rarityPlatePath } from "@/lib/assets/characterAssets";

interface PsychubePickerTileProps {
  id: number;
  name: string;
  rarity: number;
  recommended?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function IconCheck() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-full w-full">
      <path d="M3.5 8.3l2.8 2.8 6.2-6.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PsychubePickerTile({ id, name, rarity, recommended, selected, disabled = false, onToggle }: PsychubePickerTileProps) {
  const [artLoaded, setArtLoaded] = useState(false);
  const [artErrored, setArtErrored] = useState(false);

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`Select ${name}`}
      className={`group relative text-left outline-none ${disabled ? "cursor-not-allowed opacity-35" : ""}`}
    >
      {recommended && (
        <span className="absolute -top-1.5 left-1 z-20 rounded bg-[var(--color-accent)] px-1.5 py-0.5 text-[0.55rem] font-semibold text-white shadow">
          Recommended
        </span>
      )}

      <div
        className={`relative overflow-hidden rounded-md border transition-all duration-150
          ${selected ? "border-[var(--color-accent)]" : "border-[var(--color-border)] group-hover:border-[var(--color-border-strong)]"}`}
        style={{ aspectRatio: "224 / 224" }}
      >
        <div className="absolute inset-0 bg-[var(--color-surface)]" />

        {!artLoaded && !artErrored && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </div>
        )}

        {!artErrored && (
          <Image
            src={psychubeArtPath(id)}
            alt={name}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 130px"
            className={`object-cover transition-opacity duration-200 ${artLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setArtLoaded(true)}
            onError={() => setArtErrored(true)}
          />
        )}

        {artErrored && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface-hover)]">
            <span className="text-xl text-[var(--color-text-faint)]" style={{ fontFamily: "var(--font-display)" }}>
              {initials(name)}
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-[45%]">
          <Image src={rarityPlatePath(rarity)} alt="" fill sizes="130px" className="object-cover object-bottom" />
        </div>

        <div className="absolute inset-x-0 bottom-1 z-10 px-1.5">
          <span
            className="block truncate text-center text-[0.62rem] font-semibold leading-tight text-white"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)", fontFamily: "var(--font-display)" }}
          >
            {name}
          </span>
        </div>

        {selected != null && (
          <div
            className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/45 transition-opacity duration-150 ${selected ? "opacity-100" : "opacity-0"}`}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent)] p-1.5 text-white shadow-lg">
              <IconCheck />
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
