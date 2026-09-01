/**
 * Exact-probability pull planner math for Reverse: 1999's 6★ gacha system.
 *
 * Mechanics:
 * - Base 6★ rate: 1.5%
 * - Soft pity: from 60th pull, 4%, then +2.5% per pull
 * - Hard pity: guaranteed at 70th pull
 * - 50/50 on 6★: featured or guaranteed next
 * - Pity and guarantee carry over between banners
 */

export interface PlannerStartState {
  /** Pulls since the last 6★. */
  pity: number;
  /** Whether the next 6★ is guaranteed featured. */
  guaranteed: boolean;
  /** Copies of the featured character already owned. */
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
 * `numPulls` additional pulls, starting from `start`.
 */
export function copyDistribution(
  numPulls: number,
  maxCopies: number,
  start: PlannerStartState
): Map<number, number> {
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
      add(key(pity + 1, guaranteed, copies), prob * (1 - p6));
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
  /** Expected (average) number of pulls needed to reach this milestone. */
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

/** Expected number of additional pulls to reach `targetCopies`. */
function averagePullsForMilestone(
  targetCopies: number,
  start: PlannerStartState
): number {
  const SAFETY_CAP = 2000;
  const key = (pity: number, guaranteed: boolean, copies: number) =>
    pity * 100000 + (guaranteed ? 50000 : 0) + copies;

  let state = new Map<number, number>();
  state.set(key(start.pity, start.guaranteed, start.copies), 1);

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