import {
  characterArtPath,
  characterI2ArtPath,
  hasCharacterI2Art,
  rarityPlatePath,
} from "@/lib/assets/characterAssets";
import { garmentCardPath } from "@/lib/assets/garmentAssets";
import { garmentsForCharacter } from "@/lib/data/garments";
import { parseDisplayName } from "@/lib/data/roster";
import { psychubeArtPath } from "@/lib/assets/psychubeAssets";
import { getPsychube } from "@/lib/data/psychubes";
import { canAmplify } from "@/lib/types";
import { ExportHeader } from "@/components/export/ExportHeader";
import type { RosterCharacter, CharacterProgress, PsychubeProgress, Team, UserProfile } from "@/lib/types";
import type { PsychubeDisplayMode } from "@/components/teams/TeamCard";

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

/** Detailed-mode Psychube sub-card for export — plain <img>, mirrors
 * PsychubeDetailedRow. Name wraps to 2 lines rather than truncating, and
 * amp only shows once it's actually been raised above 0. */
function ExportPsychubeDetailedRow({ psychubeId, progress }: { psychubeId: number; progress: PsychubeProgress }) {
  const psychube = getPsychube(psychubeId);
  if (!psychube) return null;
  const showAmp = canAmplify(psychube.rarity) && progress.amp > 0;

  return (
    <div className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5" style={{ width: 140 }}>
      <div className="relative h-12 w-12 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={psychubeArtPath(psychube.id)} alt={psychube.name} className="h-full w-full object-contain" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="line-clamp-2 text-[0.68rem] font-medium leading-tight text-[var(--color-text)]">{psychube.name}</span>
        <span className="text-[0.62rem] leading-tight text-white">
          Lv.{progress.level}
          {showAmp && <span className="ml-1.5 text-[var(--color-accent)]">A{progress.amp}</span>}
        </span>
      </div>
    </div>
  );
}

function ExportSlot({
  character,
  progress,
  psychubeId,
  psychubeDisplayMode,
}: {
  character: RosterCharacter;
  progress: CharacterProgress;
  psychubeId?: number;
  psychubeDisplayMode: PsychubeDisplayMode;
}) {
  const displayName = parseDisplayName(character.name);
  const psychube = psychubeId != null ? getPsychube(psychubeId) : undefined;

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

      {psychubeDisplayMode === "compact" && psychube && (
        <div className="absolute bottom-8 left-1/2 z-10 h-14 w-14 -translate-x-1/2 overflow-hidden rounded-md drop-shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={psychubeArtPath(psychube.id)} alt={psychube.name} className="h-full w-full object-contain drop-shadow-lg" />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-2 z-10 px-2">
        <span
          className={`block truncate text-center text-[1.05rem] font-semibold leading-tight text-white ${displayName.italic ? "italic" : ""}`}
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
  getPsychubeProgress: (id: number) => PsychubeProgress;
  psychubeDisplayMode: PsychubeDisplayMode;
}

function TeamExportBlock({
  team,
  displayNumber,
  resolveCharacter,
  getProgress,
  getPsychubeProgress,
  psychubeDisplayMode,
}: TeamExportBlockProps) {
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
        {team.slots.map((slot, slotIndex) => {
          const character = slot != null ? resolveCharacter(slot.characterId) : undefined;
          if (!(character && slot)) return <ExportEmptySlot key={slotIndex} />;
          return (
            <div key={slotIndex} className="flex flex-col gap-1.5">
              <ExportSlot character={character} progress={getProgress(character.id)} psychubeId={slot.psychubeId} psychubeDisplayMode={psychubeDisplayMode} />
              {psychubeDisplayMode === "detailed" && slot.psychubeId != null && (
                <ExportPsychubeDetailedRow psychubeId={slot.psychubeId} progress={getPsychubeProgress(slot.psychubeId)} />
              )}
            </div>
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
  getPsychubeProgress: (id: number) => PsychubeProgress;
  psychubeDisplayMode: PsychubeDisplayMode;
  profile: UserProfile;
  teamsPerColumn?: number;
}

const TEAM_BLOCK_WIDTH = 4 * 140 + 3 * 8 + 2 * 16; // 4 slots + gaps + block padding

export function TeamExportGrid({
  teams,
  resolveCharacter,
  getProgress,
  getPsychubeProgress,
  psychubeDisplayMode,
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
                getPsychubeProgress={getPsychubeProgress}
                psychubeDisplayMode={psychubeDisplayMode}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
