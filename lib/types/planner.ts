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
