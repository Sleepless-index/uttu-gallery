import { CLEARDROP_RATES, type CleardropPatchState } from "@/lib/types";

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

const SOURCE_COLORS = {
  daily: "#7c6df2",
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

  const avgPerDay = patchDays > 0 ? Math.round(cleardropGrandTotal / patchDays) : 0;
  const avgPerWeek = patchDays > 0 ? Math.round(cleardropGrandTotal / (patchDays / 7)) : 0;
  const avgPerMonth = patchDays > 0 ? Math.round(cleardropGrandTotal / (patchDays / 30.44)) : 0;

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
