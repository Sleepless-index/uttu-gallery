"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { rosterById, visibleRoster } from "@/lib/data/roster";
import type { RosterCharacter } from "@/lib/types";
import {
  applyGuess,
  dailyIndex,
  effectiveStreak,
  emptyStore,
  ensureRounds,
  loadStore,
  needsRepair,
  pickRandomTarget,
  roundStatus,
  saveStore,
  type GuessMode,
  type GuessStore,
} from "@/lib/playground/guessArcanist";

export function useGuessArcanist(hideCn: boolean, trackerReady: boolean) {
  const [store, setStore] = useState<GuessStore>(emptyStore);
  const [loaded, setLoaded] = useState(false);
  const [mode, setModeState] = useState<GuessMode>("daily");
  const [day, setDay] = useState(() => dailyIndex(Date.now()));
  const [freshId, setFreshId] = useState<number | null>(null);

  const pool = useMemo(() => visibleRoster(hideCn), [hideCn]);

  useEffect(() => {
    setStore(loadStore());
    setLoaded(true);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDay((current) => {
        const next = dailyIndex(Date.now());
        return next === current ? current : next;
      });
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loaded || !trackerReady) return;
    setStore((prev) => ensureRounds(prev, pool, day));
  }, [loaded, trackerReady, pool, day]);

  useEffect(() => {
    if (!loaded) return;
    saveStore(store);
  }, [store, loaded]);

  const ready = loaded && trackerReady && !needsRepair(store, pool, day);
  const round = mode === "daily" ? store.daily : store.unlimited;

  const guesses = useMemo(() => {
    if (!round) return [];
    return round.guesses
      .map((id) => rosterById.get(id))
      .filter((c): c is RosterCharacter => c !== undefined);
  }, [round]);

  const target = round ? rosterById.get(round.targetId) ?? null : null;
  const status = round ? roundStatus(round) : "playing";

  const submitGuess = useCallback(
    (id: number) => {
      setStore((prev) => applyGuess(prev, mode, id, day));
      setFreshId(id);
    },
    [mode, day]
  );

  const newUnlimited = useCallback(() => {
    setStore((prev) => ({
      ...prev,
      unlimited: { targetId: pickRandomTarget(pool, prev.unlimited?.targetId).id, guesses: [] },
    }));
    setFreshId(null);
  }, [pool]);

  const setMode = useCallback((next: GuessMode) => {
    setModeState(next);
    setFreshId(null);
  }, []);

  return {
    ready,
    mode,
    setMode,
    pool,
    guesses,
    target,
    status,
    streak: effectiveStreak(store.streak, day),
    bestStreak: store.streak.best,
    freshId,
    submitGuess,
    newUnlimited,
  };
}
