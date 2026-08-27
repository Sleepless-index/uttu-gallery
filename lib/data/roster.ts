import rawData from "@/data/roster.json";
import type { RosterCharacter } from "@/lib/types";

export const roster: RosterCharacter[] = (
  rawData as (Omit<RosterCharacter, "name" | "afflatus"> & {
    name: string | number;
    afflatus: RosterCharacter["afflatus"] | RosterCharacter["afflatus"][];
    // Present in the merged file but not part of RosterCharacter — dropped
    // below rather than left dangling on the exported objects.
    garments?: unknown;
    version?: unknown;
  })[]
).map((c) => ({
  id: c.id,
  slug: c.slug,
  name: String(c.name),
  rarity: c.rarity,
  afflatus: Array.isArray(c.afflatus) ? c.afflatus[0] : c.afflatus,
  race: c.race,
}));

export const rosterById: Map<number, RosterCharacter> = new Map(
  roster.map((c) => [c.id, c])
);

export const rosterBySlug: Map<string, RosterCharacter> = new Map(
  roster.map((c) => [c.slug, c])
);

export function getCharacter(id: number): RosterCharacter | undefined {
  return rosterById.get(id);
}

export function getCharacterBySlug(slug: string): RosterCharacter | undefined {
  return rosterBySlug.get(slug);
}

/**
 * A small number of names carry deliberate `<i>...</i>` markup (e.g.
 * "<i>Lady by the Lake</i>", a vessel name). This strips that wrapper and
 * reports whether it was present, so components can render it in italics
 * instead of showing literal tags or silently dropping the styling.
 */
export function parseDisplayName(name: string): { text: string; italic: boolean } {
  const match = name.match(/^<i>(.*)<\/i>$/i);
  if (match) return { text: match[1], italic: true };
  return { text: name, italic: false };
}
