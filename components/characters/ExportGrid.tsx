import {
  characterArtPath,
  characterI2ArtPath,
  hasCharacterI2Art,
  afflatusIconPath,
  rarityPlatePath,
  insightIconPath,
} from "@/lib/assets/characterAssets";
import { garmentCardPath } from "@/lib/assets/garmentAssets";
import { visibleGarmentsForCharacter } from "@/lib/data/garments";
import { parseDisplayName } from "@/lib/data/roster";
import { useTrackerState } from "@/lib/hooks/useTrackerState";
import { ExportHeader } from "@/components/export/ExportHeader";
import type { RosterCharacter, CharacterProgress, UserProfile } from "@/lib/types";

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

interface ExportCardProps {
  character: RosterCharacter;
  progress: CharacterProgress;
  showI2Art?: boolean;
}

/** Static, plain-<img> replica of CharacterCard — used only for PNG export.
 * Avoids Next's image optimizer proxy so html-to-image can capture every
 * card reliably without CORS/timing flakiness. Visuals intentionally
 * mirror CharacterCard exactly; keep the two in sync if that card changes. */
function ExportCard({ character, progress, showI2Art = false }: ExportCardProps) {
  const { state } = useTrackerState();
  const displayName = parseDisplayName(character.name);
  const hasLevelInfo = progress.level > 0;

  const selectedGarment =
    typeof progress.selectedGarmentId === "number"
      ? visibleGarmentsForCharacter(character.id, state.settings.hideCn).find((g) => g.id === progress.selectedGarmentId)
      : undefined;
  const selectedInsight2 = progress.selectedGarmentId === "insight2";
  const autoInsight2 =
    progress.selectedGarmentId == null && progress.insight >= 2 && hasCharacterI2Art(character.id);

  const artSrc = selectedGarment
    ? garmentCardPath(selectedGarment)
    : selectedInsight2 || autoInsight2 || (showI2Art && hasCharacterI2Art(character.id))
      ? characterI2ArtPath(character.id)
      : characterArtPath(character.id);

  return (
    <div className="relative pt-3">
      <div className="absolute left-2 top-1.5 z-20 h-11 w-7">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={afflatusIconPath(character.afflatus)}
          alt=""
          className="h-full w-full object-contain object-top"
          style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}
        />
      </div>

      <div
        className="relative overflow-hidden rounded-md border border-[var(--color-border)]"
        style={{ aspectRatio: "224 / 524" }}
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

        {progress.resonance > 0 && (
          <div className="absolute right-2 top-2 z-20 flex items-center gap-0.5 rounded-md bg-black/45 px-1.5 py-1 text-[var(--color-text)]">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4.222 21.995v-3.55c0-1.271-.333-1.932-.987-3.037A8.888 8.888 0 0 1 10.889 2a8.89 8.89 0 0 1 8.889 8.887c0 .58 0 .87.024 1.032.058.388.24.722.417 1.068L22 16.441l-1.4.7c-.405.202-.608.303-.749.49s-.181.399-.26.82l-.008.042c-.183.968-.384 2.036-.95 2.71-.2.237-.448.43-.727.567-.461.225-1.028.225-2.162.225-.525 0-1.051.012-1.576 0-1.243-.031-2.168-1.077-2.168-2.29" />
              <path d="M14.388 10.532c-.426 0-.815-.162-1.11-.427m1.11.426c0 1.146-.664 2.235-1.942 2.235s-1.942 1.088-1.942 2.234m3.884-4.469c2.15 0 2.15-3.35 0-3.35q-.294.001-.557.095c.105-2.498-3.496-3.176-4.312-.836m.985 1.857c0-.774-.39-1.456-.985-1.857m0 0c-1.852-1.25-4.32.993-3.146 2.993-1.97.295-1.76 3.333.247 3.333a1.66 1.66 0 0 0 1.362-.712" />
            </svg>
            <span className="text-[0.68rem] font-bold leading-none">{progress.resonance}</span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-[55%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={rarityPlatePath(character.rarity)}
            alt=""
            className="h-full w-full object-cover object-bottom"
          />
        </div>

        {hasLevelInfo ? (
          <div className="absolute inset-x-0 bottom-2 z-10 flex flex-col items-center gap-0.5">
            {progress.insight > 0 && (
              <span className="relative mb-0.5 h-6 w-6 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={insightIconPath(progress.insight as 1 | 2 | 3)}
                  alt=""
                  className="h-full w-full object-contain"
                  style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}
                />
              </span>
            )}
            <span
              className="text-[0.85rem] font-semibold leading-tight text-white/90"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
            >
              Lv.{progress.level}
            </span>
            <span
              className={`block max-w-full px-2 text-center text-[1rem] font-semibold leading-tight text-white ${displayName.italic ? "italic" : ""}`}
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)", fontFamily: "var(--font-display)" }}
            >
              {displayName.text}
            </span>
            {progress.portrait > 0 && (
              <div className="mt-1.5 flex w-full items-center justify-between px-3">
                {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                  <span
                    key={n}
                    className={`h-[3px] flex-1 rounded-full ${n <= progress.portrait ? "bg-[var(--color-portrait-bar)]" : "bg-white/25"} ${n > 1 ? "ml-1" : ""}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-x-0 bottom-2 z-10 px-2">
            <span
              className={`block text-center text-[1.05rem] font-semibold leading-tight text-white ${displayName.italic ? "italic" : ""}`}
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)", fontFamily: "var(--font-display)" }}
            >
              {displayName.text}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface ExportGridProps {
  characters: RosterCharacter[];
  getProgress: (id: number) => CharacterProgress;
  profile: UserProfile;
  showI2Art?: boolean;
}

/** Fixed-width grid (not responsive) so the exported PNG has a predictable,
 * consistent layout regardless of the viewer's own screen size. */
export function ExportGrid({ characters, getProgress, profile, showI2Art = false }: ExportGridProps) {
  return (
    <div className="w-fit bg-[var(--color-bg)] p-6">
      <ExportHeader profile={profile} />
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(8, 140px)" }}>
        {characters.map((c) => (
          <ExportCard key={c.id} character={c} progress={getProgress(c.id)} showI2Art={showI2Art} />
        ))}
      </div>
    </div>
  );
}
