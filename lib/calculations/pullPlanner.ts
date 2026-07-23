/**
 * Exact-probability pull planner math for Reverse: 1999's 6★ gacha system.
 *
 * Confirmed mechanics (Prydwen Institute + in-game banner text, 2026):
 * - Base 6★ rate: 1.5%
 * - Soft pity: from the 60th consecutive pull with no 6★, rate jumps to 4%,
 *   then +2.5% per pull after that
 * - Hard pity: guaranteed 6★ at the 70th consecutive pull
 * - On any 6★ pull: 50% chance it's the featured (rate-up) character. If not,
 *   the *next* 6★ pulled is guaranteed to be the featured character.
 * - Pity and guarantee state carry over between banners of the same
 *   "Time-Limited Character Banner" type — they do not reset when a banner ends.
 *
 * This computes an exact probability distribution via dynamic programming
 * over (pity counter, guarantee flag, copies obtained), rather than Monte
 * Carlo simulation — matching the approach of reference planners for other
 * gacha games.
 */

export interface PlannerStartState {
  /** Pulls since the last 6★, on this banner's shared pity track. */
  pity: number;
  /** Whether the next 6★ pulled is guaranteed to be the featured character. */
  guaranteed: boolean;
  /** Copies of the featured character already owned (0 = don't have them yet). */
  copies: number;
}

/** 6★ rate on the pull immediately following `pity` pull-less pulls. */
function rateAt(pity: number): number {
  const n = pity + 1;
  if (n <= 59) return 0.015;
  if (n === 60) return 0.04;
  if (n >= 70) return 1;
  return Math.min(1, 0.04 + 0.025 * (n - 60));
}

/**
 * Returns the probability distribution over "copies obtained" after
 * `numPulls` additional pulls, starting from `start`. Copies are capped at
 * `maxCopies` (6, for P5) — once reached, further pulls don't change the
 * copy count but pity/guarantee bookkeeping is dropped since it no longer
 * matters for this milestone.
 */
export function copyDistribution(
  numPulls: number,
  maxCopies: number,
  start: PlannerStartState
): Map<number, number> {
  // Key encodes (pity, guaranteed, copies) as a single number for a fast Map.
  const key = (pity: number, guaranteed: boolean, copies: number) =>
    pity * 100000 + (guaranteed ? 50000 : 0) + copies;

  let state = new Map<number, number>();
  state.set(key(start.pity, start.guaranteed, start.copies), 1);

  for (let i = 0; i < numPulls; i++) {
    const next = new Map<number, number>();
    const add = (k: number, p: number) => {
      if (p === 0) return;
      next.set(k, (next.get(k) ?? 0) + p);
    };

    for (const [k, prob] of state) {
      if (prob === 0) continue;
      const copies = k % 50000;
      const guaranteed = Math.floor(k / 50000) % 2 === 1;
      const pity = Math.floor(k / 100000);

      if (copies >= maxCopies) {
        add(key(pity, guaranteed, copies), prob);
        continue;
      }

      const p6 = rateAt(pity);
      // No 6★ this pull.
      add(key(pity + 1, guaranteed, copies), prob * (1 - p6));
      // 6★ this pull.
      if (guaranteed) {
        add(key(0, false, copies + 1), prob * p6);
      } else {
        add(key(0, false, copies + 1), prob * p6 * 0.5);
        add(key(0, true, copies), prob * p6 * 0.5);
      }
    }
    state = next;
  }

  const result = new Map<number, number>();
  for (const [k, prob] of state) {
    const copies = k % 50000;
    result.set(copies, (result.get(copies) ?? 0) + prob);
  }
  return result;
}

export interface MilestoneResult {
  /** Copies required for this milestone (1 = base copy, up to 6 = P5). */
  copies: number;
  label: string;
  /** Chance of reaching this milestone within the given pull budget. */
  successChance: number;
  /** Expected (average) number of pulls needed to reach this milestone, unbounded. */
  averagePulls: number;
}

const MILESTONE_LABELS = ["Base copy", "P1", "P2", "P3", "P4", "P5"];

/**
 * Computes success chance (within `availablePulls`) and average pulls needed
 * for each copy milestone from 1 through `maxCopies`.
 */
export function calculateMilestones(
  availablePulls: number,
  maxCopies: number,
  start: PlannerStartState
): MilestoneResult[] {
  const dist = copyDistribution(availablePulls, maxCopies, start);

  const results: MilestoneResult[] = [];
  for (let m = 1; m <= maxCopies; m++) {
    let successChance = 0;
    for (const [copies, prob] of dist) {
      if (copies >= m) successChance += prob;
    }
    const averagePulls = averagePullsForMilestone(m, start);
    results.push({
      copies: m,
      label: MILESTONE_LABELS[m - 1] ?? `${m} copies`,
      successChance,
      averagePulls,
    });
  }
  return results;
}

/**
 * Expected number of additional pulls to reach `targetCopies`, computed by
 * summing the tail probabilities of the "pulls needed" distribution
 * (E[X] = sum P(X > n) for n = 0, 1, 2, ...). Walks the DP forward once,
 * incrementally, rather than recomputing the whole distribution per step.
 */
function averagePullsForMilestone(
  targetCopies: number,
  start: PlannerStartState
): number {
  const SAFETY_CAP = 2000;
  const key = (pity: number, guaranteed: boolean, copies: number) =>
    pity * 100000 + (guaranteed ? 50000 : 0) + copies;

  let state = new Map<number, number>();
  state.set(key(start.pity, start.guaranteed, start.copies), 1);

  // If the start state already meets the milestone, zero pulls needed.
  if (start.copies >= targetCopies) return 0;

  let expected = 0;
  for (let n = 0; n < SAFETY_CAP; n++) {
    const next = new Map<number, number>();
    const add = (k: number, p: number) => {
      if (p === 0) return;
      next.set(k, (next.get(k) ?? 0) + p);
    };

    let pNotYetReached = 0;
    for (const [k, prob] of state) {
      if (prob === 0) continue;
      const copies = k % 50000;
      const guaranteed = Math.floor(k / 50000) % 2 === 1;
      const pity = Math.floor(k / 100000);

      if (copies >= targetCopies) {
        // Already reached; stop tracking this branch's pity/guarantee (frozen).
        add(key(pity, guaranteed, copies), prob);
        continue;
      }

      pNotYetReached += prob;
      const p6 = rateAt(pity);
      add(key(pity + 1, guaranteed, copies), prob * (1 - p6));
      if (guaranteed) {
        add(key(0, false, copies + 1), prob * p6);
      } else {
        add(key(0, false, copies + 1), prob * p6 * 0.5);
        add(key(0, true, copies), prob * p6 * 0.5);
      }
    }

    if (pNotYetReached < 1e-9) break;
    expected += pNotYetReached;
    state = next;
  }
  return expected;
}
