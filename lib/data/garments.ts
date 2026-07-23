import rawGarmentCatalog from "@/data/garments.json";
import type { CharacterGarmentGroup, FlatGarment } from "@/lib/types";

export const garmentCatalog: CharacterGarmentGroup[] =
  rawGarmentCatalog as CharacterGarmentGroup[];

/** Flattened view — one row per garment, with its parent character id attached. This is what most UI components consume. */
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
