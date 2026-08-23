import {
  characterArtPath,
  characterI2ArtPath,
  hasCharacterI2Art,
  afflatusIconPath,
  rarityPlatePath,
  insightIconPath,
} from "@/lib/assets/characterAssets";
import { garmentCardPath } from "@/lib/assets/garmentAssets";
import { garmentsForCharacter } from "@/lib/data/garments";
import { parseDisplayName } from "@/lib/data/roster";
import { pfpPath } from "@/lib/data/pfp";
import type { RosterCharacter, CharacterProgress, UserProfile } from "@/lib/types";

const DEFAULT_NAME = "Timekeeper";

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
  const displayName = parseDisplayName(character.name);
  const hasLevelInfo = progress.level > 0;

  const selectedGarment =
    typeof progress.selectedGarmentId === "number"
      ? garmentsForCharacter(character.id).find((g) => g.id === progress.selectedGarmentId)
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

interface ExportHeaderProps {
  profile: UserProfile;
}

function ExportHeader({ profile }: ExportHeaderProps) {
  const displayName = profile.name.trim() || DEFAULT_NAME;
  const uid = profile.uid.trim();

  return (
    <div className="mb-6 flex items-center gap-4">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-surface)]">
        {profile.pfpId && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pfpPath(profile.pfpId)} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="flex flex-col justify-center">
        <span className="text-[1.9rem] font-semibold leading-tight text-[var(--color-text)]">
          {displayName}
        </span>
        {uid && (
          <span className="mt-1 text-[1.15rem] leading-tight text-[var(--color-text-faint)]">
            UID: {uid}
          </span>
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
