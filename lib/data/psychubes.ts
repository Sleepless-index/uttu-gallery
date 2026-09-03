import rawData from "@/data/psychubes.json";
import type { Psychube } from "@/lib/types";
import { isCnOnly } from "@/lib/version";

export const psychubes: Psychube[] = (
  rawData as { id: number; name: string; rarity: number; characterid?: string; version?: unknown }[]
).map((p) => ({
  id: p.id,
  name: p.name,
  rarity: p.rarity as Psychube["rarity"],
  characterIds: p.characterid
    ? p.characterid.split("#").map(Number)
    : undefined,
  // data/psychubes.json doesn't carry version data yet — this is forward
  // compatible with when it does, without needing another code change.
  version: typeof p.version === "string" ? p.version : undefined,
}));

export const psychubeById: Map<number, Psychube> = new Map(
  psychubes.map((p) => [p.id, p])
);

export function getPsychube(id: number): Psychube | undefined {
  return psychubeById.get(id);
}

/** Looks up a Psychube by id, but returns undefined if it's CN-only and
 * hideCn is set — mirrors getVisibleCharacter in roster.ts, so equipped
 * CN Psychubes disappear from Team slots too, not just browse/add lists. */
export function getVisiblePsychube(id: number, hideCn: boolean): Psychube | undefined {
  const psychube = psychubeById.get(id);
  if (!psychube) return undefined;
  if (hideCn && isCnOnly(psychube.version)) return undefined;
  return psychube;
}

/** Psychubes filtered for CN-only entries per the "Hide CN content"
 * setting. Pass hideCn straight from tracker state — when false this is
 * just `psychubes` again (same array reference, no copy). */
export function visiblePsychubes(hideCn: boolean): Psychube[] {
  return hideCn ? psychubes.filter((p) => !isCnOnly(p.version)) : psychubes;
}

/** Psychubes thematically tied to a given character id, used to sort them
 * to the top of a character-scoped picker with a "Recommended" tag. */
export function getRecommendedPsychubes(characterId: number): Psychube[] {
  return psychubes.filter((p) => p.characterIds?.includes(characterId));
}
