"use client";

import Image from "next/image";
import { parseDisplayName } from "@/lib/data/roster";
import { afflatusIconPath, characterArtPath } from "@/lib/assets/characterAssets";
import type { GuessComparison, Hint } from "@/lib/playground/guessArcanist";
import type { RosterCharacter } from "@/lib/types";

export const GUESS_GRID = "grid grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))] gap-1.5 sm:gap-2";

const HINT_STYLE: Record<Hint, string> = {
  match: "border-[var(--color-success)] bg-[var(--color-success)]/20 text-[var(--color-text)]",
  higher: "border-[var(--color-portrait-bar)] bg-[var(--color-portrait-bar)]/15 text-[var(--color-text)]",
  lower: "border-[var(--color-portrait-bar)] bg-[var(--color-portrait-bar)]/15 text-[var(--color-text)]",
  miss: "border-[var(--color-danger)] bg-[var(--color-danger)]/15 text-[var(--color-text)]",
};

const HINT_LABEL: Record<Hint, string> = {
  match: "matches",
  higher: "answer is higher",
  lower: "answer is lower",
  miss: "does not match",
};

function Arrow({ direction }: { direction: "up" | "down" }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path
        d={direction === "up" ? "M5 8.5V1.8M2 4.5 5 1.5l3 3" : "M5 1.5v6.7M2 5.5l3 3 3-3"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface HintCellProps {
  hint: Hint;
  field: string;
  index: number;
  animate: boolean;
  children: React.ReactNode;
}

function HintCell({ hint, field, index, animate, children }: HintCellProps) {
  return (
    <div
      role="group"
      aria-label={`${field} ${HINT_LABEL[hint]}`}
      className={`flex h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-md border px-1 text-center text-[0.7rem] font-semibold leading-tight ${HINT_STYLE[hint]} ${
        animate ? "animate-search-result" : ""
      }`}
      style={animate ? ({ "--search-result-delay": `${(index + 1) * 110}ms` } as React.CSSProperties) : undefined}
    >
      {children}
      {hint === "higher" && <Arrow direction="up" />}
      {hint === "lower" && <Arrow direction="down" />}
    </div>
  );
}

interface GuessRowProps {
  guess: RosterCharacter;
  comparison: GuessComparison;
  animate: boolean;
}

export function GuessRow({ guess, comparison, animate }: GuessRowProps) {
  const label = parseDisplayName(guess.name).text;

  return (
    <div className={GUESS_GRID}>
      <div className="flex h-12 min-w-0 items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] pr-2">
        <span className="relative h-full w-10 shrink-0 overflow-hidden rounded-l-md sm:w-12">
          <Image src={characterArtPath(guess.id)} alt="" fill sizes="48px" className="object-cover object-top" />
        </span>
        <span className="min-w-0 truncate text-[0.7rem] font-semibold text-[var(--color-text)] sm:text-[0.75rem]">
          {label}
        </span>
      </div>

      <HintCell hint={comparison.rarity} field="Rarity" index={0} animate={animate}>
        <span>{guess.rarity}★</span>
      </HintCell>

      <HintCell hint={comparison.afflatus} field="Afflatus" index={1} animate={animate}>
        <span className="relative h-6 w-6">
          <Image src={afflatusIconPath(guess.afflatus)} alt={guess.afflatus} fill sizes="24px" className="object-contain" />
        </span>
      </HintCell>

      <HintCell hint={comparison.race} field="Race" index={2} animate={animate}>
        <span className="max-w-full truncate">{guess.race}</span>
      </HintCell>

      <HintCell hint={comparison.version} field="Version" index={3} animate={animate}>
        <span>{guess.version ?? "?"}</span>
      </HintCell>
    </div>
  );
}
