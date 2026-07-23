"use client";

import { useCallback, useEffect, useState } from "react";
import {
  emptyCleardropState,
  type CleardropPatchState,
} from "@/lib/types";

const STORAGE_KEY = "r1999-cleardrops";

function loadState(): CleardropPatchState {
  if (typeof window === "undefined") return emptyCleardropState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyCleardropState();
    const parsed = JSON.parse(raw) as Partial<CleardropPatchState>;
    return { ...emptyCleardropState(), ...parsed };
  } catch {
    return emptyCleardropState();
  }
}

export function useCleardropState() {
  const [state, setState] = useState<CleardropPatchState>(emptyCleardropState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const update = useCallback((patch: Partial<CleardropPatchState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setState(emptyCleardropState());
  }, []);

  return { state, hydrated, update, reset };
}
