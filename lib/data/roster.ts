import rawRoster from "@/data/roster.json";
import type { RosterCharacter } from "@/lib/types";

/**
 * A couple of entries in the raw roster data have a numeric `name` (e.g. the
 * characters actually named "37" and "6") instead of a string — normalize
 * everything to a string once here so the rest of the app never has to think
 * about it.
 *
 * A small number of entries (e.g. The Twins) also carry a dual afflatus as
 * an array (e.g. ["Mineral", "Star"]) instead of a single string. Every
 * consumer of RosterCharacter.afflatus (icons, filters, tints) expects one
 * value, so we flatten to the first element here — the single place that
 * needs to know this data can be shaped that way — rather than leaving every
 * downstream component to guess and crash on `.toLowerCase()` of an array.
 */
export const roster: RosterCharacter[] = (
  rawRoster as (Omit<RosterCharacter, "name" | "afflatus"> & {
    name: string | number;
    afflatus: RosterCharacter["afflatus"] | RosterCharacter["afflatus"][];
  })[]
).map((c) => ({
  ...c,
  name: String(c.name),
  afflatus: Array.isArray(c.afflatus) ? c.afflatus[0] : c.afflatus,
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
