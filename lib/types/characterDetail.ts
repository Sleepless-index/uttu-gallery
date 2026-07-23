import type { Afflatus, Rarity } from "./character";

export type DamageType = "Reality" | "Mental";

export interface CharacterDetailBaseStats {
  ATK: number;
  HP: number;
  reality_def: number;
  mental_def: number;
  critical_technique: number;
}

export interface InsightText {
  tier: "I" | "II" | "III";
  text: string;
}

export interface PortrayText {
  level: number;
  text: string;
}

export interface GarmentPrice {
  usd: number;
  cny: number;
  jpy: number;
  krw: number;
  twd: number;
}

/** A garment as it appears nested inside a character's own detail file — richer than the catalog entry in garments.json. */
export interface CosmeticGarment {
  id: number;
  pose_id: number;
  name: string;
  category: string;
  /** null when pricing isn't known yet. */
  price: GarmentPrice | null;
  flavor_text: string;
}

/**
 * Full per-character profile, loaded from data/characters/{slug}.json.
 * Only a handful of characters have this file populated so far — everyone else
 * falls back gracefully to "no data yet" in the UI.
 *
 * Note: this schema has no equivalent for the old Skills tab (Incantations/
 * Ultimate with star-level progression) or Euphoria/Materials sections —
 * combat.skills only covers Insight and Portray text. Those UI sections will
 * show empty until the schema is extended to cover them.
 */
export interface CharacterDetail {
  character: {
    meta: {
      slug: string;
      version: string;
      url: string;
    };
    identity: {
      name: string;
      title: string;
      rarity: Rarity;
      afflatus: Afflatus;
      damage_type: DamageType;
      role_tags: string[];
      va: string;
      other_names: string[];
    };
    combat: {
      base_stats: CharacterDetailBaseStats;
      skills: {
        insights: InsightText[];
        portray: PortrayText[];
      };
    };
    profile: {
      medium: string;
      inspired: string;
      fragrance_note: string;
      dimensions: string;
      exhibition_blurb: string;
    };
    cosmetics: {
      default_garments: { base_id: number; insight_id: number };
      garments: CosmeticGarment[];
    };
  };
}
