/** Confirmed F2P income constants (Prydwen Institute + official patch notes, 2026).
 * Used to convert a Cleardrops/Crystal Drops balance into an estimated
 * pull count. Kept here rather than a standalone file since the Pull
 * Planner is the only feature that still needs this. */
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

export interface PlannerState {
  /** Cleardrops currently available. */
  cleardrops: number;
  /** Crystal Drops currently available. */
  crystalDrops: number;
  /** Unilog currently available (1:1 with pulls). */
  unilog: number;
  /** Pulls since the last 6★ obtained on this shared pity track. */
  currentPity: number;
  /** Whether the next 6★ is guaranteed to be the featured character. */
  guaranteed: boolean;
  /** Copies of the target character already owned (0 = don't have yet). */
  currentCopies: number;
  /** How many total copies (1 = base, up to 6 = P5) the player is aiming for. */
  targetCopies: number;
}

export const emptyPlannerState = (): PlannerState => ({
  cleardrops: 0,
  crystalDrops: 0,
  unilog: 0,
  currentPity: 0,
  guaranteed: false,
  currentCopies: 0,
  targetCopies: 1,
});
