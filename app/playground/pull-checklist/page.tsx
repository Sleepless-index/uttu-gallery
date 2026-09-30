"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { parseDisplayName } from "@/lib/data/roster";
import { useTrackerState } from "@/lib/hooks/useTrackerState";
import { useGuessArcanist } from "@/lib/hooks/useGuessArcanist";
import { afflatusIconPath, characterArtPath } from "@/lib/assets/characterAssets";
import {
  MAX_GUESSES,
  compareGuess,
  msUntilNextDaily,
  type GuessMode,
} from "@/lib/playground/guessArcanist";
import { ArcanistSearch } from "@/components/playground/ArcanistSearch";
import { GUESS_GRID, GuessRow } from "@/components/playground/GuessRow";

const COLUMNS = ["Arcanist", "Rarity", "Afflatus", "Race", "Version"];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function Countdown() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(msUntilNextDaily(Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (remaining === null) return null;
  const total = Math.max(0, Math.floor(remaining / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  return (
    <span className="tabular-nums">
      {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </span>
  );
}

const MODES: { key: GuessMode; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "unlimited", label: "Unlimited" },
];

export default function GuessArcanistPage() {
  const { state, hydrated } = useTrackerState();
  const game = useGuessArcanist(state.settings.hideCn, hydrated);
  const { mode, guesses, target, status, pool } = game;

  const guessedIds = useMemo(() => new Set(guesses.map((g) => g.id)), [guesses]);
  const emptySlots = Math.max(0, MAX_GUESSES - guesses.length);
  const finished = status !== "playing";

  if (!game.ready || !target) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[var(--color-bg)]">
        <span className="text-[0.75rem] text-[var(--color-text-faint)]">Loading…</span>
      </div>
    );
  }

  const targetLabel = parseDisplayName(target.name).text;

  return (
    <div className="flex flex-col bg-[var(--color-bg)]">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5">
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => game.setMode(m.key)}
                aria-pressed={mode === m.key}
                className={`rounded-md px-3 py-1.5 text-[0.75rem] font-medium transition-colors ${
                  mode === m.key
                    ? "bg-[var(--color-accent)] text-white"
                    : "text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[0.72rem] text-[var(--color-text-dim)]">
            {mode === "daily" && (
              <span>
                Streak <strong className="font-semibold text-[var(--color-text)]">{game.streak}</strong>
                <span className="text-[var(--color-text-faint)]"> · Best {game.bestStreak}</span>
              </span>
            )}
            <span>
              Guess{" "}
              <strong className="font-semibold text-[var(--color-text)]">
                {Math.min(guesses.length + (finished ? 0 : 1), MAX_GUESSES)}
              </strong>{" "}
              of {MAX_GUESSES}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 sm:gap-2">
          <div className={GUESS_GRID}>
            {COLUMNS.map((column) => (
              <span
                key={column}
                className="truncate px-1 text-center text-[0.6rem] font-semibold uppercase tracking-wide text-[var(--color-text-faint)] first:text-left"
              >
                {column}
              </span>
            ))}
          </div>

          {guesses.map((guess, index) => (
            <GuessRow
              key={guess.id}
              guess={guess}
              comparison={compareGuess(guess, target)}
              animate={guess.id === game.freshId && index === guesses.length - 1}
            />
          ))}

          {Array.from({ length: emptySlots }).map((_, index) => (
            <div key={`empty-${index}`} className={GUESS_GRID}>
              <div className="col-span-5 h-12 rounded-md border border-dashed border-[var(--color-border)]" />
            </div>
          ))}
        </div>

        {finished ? (
          <section
            aria-live="polite"
            className="flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4"
          >
            <div
              className="relative w-20 shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)]"
              style={{ aspectRatio: "224 / 524" }}
            >
              <Image src={characterArtPath(target.id)} alt={targetLabel} fill sizes="80px" className="object-cover" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span
                  className={`text-[0.65rem] font-semibold uppercase tracking-[0.16em] ${
                    status === "won" ? "text-[var(--color-success)]" : "text-[var(--color-text-faint)]"
                  }`}
                >
                  {status === "won"
                    ? `Solved in ${guesses.length} ${guesses.length === 1 ? "guess" : "guesses"}`
                    : "Out of guesses"}
                </span>
                <h2
                  className="flex items-center gap-2 text-[1.6rem] font-bold leading-tight tracking-tight text-[var(--color-text)] sm:text-[1.9rem]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  <span className="relative inline-block h-5 w-5 shrink-0 sm:h-6 sm:w-6">
                    <Image src={afflatusIconPath(target.afflatus)} alt={target.afflatus} fill sizes="24px" className="object-contain" />
                  </span>
                  <span className="truncate">{targetLabel}</span>
                </h2>
              </div>

              <div className="border-t border-[var(--color-border)] pt-3">
                {mode === "unlimited" ? (
                  <button
                    type="button"
                    onClick={game.newUnlimited}
                    className="w-fit rounded-lg bg-[var(--color-accent)] px-3.5 py-2 text-[0.75rem] font-semibold tracking-wide text-white transition-colors hover:bg-[var(--color-accent-hover)]"
                  >
                    New arcanist
                  </button>
                ) : (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-faint)]">
                      Next daily arcanist in
                    </span>
                    <span className="font-mono text-[1.05rem] font-medium text-[var(--color-text)]">
                      <Countdown />
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : (
          <ArcanistSearch
            key={mode}
            pool={pool}
            excludedIds={guessedIds}
            onPick={game.submitGuess}
          />
        )}
      </main>
    </div>
  );
}
