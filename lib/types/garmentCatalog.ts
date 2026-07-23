/** A garment entry as it appears nested inside garments.json. */
export interface CatalogGarment {
  id: number;
  name: string;
  /** e.g. "basic", "advanced", "unique". */
  category: string;
  /** Synthetic until a real backend id is provided — see lib/data/garments.ts. */
  series_id: number;
  version: string;
  /** Position in the character's overall look order (0 = base, 1 = insight, 2+ = garments). */
  index: number;
}

/** One character's garment catalog entry, as it appears in data/garments.json. */
export interface CharacterGarmentGroup {
  /** Truncated character id, matches RosterCharacter.id. */
  id: number;
  name: string;
  slug: string;
  version: string;
  garments: CatalogGarment[];
}

/** Flattened view used by UI components — one row per garment, with its parent character id attached. */
export interface FlatGarment {
  id: number;
  /** Truncated character id — matches RosterCharacter.id. */
  characterId: number;
  name: string;
  category: string;
  seriesId: number;
  version: string;
  index: number;
}
