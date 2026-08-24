import {
  characterArtPath,
  characterI2ArtPath,
  hasCharacterI2Art,
  rarityPlatePath,
} from "@/lib/assets/characterAssets";
import { garmentCardPath } from "@/lib/assets/garmentAssets";
import { garmentsForCharacter } from "@/lib/data/garments";
import { parseDisplayName } from "@/lib/data/roster";
import { ExportHeader } from "@/components/export/ExportHeader";
import type { RosterCharacter, CharacterProgress, Team, UserProfile } from "@/lib/types";

const RARITY_TINT: Record<number, string> = {
  6: "var(--color-rarity-6)",
  5: "var(--color-rarity-5)",
  4: "var(--color-rarity-4)",
  3: "var(--color-rarity-3)",
  2: "var(--color-rarity-2)",
};

function rarityTint(rarity: number): string {
  return RARITY_TINT[rarity] ?? RARITY_TINT[2];
}

/** Static, plain-<img> replica of a filled team slot — used only for PNG
 * export, same reasoning as ExportCard: avoids Next's image optimizer proxy
 * so html-to-image can capture every card reliably.
 *
 * Art selection mirrors ExportCard/CharacterCard exactly: a selected
 * garment or an explicitly-picked Insight 2 look wins, falling back to
 * auto-I2 once insight has actually reached tier 2, and finally to base
 * art. Team exports previously always used base art regardless of what
 * was set on the Roster page — this keeps the two in sync. */
function ExportSlot({ character, progress }: { character: RosterCharacter; progress: CharacterProgress }) {
  const displayName = parseDisplayName(character.name);

  const selectedGarment =
    typeof progress.selectedGarmentId === "number"
      ? garmentsForCharacter(character.id).find((g) => g.id === progress.selectedGarmentId)
      : undefined;
  const selectedInsight2 = progress.selectedGarmentId === "insight2";
  const autoInsight2 =
    progress.selectedGarmentId == null && progress.insight >= 2 && hasCharacterI2Art(character.id);

  const artSrc = selectedGarment
    ? garmentCardPath(selectedGarment)
    : selectedInsight2 || autoInsight2
      ? characterI2ArtPath(character.id)
      : characterArtPath(character.id);

  return (
    <div
      className="relative overflow-hidden rounded-md border border-[var(--color-border)]"
      style={{ aspectRatio: "224 / 524", width: 140 }}
    >
      <div className="absolute inset-0 bg-[var(--color-surface)]" />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={artSrc}
        alt={displayName.text}
        className="absolute inset-0 h-full w-full origin-top scale-105 object-cover object-top"
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.6) 100%), linear-gradient(to bottom, transparent 65%, color-mix(in srgb, ${rarityTint(character.rarity)} 8%, transparent) 100%)`,
        }}
      />

      <div className="absolute inset-x-0 bottom-0 h-[55%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={rarityPlatePath(character.rarity)}
          alt=""
          className="h-full w-full object-cover object-bottom"
        />
      </div>

      <div className="absolute inset-x-0 bottom-2 z-10 px-2">
        <span
          className={`block text-center text-[1.05rem] font-semibold leading-tight text-white ${displayName.italic ? "italic" : ""}`}
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)", fontFamily: "var(--font-display)" }}
        >
          {displayName.text}
        </span>
      </div>
    </div>
  );
}

/** Empty-slot placeholder, matching TeamCard's dashed-border look. */
function ExportEmptySlot() {
  return (
    <div
      className="flex items-center justify-center rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]"
      style={{ aspectRatio: "224 / 524", width: 140 }}
    />
  );
}

interface TeamExportBlockProps {
  team: Team;
  displayNumber: number;
  resolveCharacter: (id: number) => RosterCharacter | undefined;
  getProgress: (id: number) => CharacterProgress;
}

function TeamExportBlock({ team, displayNumber, resolveCharacter, getProgress }: TeamExportBlockProps) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <div className="mb-3 flex items-center gap-2.5">
        <span
          className="shrink-0 text-[1.6rem] font-extrabold text-[var(--color-text-faint)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {String(displayNumber).padStart(2, "0")}
        </span>
        <span className="text-[1.05rem] font-semibold text-[var(--color-text)]">{team.name}</span>
      </div>

      <div className="flex gap-2">
        {team.slots.map((characterId, slotIndex) => {
          const character = characterId != null ? resolveCharacter(characterId) : undefined;
          return character ? (
            <ExportSlot key={slotIndex} character={character} progress={getProgress(character.id)} />
          ) : (
            <ExportEmptySlot key={slotIndex} />
          );
        })}
      </div>
    </div>
  );
}

interface TeamExportGridProps {
  teams: Team[];
  resolveCharacter: (id: number) => RosterCharacter | undefined;
  getProgress: (id: number) => CharacterProgress;
  profile: UserProfile;
  /** How many teams stack per column before starting a new one — must match
   * TEAMS_PER_COLUMN on the Teams page itself, or the export won't reflect
   * what the page actually shows. */
  teamsPerColumn?: number;
}

const TEAM_BLOCK_WIDTH = 4 * 140 + 3 * 8 + 2 * 16; // 4 slots + gaps + block padding

/** Fixed-width, non-responsive export target for the Teams page. Teams are
 * chunked into columns of `teamsPerColumn`, laid out side by side — the
 * same top-to-bottom-then-next-column flow as the live page's CSS grid —
 * so a roster of 7+ teams exports as multiple columns instead of one very
 * long single strip. */
export function TeamExportGrid({
  teams,
  resolveCharacter,
  getProgress,
  profile,
  teamsPerColumn = 4,
}: TeamExportGridProps) {
  const columns: Team[][] = [];
  for (let i = 0; i < teams.length; i += teamsPerColumn) {
    columns.push(teams.slice(i, i + teamsPerColumn));
  }

  return (
    <div className="w-fit bg-[var(--color-bg)] p-6">
      <ExportHeader profile={profile} />
      <div className="flex items-start gap-4">
        {columns.map((columnTeams, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-4" style={{ width: TEAM_BLOCK_WIDTH }}>
            {columnTeams.map((team, i) => (
              <TeamExportBlock
                key={team.id}
                team={team}
                displayNumber={colIndex * teamsPerColumn + i + 1}
                resolveCharacter={resolveCharacter}
                getProgress={getProgress}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
