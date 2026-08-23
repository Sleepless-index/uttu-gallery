import { characterArtPath, rarityPlatePath } from "@/lib/assets/characterAssets";
import { parseDisplayName } from "@/lib/data/roster";
import type { RosterCharacter, Team } from "@/lib/types";

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
 * so html-to-image can capture every card reliably. */
function ExportSlot({ character }: { character: RosterCharacter }) {
  const displayName = parseDisplayName(character.name);

  return (
    <div
      className="relative overflow-hidden rounded-md border border-[var(--color-border)]"
      style={{ aspectRatio: "224 / 524", width: 140 }}
    >
      <div className="absolute inset-0 bg-[var(--color-surface)]" />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={characterArtPath(character.id)}
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
}

function TeamExportBlock({ team, displayNumber, resolveCharacter }: TeamExportBlockProps) {
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
            <ExportSlot key={slotIndex} character={character} />
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
}

/** Fixed-width, non-responsive export target for the Teams page — stacks
 * every team vertically at a consistent size regardless of the viewer's own
 * screen size, so the exported PNG stays sharp and predictable (e.g. when
 * shared in Discord). */
export function TeamExportGrid({ teams, resolveCharacter }: TeamExportGridProps) {
  return (
    <div className="flex w-fit flex-col gap-4 bg-[var(--color-bg)] p-6" style={{ width: 4 * 140 + 3 * 8 + 2 * 16 }}>
      {teams.map((team, i) => (
        <TeamExportBlock
          key={team.id}
          team={team}
          displayNumber={i + 1}
          resolveCharacter={resolveCharacter}
        />
      ))}
    </div>
  );
}
