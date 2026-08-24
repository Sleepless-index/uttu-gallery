import { CLEARDROP_RATES, countDayOfMonthInRange, type CleardropPatchState } from "@/lib/types";

export interface CleardropSource {
  key: string;
  label: string;
  total: number;
  color: string;
}

export interface CleardropBreakdown {
  patchDays: number;
  dailyTotal: number;
  weeklyTotal: number;
  limboTotal: number;
  lucidscapeTotal: number;
  extraTotal: number;
  monthlyCardCleardropTotal: number;
  monthlyCardCrystalTotal: number;
  battlePassCleardropTotal: number;
  battlePassUnilogTotal: number;
  cleardropGrandTotal: number;
  /** Cleardrops converted to pulls, floored (180 per pull). */
  cleardropPulls: number;
  /** Leftover Cleardrops that don't make a full pull. */
  cleardropRemainder: number;
  /** Pulls from Unilog (1:1, includes manual entry + Battle Pass) and Crystal Drops. */
  unilogTotal: number;
  unilogPulls: number;
  crystalDropTotal: number;
  crystalDropPulls: number;
  crystalDropRemainder: number;
  /** Everything combined into a single "total pulls available" figure. */
  totalPulls: number;
  /** Non-zero income sources, for donut chart / table rendering. */
  sources: CleardropSource[];
  /** Average Cleardrop income, derived from the total spread across the patch. */
  avgPerDay: number;
  avgPerWeek: number;
  avgPerMonth: number;
}

/** Days spanned by an inclusive start/end date range, in YYYY-MM-DD format. */
export function daysBetween(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  return Math.max(0, diff);
}


/**
 * Limbo cycles cleared, auto-derived from the patch date range.
 * Limbo resets on the 16th of every month, so this counts how many
 * 16ths fall within the range — 0 if the range doesn't span one.
 */
export function limboCyclesFromPatchDates(startDate: string, endDate: string): number {
  return countDayOfMonthInRange(startDate, endDate, 16);
}

/**
 * Lucidscape cycles cleared, auto-derived from the patch date range.
 * Lucidscape resets on the 1st of every month, so this counts how many
 * 1sts fall within the range — 0 if the range doesn't span one.
 */
export function lucidscapeCyclesFromPatchDates(startDate: string, endDate: string): number {
  return countDayOfMonthInRange(startDate, endDate, 1);
}

const SOURCE_COLORS = {
  daily: "#c86029",
  weekly: "#4f8fd9",
  limbo: "#5fb87a",
  lucidscape: "#e0b84f",
  extra: "#9a9fab",
  monthlyCard: "#d97b4f",
  battlePass: "#a37bd9",
} as const;

export function calculateCleardrops(state: CleardropPatchState): CleardropBreakdown {
  const patchDays = daysBetween(state.startDate, state.endDate);
  const weeks = patchDays / 7;

  const dailyTotal = Math.round(patchDays * CLEARDROP_RATES.dailyPerDay);
  const weeklyTotal = Math.round(weeks * CLEARDROP_RATES.weeklyPerWeek);
  const limboTotal = state.limboCycles * CLEARDROP_RATES.limboPerCycle;
  const lucidscapeTotal = state.lucidscapeCycles * CLEARDROP_RATES.lucidscapePerCycle;
  const extraTotal = Math.max(0, state.extraCleardrops);

  const monthlyCardCleardropTotal = state.monthlyCard
    ? CLEARDROP_RATES.monthlyCardCleardrops
    : 0;
  const monthlyCardCrystalTotal = state.monthlyCard
    ? CLEARDROP_RATES.monthlyCardCrystalDrops
    : 0;

  const battlePassRates = CLEARDROP_RATES.battlePass[state.battlePassTier];
  const battlePassCleardropTotal = state.battlePass ? battlePassRates.cleardrops : 0;
  const battlePassUnilogTotal = state.battlePass ? battlePassRates.unilog : 0;

  const cleardropGrandTotal =
    dailyTotal +
    weeklyTotal +
    limboTotal +
    lucidscapeTotal +
    extraTotal +
    monthlyCardCleardropTotal +
    battlePassCleardropTotal;

  const cleardropPulls = Math.floor(cleardropGrandTotal / CLEARDROP_RATES.perPull);
  const cleardropRemainder = cleardropGrandTotal % CLEARDROP_RATES.perPull;

  const crystalDropTotal = Math.max(0, state.crystalDrops) + monthlyCardCrystalTotal;
  const crystalDropPulls = Math.floor(crystalDropTotal / CLEARDROP_RATES.perPull);
  const crystalDropRemainder = crystalDropTotal % CLEARDROP_RATES.perPull;

  const unilogTotal = Math.max(0, state.unilog) + battlePassUnilogTotal;
  const unilogPulls = unilogTotal;

  const totalPulls = cleardropPulls + crystalDropPulls + unilogPulls;

  const sources: CleardropSource[] = [
    { key: "daily", label: "Daily tasks", total: dailyTotal, color: SOURCE_COLORS.daily },
    { key: "weekly", label: "Weekly tasks", total: weeklyTotal, color: SOURCE_COLORS.weekly },
    { key: "limbo", label: "Limbo", total: limboTotal, color: SOURCE_COLORS.limbo },
    { key: "lucidscape", label: "Lucidscape", total: lucidscapeTotal, color: SOURCE_COLORS.lucidscape },
    { key: "extra", label: "Extra / events", total: extraTotal, color: SOURCE_COLORS.extra },
    { key: "monthlyCard", label: "Monthly Card", total: monthlyCardCleardropTotal, color: SOURCE_COLORS.monthlyCard },
    { key: "battlePass", label: "Battle Pass", total: battlePassCleardropTotal, color: SOURCE_COLORS.battlePass },
  ].filter((s) => s.total > 0);

  // Average income reflects only recurring Daily/Weekly task income — Limbo,
  // Lucidscape, subscriptions, and one-off extras are excluded since they're
  // not a steady per-day rate and would otherwise inflate this figure.
  const avgPerDay = CLEARDROP_RATES.dailyPerDay;
  const avgPerWeek = avgPerDay * 7 + CLEARDROP_RATES.weeklyPerWeek;
  // "Per month" scales with the actual patch length (N days), not a flat 30
  // days — dailies across all N days, plus however many weekly payouts land
  // in that same N-day span.
  const avgPerMonth = dailyTotal + weeklyTotal;

  return {
    patchDays,
    dailyTotal,
    weeklyTotal,
    limboTotal,
    lucidscapeTotal,
    extraTotal,
    monthlyCardCleardropTotal,
    monthlyCardCrystalTotal,
    battlePassCleardropTotal,
    battlePassUnilogTotal,
    cleardropGrandTotal,
    cleardropPulls,
    cleardropRemainder,
    unilogTotal,
    unilogPulls,
    crystalDropTotal,
    crystalDropPulls,
    crystalDropRemainder,
    totalPulls,
    sources,
    avgPerDay,
    avgPerWeek,
    avgPerMonth,
  };
}
