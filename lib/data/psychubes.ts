import rawData from "@/data/psychubes.json";
import type { Psychube } from "@/lib/types";

export const psychubes: Psychube[] = (
  rawData as { id: number; name: string; rarity: number; characterid?: string }[]
).map((p) => ({
  id: p.id,
  name: p.name,
  rarity: p.rarity as Psychube["rarity"],
  characterIds: p.characterid
    ? p.characterid.split("#").map(Number)
    : undefined,
}));

export const psychubeById: Map<number, Psychube> = new Map(
  psychubes.map((p) => [p.id, p])
);

export function getPsychube(id: number): Psychube | undefined {
  return psychubeById.get(id);
}

/** Psychubes thematically tied to a given character id, used to sort them
 * to the top of a character-scoped picker with a "Recommended" tag. */
export function getRecommendedPsychubes(characterId: number): Psychube[] {
  return psychubes.filter((p) => p.characterIds?.includes(characterId));
}
