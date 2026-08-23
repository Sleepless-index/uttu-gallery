"use client";

import Image from "next/image";
import { NumberField } from "@/components/ui/NumberField";
import { CheckToggle } from "@/components/ui/CheckToggle";
import { DateRangeField } from "@/components/ui/DateRangeField";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DonutChart } from "@/components/ui/DonutChart";
import { SourceTable } from "@/components/cleardrops/SourceTable";
import { AverageIncomeRow } from "@/components/cleardrops/AverageIncomeRow";
import { ConversionTile } from "@/components/cleardrops/ConversionTile";
import { useCleardropState } from "@/lib/hooks/useCleardropState";
import { calculateCleardrops, limboCyclesFromPatchDates, lucidscapeCyclesFromPatchDates } from "@/lib/calculations/cleardrops";
import { CLEARDROP_RATES } from "@/lib/types";
import { CURRENCY_ICONS } from "@/lib/assets/currencyAssets";

export function CleardropsView() {
  const { state, hydrated, update, reset } = useCleardropState();
  const breakdown = calculateCleardrops(state);

  // Limbo resets on the 16th of each month, Lucidscape on the 1st — cycles
  // cleared auto-follows how many of each reset date fall in the patch
  // range. Recalculated on every date change; still a plain NumberField
  // underneath, so it stays manually overridable afterward.
  function handleDateChange(patch: { startDate?: string; endDate?: string }) {
    const nextStart = patch.startDate ?? state.startDate;
    const nextEnd = patch.endDate ?? state.endDate;
    // While picking a new range, the end date is briefly cleared — skip
    // recalculating cycles until both dates are set again, so it doesn't
    // momentarily zero them out mid-pick.
    if (!nextStart || !nextEnd) {
      update(patch);
      return;
    }
    update({
      ...patch,
      limboCycles: limboCyclesFromPatchDates(nextStart, nextEnd),
      lucidscapeCycles: lucidscapeCyclesFromPatchDates(nextStart, nextEnd),
    });
  }

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-sm text-[var(--color-text-faint)]">Loading…</span>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-text)]">Cleardrops</h1>
          <p className="mt-0.5 text-sm text-[var(--color-text-faint)]">
            See how many pulls a patch is worth.
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm("Reset this patch's Cleardrop inputs?")) reset();
          }}
          className="shrink-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-sm font-medium text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        {/* Inputs */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
            <SectionHeader
              title="Patch dates"
              info="Full patches typically run about 42 days (6 weeks) per patch, often split into two banner phases."
            />
            <DateRangeField
              label="Date range"
              startDate={state.startDate}
              endDate={state.endDate}
              onStartChange={(v) => handleDateChange({ startDate: v })}
              onEndChange={(v) => handleDateChange({ endDate: v })}
            />
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
            <SectionHeader
              title="Endgame cycles"
              info="Limbo and Lucidscape each pay 700 Cleardrops per full clear. Limbo resets on the 16th, Lucidscape on the 1st — auto-filled from your patch dates."
            />
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="Limbo cycles cleared"
                value={state.limboCycles}
                onChange={(v) => update({ limboCycles: v })}
                min={0}
                max={6}
              />
              <NumberField
                label="Lucidscape cycles cleared"
                value={state.lucidscapeCycles}
                onChange={(v) => update({ lucidscapeCycles: v })}
                min={0}
                max={6}
              />
            </div>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
            <SectionHeader
              title="Subscriptions"
              info="Check the ones you're subscribed to this patch — their income gets added to the breakdown automatically."
            />
            <div className="flex flex-col gap-1">
              <CheckToggle
                label="Monthly Card (Roaring Month)"
                description={`${CLEARDROP_RATES.monthlyCardCleardrops.toLocaleString()} Cleardrops + ${CLEARDROP_RATES.monthlyCardCrystalDrops} Crystal Drops`}
                checked={state.monthlyCard}
                onChange={(v) => update({ monthlyCard: v })}
              />
              <CheckToggle
                label="Battle Pass (Roar Jukebox)"
                description={
                  state.battlePassTier === "deluxe"
                    ? `${CLEARDROP_RATES.battlePass.deluxe.unilog} Unilog + ${CLEARDROP_RATES.battlePass.deluxe.cleardrops} Cleardrops`
                    : `${CLEARDROP_RATES.battlePass.collectors.unilog} Unilog`
                }
                checked={state.battlePass}
                onChange={(v) => update({ battlePass: v })}
              />
              {state.battlePass && (
                <div className="ml-7 flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5">
                  <button
                    onClick={() => update({ battlePassTier: "collectors" })}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors
                      ${
                        state.battlePassTier === "collectors"
                          ? "bg-[var(--color-accent)] text-white"
                          : "text-[var(--color-text-faint)] hover:text-[var(--color-text-dim)]"
                      }`}
                  >
                    Collector&apos;s
                  </button>
                  <button
                    onClick={() => update({ battlePassTier: "deluxe" })}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors
                      ${
                        state.battlePassTier === "deluxe"
                          ? "bg-[var(--color-accent)] text-white"
                          : "text-[var(--color-text-faint)] hover:text-[var(--color-text-dim)]"
                      }`}
                  >
                    Deluxe
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
            <SectionHeader
              title="Other currency"
              info="1 Unilog = 1 pull. 180 Crystal Drops = 1 pull. Add anything from events or codes as Extra Cleardrops."
            />
            <div className="flex flex-wrap gap-4">
              <NumberField
                label="Extra Cleardrops"
                value={state.extraCleardrops}
                onChange={(v) => update({ extraCleardrops: v })}
                min={0}
              />
              <NumberField
                label="Unilog"
                value={state.unilog}
                onChange={(v) => update({ unilog: v })}
                min={0}
              />
              <NumberField
                label="Crystal Drops"
                value={state.crystalDrops}
                onChange={(v) => update({ crystalDrops: v })}
                min={0}
              />
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
            <SectionHeader
              title="Income by source"
              info="How your total Cleardrops break down across Daily, Weekly, Limbo, Lucidscape, and any subscriptions or extras."
            />
            {breakdown.sources.length === 0 ? (
              <p className="py-6 text-center text-sm text-[var(--color-text-faint)]">
                Set a date range to see your income breakdown.
              </p>
            ) : (
              <div className="flex flex-col items-center gap-5 sm:flex-row">
                <DonutChart
                  slices={breakdown.sources.map((s) => ({
                    label: s.label,
                    value: s.total,
                    color: s.color,
                  }))}
                  centerValue={breakdown.cleardropGrandTotal.toLocaleString()}
                  centerLabel="Total Cleardrops"
                  size={140}
                />
                <div className="w-full">
                  <SourceTable sources={breakdown.sources} total={breakdown.cleardropGrandTotal} />
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
            <SectionHeader
              title="Average Income"
              info="Recurring Daily/Weekly task income only — Limbo, Lucidscape, and subscriptions aren't a steady rate, so they're left out here."
            />
            <AverageIncomeRow
              perDay={breakdown.avgPerDay}
              perWeek={breakdown.avgPerWeek}
              perMonth={breakdown.avgPerMonth}
            />
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
            <SectionHeader
              title="Conversion Summary"
              info="Unilog pulls is your grand total — Cleardrops, Crystal Drops, and Unilog all converted and combined into one pull count."
            />
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <ConversionTile
                label="Cleardrops pulls"
                count={breakdown.cleardropPulls}
                iconSrc={CURRENCY_ICONS.cleardrops}
              />
              <ConversionTile
                label="Crystal Drop pulls"
                count={breakdown.crystalDropPulls}
                iconSrc={CURRENCY_ICONS.crystalDrops}
              />
            </div>

            <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
              <span className="text-lg font-semibold text-[var(--color-text)]">≈</span>
              <div className="relative h-8 w-8 shrink-0">
                <Image src={CURRENCY_ICONS.unilog} alt="" fill sizes="32px" className="object-contain" />
              </div>
              <span className="font-mono text-lg font-bold tabular-nums text-[var(--color-text)]">
                {breakdown.totalPulls}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
