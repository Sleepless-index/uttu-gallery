"use client";

import { useCallback, useEffect, useState } from "react";
import { emptyPlannerState, type PlannerState } from "@/lib/types";

const STORAGE_KEY = "r1999-pull-planner";

function loadState(): PlannerState {
  if (typeof window === "undefined") return emptyPlannerState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyPlannerState();
    const parsed = JSON.parse(raw) as Partial<PlannerState>;
    return { ...emptyPlannerState(), ...parsed };
  } catch {
    return emptyPlannerState();
  }
}

export function usePlannerState() {
  const [state, setState] = useState<PlannerState>(emptyPlannerState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const update = useCallback((patch: Partial<PlannerState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setState(emptyPlannerState());
  }, []);

  return { state, hydrated, update, reset };
}
