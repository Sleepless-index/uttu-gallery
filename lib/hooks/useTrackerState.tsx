"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  emptyProfile,
  emptyProgress,
  emptyPsychubeProgress,
  emptySettings,
  emptyTrackerState,
  emptyTeamSlots,
  type CharacterProgress,
  type PsychubeProgress,
  type Team,
  type TeamSlot,
  type TrackerSettings,
  type TrackerState,
  type UpcomingArcanist,
  type UserProfile,
} from "@/lib/types";
import { visibleRoster } from "@/lib/data/roster";

const STORAGE_KEY = "r1999-case-file";

function loadState(): TrackerState {
  if (typeof window === "undefined") return emptyTrackerState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyTrackerState();
    const parsed = JSON.parse(raw) as Partial<TrackerState>;
    return {
      progress: parsed.progress ?? {},
      upcoming: parsed.upcoming ?? [],
      profile: { ...emptyProfile(), ...parsed.profile },
      teams: parsed.teams ?? [],
      ownedPsychubes: parsed.ownedPsychubes ?? {},
      settings: { ...emptySettings(), ...parsed.settings },
    };
  } catch {
    return emptyTrackerState();
  }
}

/** Everything useTrackerState() used to compute locally, now computed once
 * here and shared via Context — see TrackerStateProvider below. Moving
 * this from a plain hook to a Context was required because every page/
 * modal that called useTrackerState() got its OWN independent useState,
 * so a change made in one place (e.g. the Settings modal's Hide CN
 * toggle) never reached any other already-mounted component until a full
 * page reload re-hydrated from localStorage. A Context makes all of them
 * read the same live state and re-render together. */
function useTrackerStateInternal() {
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
      return {
        ...prev,
        progress: {
          ...prev.progress,
          [id]: { ...current, owned: !current.owned },
        },
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

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setState((prev) => ({
      ...prev,
      profile: { ...emptyProfile(), ...prev.profile, ...patch },
    }));
  }, []);

  const resetAll = useCallback(() => {
    setState(emptyTrackerState());
  }, []);

  const importState = useCallback((incoming: TrackerState) => {
    setState(incoming);
  }, []);

  const addTeam = useCallback(() => {
    setState((prev) => {
      const nextId = Math.max(0, ...prev.teams.map((t) => t.id)) + 1;
      const newTeam: Team = {
        id: nextId,
        name: `Team ${nextId}`,
        slots: emptyTeamSlots(),
      };
      return { ...prev, teams: [...prev.teams, newTeam] };
    });
  }, []);

  const renameTeam = useCallback((teamId: number, name: string) => {
    setState((prev) => ({
      ...prev,
      teams: prev.teams.map((t) => (t.id === teamId ? { ...t, name } : t)),
    }));
  }, []);

  const deleteTeam = useCallback((teamId: number) => {
    setState((prev) => ({
      ...prev,
      teams: prev.teams.filter((t) => t.id !== teamId),
    }));
  }, []);

  const setTeamSlot = useCallback(
    (teamId: number, slotIndex: number, characterId: number | null) => {
      setState((prev) => ({
        ...prev,
        teams: prev.teams.map((t) => {
          if (t.id !== teamId) return t;
          const slots = [...t.slots];
          // Changing the character in a slot clears any equipped Psychube —
          // the equip was scoped to the previous character in this slot.
          slots[slotIndex] = characterId == null ? null : { characterId };
          return { ...t, slots };
        }),
      }));
    },
    []
  );

  /** Equip (or clear, with psychubeId null) a Psychube on one team slot.
   * Enforces the one-Psychube-per-team rule: if another slot in the SAME
   * team already has this Psychube equipped, it's cleared from that slot. */
  const setSlotPsychube = useCallback(
    (teamId: number, slotIndex: number, psychubeId: number | null) => {
      setState((prev) => ({
        ...prev,
        teams: prev.teams.map((t) => {
          if (t.id !== teamId) return t;
          const slots: (TeamSlot | null)[] = t.slots.map((slot, i) => {
            if (!slot) return slot;
            if (i === slotIndex) {
              return psychubeId == null
                ? { characterId: slot.characterId }
                : { ...slot, psychubeId };
            }
            // Clear this Psychube from any other slot in the same team.
            if (psychubeId != null && slot.psychubeId === psychubeId) {
              return { characterId: slot.characterId };
            }
            return slot;
          });
          return { ...t, slots };
        }),
      }));
    },
    []
  );

  const getOwnedPsychube = useCallback(
    (id: number): PsychubeProgress | undefined => state.ownedPsychubes[id],
    [state.ownedPsychubes]
  );

  const togglePsychubeOwned = useCallback((id: number) => {
    setState((prev) => {
      const owned = { ...prev.ownedPsychubes };
      if (owned[id]) {
        delete owned[id];
      } else {
        owned[id] = emptyPsychubeProgress();
      }
      return { ...prev, ownedPsychubes: owned };
    });
  }, []);

  const updatePsychubeProgress = useCallback(
    (id: number, patch: Partial<PsychubeProgress>) => {
      setState((prev) => ({
        ...prev,
        ownedPsychubes: {
          ...prev.ownedPsychubes,
          [id]: { ...emptyPsychubeProgress(), ...prev.ownedPsychubes[id], ...patch },
        },
      }));
    },
    []
  );

  const updateSettings = useCallback((patch: Partial<TrackerSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...emptySettings(), ...prev.settings, ...patch },
    }));
  }, []);

  const stats = {
    owned: visibleRoster(state.settings.hideCn).filter((c) => state.progress[c.id]?.owned).length,
    total: visibleRoster(state.settings.hideCn).length,
  };

  return {
    state,
    hydrated,
    stats,
    getProgress,
    updateProgress,
    toggleOwned,
    addUpcoming,
    removeUpcoming,
    resetAll,
    importState,
    updateProfile,
    addTeam,
    renameTeam,
    deleteTeam,
    setTeamSlot,
    setSlotPsychube,
    getOwnedPsychube,
    togglePsychubeOwned,
    updatePsychubeProgress,
    updateSettings,
  };
}

type TrackerStateValue = ReturnType<typeof useTrackerStateInternal>;

const TrackerStateContext = createContext<TrackerStateValue | null>(null);

/** Wraps the app once, near the root layout, so every page and modal below
 * it shares the exact same live tracker state instead of each maintaining
 * its own out-of-sync copy. */
export function TrackerStateProvider({ children }: { children: ReactNode }) {
  const value = useTrackerStateInternal();
  return <TrackerStateContext.Provider value={value}>{children}</TrackerStateContext.Provider>;
}

/** Same call shape as before the Context conversion — every existing call
 * site (`const { state, ... } = useTrackerState()`) keeps working
 * unchanged. Must be called under TrackerStateProvider. */
export function useTrackerState(): TrackerStateValue {
  const ctx = useContext(TrackerStateContext);
  if (!ctx) {
    throw new Error("useTrackerState must be used within a TrackerStateProvider");
  }
  return ctx;
}
