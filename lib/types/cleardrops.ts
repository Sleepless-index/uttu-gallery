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

export const emptyCleardropState = (): CleardropPatchState => ({
  ...defaultDateRange(),
  limboCycles: 1,
  lucidscapeCycles: 1,
  extraCleardrops: 0,
  unilog: 0,
  crystalDrops: 0,
  monthlyCard: false,
  battlePass: false,
  battlePassTier: "collectors",
});
