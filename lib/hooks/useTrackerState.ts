"use client";

import { useCallback, useEffect, useState } from "react";
import {
  emptyProgress,
  emptyTrackerState,
  type CharacterProgress,
  type TrackerState,
  type UpcomingArcanist,
} from "@/lib/types";
import { roster } from "@/lib/data/roster";

const STORAGE_KEY = "r1999-case-file";

function loadState(): TrackerState {
  if (typeof window === "undefined") return emptyTrackerState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyTrackerState();
    const parsed = JSON.parse(raw) as Partial<TrackerState>;
    return {
      progress: parsed.progress ?? {},
      wishlist: parsed.wishlist ?? [],
      upcoming: parsed.upcoming ?? [],
    };
  } catch {
    return emptyTrackerState();
  }
}

export function useTrackerState() {
  const [state, setState] = useState<TrackerState>(emptyTrackerState);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount to avoid SSR/client mismatch.
  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const getProgress = useCallback(
    (id: number): CharacterProgress => state.progress[id] ?? emptyProgress(),
    [state.progress]
  );

  const updateProgress = useCallback(
    (id: number, patch: Partial<CharacterProgress>) => {
      setState((prev) => ({
        ...prev,
        progress: {
          ...prev.progress,
          [id]: { ...emptyProgress(), ...prev.progress[id], ...patch },
        },
      }));
    },
    []
  );

  const toggleOwned = useCallback((id: number) => {
    setState((prev) => {
      const current = prev.progress[id] ?? emptyProgress();
      const nextOwned = !current.owned;
      return {
        ...prev,
        progress: {
          ...prev.progress,
          [id]: { ...current, owned: nextOwned },
        },
        // Owning a character clears it from the wishlist automatically.
        wishlist: nextOwned
          ? prev.wishlist.filter((w) => w !== id)
          : prev.wishlist,
      };
    });
  }, []);

  const toggleWishlist = useCallback((id: number) => {
    setState((prev) => {
      const already = prev.wishlist.includes(id);
      return {
        ...prev,
        wishlist: already
          ? prev.wishlist.filter((w) => w !== id)
          : [...prev.wishlist, id],
      };
    });
  }, []);

  const addUpcoming = useCallback((entry: Omit<UpcomingArcanist, "uid">) => {
    setState((prev) => {
      const nextUid =
        Math.max(100, ...prev.upcoming.map((u) => u.uid), 100) + 1;
      return {
        ...prev,
        upcoming: [...prev.upcoming, { ...entry, uid: nextUid }],
      };
    });
  }, []);

  const removeUpcoming = useCallback((uid: number) => {
    setState((prev) => ({
      ...prev,
      upcoming: prev.upcoming.filter((u) => u.uid !== uid),
    }));
  }, []);

  const resetAll = useCallback(() => {
    setState(emptyTrackerState());
  }, []);

  const importState = useCallback((incoming: TrackerState) => {
    setState(incoming);
  }, []);

  const stats = {
    owned: roster.filter((c) => state.progress[c.id]?.owned).length,
    total: roster.length,
  };

  return {
    state,
    hydrated,
    stats,
    getProgress,
    updateProgress,
    toggleOwned,
    toggleWishlist,
    addUpcoming,
    removeUpcoming,
    resetAll,
    importState,
  };
}
