export type BattlePassTier = "collectors" | "deluxe";

/** Confirmed F2P income constants (Prydwen Institute + official patch notes, 2026). */
export const CLEARDROP_RATES = {
  dailyPerDay: 90,
  weeklyPerWeek: 100,
  limboPerCycle: 700,
  lucidscapePerCycle: 700,
  perPull: 180,
  /** Monthly Card ("Roaring Month"): 30-day sub, 90 Cleardrops/day + 300 Crystal Drops upfront. */
  monthlyCardCleardrops: 2700,
  monthlyCardCrystalDrops: 300,
  /**
   * Battle Pass ("Roar Jukebox"). Collector's grants 5 Unilog. Deluxe grants
   * everything Collector's does, plus 400 Cleardrops on top.
   */
  battlePass: {
    collectors: { unilog: 5, cleardrops: 0 },
    deluxe: { unilog: 5, cleardrops: 400 },
  },
} as const;

export interface CleardropPatchState {
  startDate: string;
  endDate: string;
  limboCycles: number;
  lucidscapeCycles: number;
  extraCleardrops: number;
  unilog: number;
  crystalDrops: number;
  monthlyCard: boolean;
  battlePass: boolean;
  battlePassTier: BattlePassTier;
}

function defaultDateRange(): { startDate: string; endDate: string } {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 41); // 42 days inclusive of start
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { startDate: fmt(start), endDate: fmt(end) };
}

/**
 * Counts how many times a given day-of-month occurs within an inclusive
 * start/end date range. Shared by the default state below and by the
 * cleardrops calculations module, since Limbo/Lucidscape both reset on a
 * fixed calendar day each month rather than a rolling window.
 */
export function countDayOfMonthInRange(startDate: string, endDate: string, dayOfMonth: number): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < start) return 0;

  let count = 0;
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor <= end) {
    const candidate = new Date(cursor.getFullYear(), cursor.getMonth(), dayOfMonth);
    if (candidate >= start && candidate <= end) {
      count += 1;
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return count;
}

export const emptyCleardropState = (): CleardropPatchState => {
  const { startDate, endDate } = defaultDateRange();
  return {
    startDate,
    endDate,
    // Limbo resets the 16th, Lucidscape the 1st — seed cycles from the
    // default 42-day range so the initial numbers are accurate, not just
    // a placeholder of 1.
    limboCycles: countDayOfMonthInRange(startDate, endDate, 16),
    lucidscapeCycles: countDayOfMonthInRange(startDate, endDate, 1),
    extraCleardrops: 0,
    unilog: 0,
    crystalDrops: 0,
    monthlyCard: false,
    battlePass: false,
    battlePassTier: "collectors",
  };
};
