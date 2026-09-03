import type { PsychubeProgress } from "./psychube";

export type Afflatus =
  | "Star"
  | "Plant"
  | "Mineral"
  | "Beast"
  | "Spirit"
  | "Intelligence";

export type Rarity = 2 | 3 | 4 | 5 | 6;

/** Summary list shape used for grid rendering & filtering. Loaded from data/roster.json. */
export interface RosterCharacter {
  /** Truncated character id — the shared prefix across base art, insight art, and all garments (e.g. 3144 for Coppélia, whose base art is 314401). */
  id: number;
  slug: string;
  name: string;
  rarity: Rarity;
  afflatus: Afflatus;
  race: string;
  /** Patch version this character released in (e.g. "3.9"), or an event
   * tag like "s01". Used to gate CN-only content via lib/version.ts —
   * undefined for entries with no version data, which are always shown. */
  version?: string;
}

/** Per-character progress the user tracks locally. */
export interface CharacterProgress {
  owned: boolean;
  portrait: number; // 0-5
  resonance: number; // 0-15
  insight: number; // 0-3
  level: number; // 0-60 (0 = unset)
  /**
   * The look the user has picked for this character, if any: a real garment
   * id, or the literal "insight2" for the Insight 2 alternate art. Absent
   * (undefined) means the base look.
   */
  selectedGarmentId?: number | "insight2";
}

export const emptyProgress = (): CharacterProgress => ({
  owned: false,
  portrait: 0,
  resonance: 0,
  insight: 0,
  level: 0,
});

export interface UpcomingArcanist {
  uid: number;
  name: string;
  afflatus: Afflatus;
  rarity: Rarity;
  note?: string;
}

/** Display identity shown on the roster page and exported PNG header. */
export interface UserProfile {
  name: string;
  uid: string;
  /** Filename (no extension) of the selected icon under /public/pfp, if any. */
  pfpId?: string;
}

export const emptyProfile = (): UserProfile => ({
  name: "",
  uid: "",
  pfpId: "170001",
});

export interface TrackerSettings {
  /** When true (default), CN-only content (version > GLB_VERSION in
   * lib/version.ts) is hidden everywhere — browse/add pickers, gallery,
   * and the user's own Roster/Teams alike. */
  hideCn: boolean;
}

export const emptySettings = (): TrackerSettings => ({
  hideCn: true,
});

export interface TrackerState {
  progress: Record<number, CharacterProgress>;
  upcoming: UpcomingArcanist[];
  profile: UserProfile;
  teams: Team[];
  /** Keyed by Psychube id. Presence of a key means owned. */
  ownedPsychubes: Record<number, PsychubeProgress>;
  settings: TrackerSettings;
}

export const emptyTrackerState = (): TrackerState => ({
  progress: {},
  upcoming: [],
  profile: emptyProfile(),
  teams: [],
  ownedPsychubes: {},
  settings: emptySettings(),
});

/** Number of character slots in a single team. */
export const TEAM_SIZE = 4;

/** A filled team slot: a character plus an optional equipped Psychube.
 * The Psychube equip is scoped to this slot, not the character globally —
 * the same character can hold a different Psychube in a different team. */
export interface TeamSlot {
  characterId: number;
  psychubeId?: number;
}

/** A user-defined team of up to TEAM_SIZE slots. Slots preserve their
 * position (empty slots are `null`) so removing a character from the middle
 * doesn't shift the others around. */
export interface Team {
  id: number;
  name: string;
  slots: (TeamSlot | null)[];
}

export const emptyTeamSlots = (): (TeamSlot | null)[] => Array(TEAM_SIZE).fill(null);
