import rawData from "@/data/roster.json";
import type { RosterCharacter } from "@/lib/types";
import { isCnOnly } from "@/lib/version";

export const roster: RosterCharacter[] = (
  rawData as (Omit<RosterCharacter, "name" | "afflatus"> & {
    name: string | number;
    afflatus: RosterCharacter["afflatus"] | RosterCharacter["afflatus"][];
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
  version: typeof c.version === "string" ? c.version : undefined,
}));

export const rosterById: Map<number, RosterCharacter> = new Map(
  roster.map((c) => [c.id, c])
);

export const rosterBySlug: Map<string, RosterCharacter> = new Map(
  roster.map((c) => [c.slug, c])
);

/** Roster filtered for CN-only entries per the "Hide CN content" setting.
 * Pass hideCn straight from tracker state — when false this is just
 * `roster` again (same array reference, no copy). */
export function visibleRoster(hideCn: boolean): RosterCharacter[] {
  return hideCn ? roster.filter((c) => !isCnOnly(c.version)) : roster;
}

/** Looks up a character by id, but returns undefined if it's CN-only and
 * hideCn is set — used so equipped/owned CN characters disappear from
 * Team slots and Roster entries too, not just browse/add lists, per the
 * "hide everywhere, including things you already have" behavior. */
export function getVisibleCharacter(id: number, hideCn: boolean): RosterCharacter | undefined {
  const character = rosterById.get(id);
  if (!character) return undefined;
  if (hideCn && isCnOnly(character.version)) return undefined;
  return character;
}

export function getCharacter(id: number): RosterCharacter | undefined {
  return rosterById.get(id);
}

export function getCharacterBySlug(slug: string): RosterCharacter | undefined {
  return rosterBySlug.get(slug);
}

export function parseDisplayName(name: string): { text: string; italic: boolean } {
  const match = name.match(/^<i>(.*)<\/i>$/i);
  if (match) return { text: match[1], italic: true };
  return { text: name, italic: false };
}
