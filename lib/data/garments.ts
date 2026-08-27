import rawData from "@/data/roster.json";
import type { CharacterGarmentGroup, FlatGarment } from "@/lib/types";

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
