"use client";

import { useMemo } from "react";
import { NumberField } from "@/components/ui/NumberField";
import { MilestoneRow } from "@/components/planner/MilestoneRow";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { usePlannerState } from "@/lib/hooks/usePlannerState";
import { calculateMilestones } from "@/lib/calculations/pullPlanner";
import { CLEARDROP_RATES } from "@/lib/types";

const MILESTONE_LABELS = ["Base", "P1", "P2", "P3", "P4", "P5"];

export function PlannerView() {
  const { state, hydrated, update, reset } = usePlannerState();

  const totalPulls =
    Math.floor(state.cleardrops / CLEARDROP_RATES.perPull) +
    Math.floor(state.crystalDrops / CLEARDROP_RATES.perPull) +
    state.unilog;

  const milestones = useMemo(
    () =>
      calculateMilestones(totalPulls, 6, {
        pity: state.currentPity,
        guaranteed: state.guaranteed,
        copies: state.currentCopies,
      }),
    [totalPulls, state.currentPity, state.guaranteed, state.currentCopies]
  );

  const targetMilestone = milestones[state.targetCopies - 1];

  // Rough Album of the Lost estimate: every copy pulled beyond the target,
  // among 6-star pulls that aren't the featured character, converts to
  // Album once Portray is maxed. This is informational only — see note below.
  const albumEstimate = useMemo(() => {
    // Expected number of non-featured 6-star pulls within the pull budget,
    // used only as a rough side-estimate, not tied to any specific character.
    // We approximate using the overall 6-star rate (2.36%) minus expected
    // featured pulls implied by the milestone math.
    const expectedSixStars = Math.round(totalPulls * 0.0236);
    const expectedFeatured = Math.min(expectedSixStars, state.targetCopies);
    const expectedOffBanner = Math.max(0, expectedSixStars - expectedFeatured);
    return expectedOffBanner * 12;
  }, [totalPulls, state.targetCopies]);

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-[0.75rem] text-[var(--color-text-faint)]">Loading…</span>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-[1.1rem] font-semibold text-[var(--color-text)]">
              Pull Planner
            </h1>
            <InfoTooltip>
              Base 6★ rate is 1.5%, rising to 4% at pull 60 and +2.5% per
              pull after, guaranteed by pull 70. Each 6★ has a 50% chance of
              being the featured character — if not, the next 6★ is
              guaranteed to be. These odds are computed exactly, not
              simulated. Album of the Lost is a rough estimate only; the
              Pawnshop&apos;s monthly selection usually won&apos;t include
              whichever character you&apos;re currently planning for.
            </InfoTooltip>
          </div>
          <p className="text-[0.75rem] text-[var(--color-text-faint)]">
            Your odds of reaching a Portray target, given your pulls and pity.
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm("Reset the pull planner?")) reset();
          }}
          className="shrink-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[0.72rem] font-medium text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
          <h2 className="mb-3 text-[0.85rem] font-semibold text-[var(--color-text)]">
            Pulls &amp; Target
          </h2>
          <div className="flex flex-wrap gap-4">
            <NumberField
              label="Cleardrops"
              value={state.cleardrops}
              onChange={(v) => update({ cleardrops: v })}
              min={0}
            />
            <NumberField
              label="Crystal Drops"
              value={state.crystalDrops}
              onChange={(v) => update({ crystalDrops: v })}
              min={0}
            />
            <NumberField
              label="Unilog"
              value={state.unilog}
              onChange={(v) => update({ unilog: v })}
              min={0}
            />
            <NumberField
              label="Copies owned now"
              value={state.currentCopies}
              onChange={(v) => update({ currentCopies: Math.min(6, v) })}
              min={0}
              max={6}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {MILESTONE_LABELS.map((label, i) => (
              <button
                key={label}
                onClick={() => update({ targetCopies: i + 1 })}
                className={`rounded-lg px-3 py-1.5 text-[0.72rem] font-medium transition-colors
                  ${
                    state.targetCopies === i + 1
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--color-surface)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
          <h2 className="mb-3 text-[0.85rem] font-semibold text-[var(--color-text)]">
            Current pity
          </h2>
          <div className="flex flex-wrap items-end gap-4">
            <NumberField
              label="Pity counter"
              value={state.currentPity}
              onChange={(v) => update({ currentPity: Math.min(69, v) })}
              min={0}
              max={69}
            />
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[var(--color-text-dim)] underline decoration-[var(--color-border-strong)] underline-offset-2">
                Guaranteed
              </span>
              <div className="flex overflow-hidden rounded-lg border border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => update({ guaranteed: true })}
                  aria-pressed={state.guaranteed}
                  className={`flex h-9 w-14 items-center justify-center text-base font-semibold transition-colors
                    ${
                      state.guaranteed
                        ? "bg-[var(--color-accent)] text-white"
                        : "bg-[var(--color-surface)] text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
                    }`}
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => update({ guaranteed: false })}
                  aria-pressed={!state.guaranteed}
                  className={`flex h-9 w-14 items-center justify-center text-base font-semibold transition-colors
                    ${
                      !state.guaranteed
                        ? "bg-[var(--color-accent)] text-white"
                        : "bg-[var(--color-surface)] text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
                    }`}
                >
                  ✗
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
        <div className="mb-3 grid grid-cols-[1fr_1.5fr_1.5fr] gap-4 px-0">
          <h2 className="text-[0.85rem] font-semibold text-[var(--color-text)]">
            Goal
          </h2>
          <span className="text-center text-[0.65rem] font-medium uppercase tracking-wide text-[var(--color-text-faint)]">
            Chance w/ {totalPulls}
          </span>
          <span className="text-center text-[0.65rem] font-medium uppercase tracking-wide text-[var(--color-text-faint)]">
            Avg Unilogs
          </span>
        </div>
        <div className="flex flex-col gap-1">
          {milestones.map((m) => (
            <MilestoneRow
              key={m.copies}
              label={m.label === "Base copy" ? "Base" : m.label}
              successChance={m.successChance}
              averagePulls={m.averagePulls}
              reached={state.currentCopies >= m.copies}
            />
          ))}
        </div>
      </div>
    </>
  );
}
