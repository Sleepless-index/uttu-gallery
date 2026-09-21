"use client";

import { useState } from "react";
import Image from "next/image";
import { characterArtPath, afflatusIconPath, rarityPlatePath } from "@/lib/assets/characterAssets";
import { parseDisplayName } from "@/lib/data/roster";
import type { RosterCharacter, PullDecision } from "@/lib/types";

interface PullChecklistCardProps {
  character: RosterCharacter;
  decision: PullDecision | null;
  onChange: (decision: PullDecision | null) => void;
}

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

const DECISION_OPTIONS: { value: PullDecision; label: string; activeClass: string }[] = [
  { value: "pull", label: "Pull", activeClass: "border-emerald-500 bg-emerald-500/15 text-emerald-400" },
  { value: "maybe", label: "Maybe…", activeClass: "border-amber-500 bg-amber-500/15 text-amber-400" },
  { value: "skip", label: "Skip.", activeClass: "border-red-500 bg-red-500/15 text-red-400" },
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export function PullChecklistCard({ character, decision, onChange }: PullChecklistCardProps) {
  const displayName = parseDisplayName(character.name);
  const [artLoaded, setArtLoaded] = useState(false);
  const [artErrored, setArtErrored] = useState(false);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-3 sm:gap-4 sm:p-4">
      <div className="relative shrink-0 pt-3">
        <div className="absolute left-1.5 top-1.5 z-20 h-7 w-[1.1rem] sm:h-9 sm:w-6">
          <Image
            src={afflatusIconPath(character.afflatus)}
            alt={character.afflatus}
            fill
            sizes="24px"
            className="object-contain object-top drop-shadow-md"
          />
        </div>

        <div
          className="relative w-20 overflow-hidden rounded-md border border-[var(--color-border)] sm:w-24"
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
              src={characterArtPath(character.id)}
              alt={displayName.text}
              fill
              sizes="96px"
              className={`origin-top scale-105 object-cover object-top transition-opacity duration-200 ${artLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setArtLoaded(true)}
              onError={() => setArtErrored(true)}
            />
          )}

          {artErrored && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface-hover)]">
              <span className="text-lg text-[var(--color-text-faint)]" style={{ fontFamily: "var(--font-display)" }}>
                {initials(displayName.text)}
              </span>
            </div>
          )}

          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.6) 100%), linear-gradient(to bottom, transparent 65%, color-mix(in srgb, ${rarityTint(character.rarity)} 8%, transparent) 100%)`,
            }}
          />

          <div className="absolute inset-x-0 bottom-0 h-[45%]">
            <Image
              src={rarityPlatePath(character.rarity)}
              alt=""
              fill
              sizes="96px"
              className="object-cover object-bottom"
            />
          </div>

          <div className="absolute inset-x-0 bottom-1.5 z-10 px-1">
            <span
              className={`block truncate text-center text-[0.55rem] font-semibold leading-tight text-white sm:text-[0.68rem] ${displayName.italic ? "italic" : ""}`}
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)", fontFamily: "var(--font-display)" }}
              title={displayName.text}
            >
              {displayName.text}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 sm:gap-2">
        {DECISION_OPTIONS.map((opt) => {
          const active = decision === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(active ? null : opt.value)}
              aria-pressed={active}
              className={`flex items-center justify-center rounded-lg border px-3 py-2 text-[0.75rem] font-semibold transition-colors sm:text-[0.85rem] ${
                active
                  ? opt.activeClass
                  : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-dim)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
