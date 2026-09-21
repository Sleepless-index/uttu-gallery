import { characterArtPath, afflatusIconPath, rarityPlatePath } from "@/lib/assets/characterAssets";
import { parseDisplayName } from "@/lib/data/roster";
import type { RosterCharacter, PullDecision } from "@/lib/types";

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

const DECISION_OPTIONS: { value: PullDecision; label: string; activeClass: string }[] = [
  { value: "pull", label: "Pull", activeClass: "border-emerald-500 bg-emerald-500/15 text-emerald-400" },
  { value: "maybe", label: "Maybe…", activeClass: "border-amber-500 bg-amber-500/15 text-amber-400" },
  { value: "skip", label: "Skip.", activeClass: "border-red-500 bg-red-500/15 text-red-400" },
];

interface ExportRowProps {
  character: RosterCharacter;
  decision: PullDecision | null;
}

function ExportRow({ character, decision }: ExportRowProps) {
  const displayName = parseDisplayName(character.name);

  return (
    <div className="flex items-center gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <div className="relative shrink-0 pt-3">
        <div className="absolute left-1.5 top-1.5 z-20 h-9 w-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={afflatusIconPath(character.afflatus)}
            alt=""
            className="h-full w-full object-contain object-top"
            style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}
          />
        </div>

        <div className="relative w-24 overflow-hidden rounded-md border border-[var(--color-border)]" style={{ aspectRatio: "224 / 524" }}>
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
          <div className="absolute inset-x-0 bottom-0 h-[45%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={rarityPlatePath(character.rarity)} alt="" className="h-full w-full object-cover object-bottom" />
          </div>
          <div className="absolute inset-x-0 bottom-1.5 z-10 px-1">
            <span
              className={`block truncate text-center text-[0.68rem] font-semibold leading-tight text-white ${displayName.italic ? "italic" : ""}`}
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)", fontFamily: "var(--font-display)" }}
            >
              {displayName.text}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {DECISION_OPTIONS.map((opt) => {
          const active = decision === opt.value;
          return (
            <div
              key={opt.value}
              className={`flex items-center justify-center rounded-lg border px-3 py-2 text-[0.85rem] font-semibold ${
                active ? opt.activeClass : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-dim)]"
              }`}
            >
              {opt.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface VersionGroup {
  version: string;
  characters: RosterCharacter[];
}

interface PullChecklistExportGridProps {
  groups: VersionGroup[];
  decisions: Record<number, PullDecision>;
}

/** Plain-<img> export replica of the Pull Checklist page, at the same
 * container width (max-w-3xl, 768px) and card proportions as the live
 * page — grouped by version, each version's cast on its own row. No
 * profile header: this export is just the checklist, not a roster/teams
 * -style share card. */
export function PullChecklistExportGrid({ groups, decisions }: PullChecklistExportGridProps) {
  return (
    <div className="w-fit bg-[var(--color-bg)] p-6" style={{ width: "768px" }}>
      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <div key={group.version} className="flex flex-col gap-2">
            <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
              Version {group.version}
            </span>
            <div className="grid grid-cols-2 gap-3">
              {group.characters.map((c) => (
                <ExportRow key={c.id} character={c} decision={decisions[c.id] ?? null} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
