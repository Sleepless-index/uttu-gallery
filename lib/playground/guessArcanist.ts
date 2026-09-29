import type { RosterCharacter } from "@/lib/types";

export const MAX_GUESSES = 5;
export const GUESS_STORAGE_KEY = "r1999-guess-arcanist";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const RESET_OFFSET_MS = 10 * HOUR_MS;

export type GuessMode = "daily" | "unlimited";
export type Hint = "match" | "higher" | "lower" | "miss";
export type RoundStatus = "playing" | "won" | "lost";

export interface GuessComparison {
  rarity: Hint;
  afflatus: Hint;
  race: Hint;
  version: Hint;
}

export interface GameRound {
  targetId: number;
  guesses: number[];
}

export interface DailyRound extends GameRound {
  day: number;
}

export interface Streak {
  current: number;
  best: number;
  lastWonDay: number | null;
}

export interface GuessStore {
  daily: DailyRound | null;
  unlimited: GameRound | null;
  streak: Streak;
}

export function emptyStore(): GuessStore {
  return {
    daily: null,
    unlimited: null,
    streak: { current: 0, best: 0, lastWonDay: null },
  };
}

export function dailyIndex(now: number): number {
  return Math.floor((now - RESET_OFFSET_MS) / DAY_MS);
}

export function msUntilNextDaily(now: number): number {
  return (dailyIndex(now) + 1) * DAY_MS + RESET_OFFSET_MS - now;
}

export function roundStatus(round: GameRound): RoundStatus {
  if (round.guesses.includes(round.targetId)) return "won";
  if (round.guesses.length >= MAX_GUESSES) return "lost";
  return "playing";
}

export function effectiveStreak(streak: Streak, day: number): number {
  if (streak.lastWonDay === null) return 0;
  return streak.lastWonDay >= day - 1 ? streak.current : 0;
}

function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickDailyTarget(pool: RosterCharacter[], day: number): RosterCharacter {
  const sorted = [...pool].sort((a, b) => a.id - b.id);
  const random = mulberry32(day ^ 0x9e3779b9);
  random();
  return sorted[Math.floor(random() * sorted.length)];
}

export function pickRandomTarget(pool: RosterCharacter[], excludeId?: number): RosterCharacter {
  const candidates = pool.filter((c) => c.id !== excludeId);
  const source = candidates.length > 0 ? candidates : pool;
  return source[Math.floor(Math.random() * source.length)];
}

function compareVersion(guess: string | undefined, target: string | undefined): Hint {
  if (guess === target) return "match";
  const g = guess === undefined ? NaN : Number(guess);
  const t = target === undefined ? NaN : Number(target);
  if (Number.isNaN(g) || Number.isNaN(t)) return "miss";
  return t > g ? "higher" : "lower";
}

export function compareGuess(guess: RosterCharacter, target: RosterCharacter): GuessComparison {
  return {
    rarity:
      guess.rarity === target.rarity ? "match" : target.rarity > guess.rarity ? "higher" : "lower",
    afflatus: guess.afflatus === target.afflatus ? "match" : "miss",
    race: guess.race === target.race ? "match" : "miss",
    version: compareVersion(guess.version, target.version),
  };
}

function isRoundValid(round: GameRound | null, ids: ReadonlySet<number>): boolean {
  if (round === null) return false;
  return ids.has(round.targetId) && round.guesses.every((id) => ids.has(id));
}

export function needsRepair(store: GuessStore, pool: RosterCharacter[], day: number): boolean {
  if (pool.length === 0) return false;
  const ids = new Set(pool.map((c) => c.id));
  if (store.daily === null || store.daily.day !== day || !isRoundValid(store.daily, ids)) return true;
  return !isRoundValid(store.unlimited, ids);
}

export function ensureRounds(store: GuessStore, pool: RosterCharacter[], day: number): GuessStore {
  if (!needsRepair(store, pool, day)) return store;
  const ids = new Set(pool.map((c) => c.id));
  const daily =
    store.daily !== null && store.daily.day === day && isRoundValid(store.daily, ids)
      ? store.daily
      : { day, targetId: pickDailyTarget(pool, day).id, guesses: [] };
  const unlimited = isRoundValid(store.unlimited, ids)
    ? store.unlimited
    : { targetId: pickRandomTarget(pool).id, guesses: [] };
  return { ...store, daily, unlimited };
}

export function applyGuess(
  store: GuessStore,
  mode: GuessMode,
  guessId: number,
  day: number
): GuessStore {
  const round = mode === "daily" ? store.daily : store.unlimited;
  if (round === null) return store;
  if (roundStatus(round) !== "playing" || round.guesses.includes(guessId)) return store;

  const guesses = [...round.guesses, guessId];
  const status = roundStatus({ targetId: round.targetId, guesses });

  if (mode === "unlimited") {
    return { ...store, unlimited: { targetId: round.targetId, guesses } };
  }

  let streak = store.streak;
  if (status === "won" && streak.lastWonDay !== day) {
    const continues = streak.lastWonDay === day - 1;
    const current = continues ? streak.current + 1 : 1;
    streak = { current, best: Math.max(streak.best, current), lastWonDay: day };
  } else if (status === "lost") {
    streak = { ...streak, current: 0 };
  }
  return { ...store, daily: { day, targetId: round.targetId, guesses }, streak };
}

function isIdList(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((n) => typeof n === "number");
}

function readRound(value: unknown): GameRound | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.targetId !== "number" || !isIdList(record.guesses)) return null;
  return { targetId: record.targetId, guesses: record.guesses.slice(0, MAX_GUESSES) };
}

function readDaily(value: unknown): DailyRound | null {
  const round = readRound(value);
  if (round === null) return null;
  const day = (value as Record<string, unknown>).day;
  return typeof day === "number" ? { ...round, day } : null;
}

function readStreak(value: unknown): Streak {
  const fallback = emptyStore().streak;
  if (typeof value !== "object" || value === null) return fallback;
  const record = value as Record<string, unknown>;
  return {
    current: typeof record.current === "number" ? record.current : 0,
    best: typeof record.best === "number" ? record.best : 0,
    lastWonDay: typeof record.lastWonDay === "number" ? record.lastWonDay : null,
  };
}

export function loadStore(): GuessStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(GUESS_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      daily: readDaily(parsed.daily),
      unlimited: readRound(parsed.unlimited),
      streak: readStreak(parsed.streak),
    };
  } catch {
    return emptyStore();
  }
}

export function saveStore(store: GuessStore): void {
  try {
    window.localStorage.setItem(GUESS_STORAGE_KEY, JSON.stringify(store));
  } catch {
    return;
  }
}
