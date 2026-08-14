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
}

/** Per-character progress the user tracks locally. */
export interface CharacterProgress {
  owned: boolean;
  portrait: number; // 0-5
  resonance: number; // 0-15
  insight: number; // 0-3
  level: number; // 0-60 (0 = unset)
  /** Garment id the user has picked for this character, if any. */
  selectedGarmentId?: number;
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

export interface TrackerState {
  progress: Record<number, CharacterProgress>;
  upcoming: UpcomingArcanist[];
  profile: UserProfile;
}

export const emptyTrackerState = (): TrackerState => ({
  progress: {},
  upcoming: [],
  profile: emptyProfile(),
});
