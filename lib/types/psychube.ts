import type { Rarity } from "./character";

/** Static catalog entry. Loaded from data/psychubes.json. */
export interface Psychube {
  id: number;
  name: string;
  rarity: Rarity;
  /** Character ids this Psychube is thematically tied to, if any (parsed from the "#"-joined source field). */
  characterIds?: number[];
  /** Patch version this Psychube released in (e.g. "3.9"). Used to gate
   * CN-only content via lib/version.ts — undefined for entries with no
   * version data (data/psychubes.json doesn't carry this yet as of this
   * writing), which are always shown regardless of the Hide CN setting. */
  version?: string;
}

/** Only 4★ and 5★ Psychubes can be amplified. */
export function canAmplify(rarity: Rarity): boolean {
  return rarity >= 4;
}

/** Per-Psychube progress the user tracks locally. Keyed by Psychube id in ownedPsychubes. */
export interface PsychubeProgress {
  level: number; // 0-60 (0 = unset)
  amp: number; // 0-5, only meaningful when canAmplify(rarity)
}

export const emptyPsychubeProgress = (): PsychubeProgress => ({
  level: 0,
  amp: 0,
});
