import type { CharacterDetail } from "@/lib/types";
import char37 from "@/data/characters/37.json";

/**
 * Only a handful of characters have a populated detail file so far. Add new
 * entries here as more data/characters/{slug}.json files are created — the
 * rest of the app already treats a missing entry as "no data yet" and
 * degrades gracefully.
 */
const characterDetails: Record<string, CharacterDetail> = {
  "37": char37 as CharacterDetail,
};

export function getCharacterDetail(slug: string): CharacterDetail | undefined {
  return characterDetails[slug];
}

export function hasCharacterDetail(slug: string): boolean {
  return slug in characterDetails;
}
