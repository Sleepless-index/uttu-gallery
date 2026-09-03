import rawData from "@/data/roster.json";
import type { CharacterGarmentGroup, FlatGarment } from "@/lib/types";
import { isCnOnly } from "@/lib/version";

export const garmentCatalog: CharacterGarmentGroup[] = (
  rawData as { id: number; name: string; slug: string; version: string; garments: CharacterGarmentGroup["garments"] }[]
).map((c) => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  version: c.version,
  garments: c.garments,
}));


export const garments: FlatGarment[] = garmentCatalog.flatMap((group) =>
  group.garments.map((g) => ({
    id: g.id,
    characterId: group.id,
    name: g.name,
    category: g.category,
    seriesId: g.series_id,
    version: g.version,
    index: g.index,
  }))
);

export function garmentsForCharacter(characterId: number): FlatGarment[] {
  return garments.filter((g) => g.characterId === characterId);
}

/** All garments filtered for CN-only entries per the "Hide CN content"
 * setting — for the Garments gallery browse page. */
export function visibleGarments(hideCn: boolean): FlatGarment[] {
  return hideCn ? garments.filter((g) => !isCnOnly(g.version)) : garments;
}

/** Garments for one character, filtered for CN-only entries per the "Hide
 * CN content" setting — mirrors visibleRoster/visiblePsychubes. Pass
 * hideCn straight from tracker state. */
export function visibleGarmentsForCharacter(characterId: number, hideCn: boolean): FlatGarment[] {
  const all = garmentsForCharacter(characterId);
  return hideCn ? all.filter((g) => !isCnOnly(g.version)) : all;
}
