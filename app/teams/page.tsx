"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { roster } from "@/lib/data/roster";
import { useTrackerState } from "@/lib/hooks/useTrackerState";
import { exportPngToFile, describeExportError } from "@/lib/export/exportPngToFile";
import { TeamCard, type PsychubeDisplayMode } from "@/components/teams/TeamCard";
import { TeamSlotPickerModal } from "@/components/teams/TeamSlotPickerModal";
import { TeamSlotPsychubePickerModal } from "@/components/teams/TeamSlotPsychubePickerModal";
import { TeamExportGrid } from "@/components/teams/TeamExportGrid";
import { emptyPsychubeProgress } from "@/lib/types";
import { assetUrl } from "@/lib/assets/assetUrl";

/** Teams stack top-to-bottom within a column; once a column holds this many
 * teams, the next team starts a new column to the right, beside the first. */
const TEAMS_PER_COLUMN = 4;

function IconPlus() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 2v8m0 0L5 7m3 3 3-3M3 12.5v.5a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5v-.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="animate-spin">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.25" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Compact / Detailed segmented toggle for how equipped Psychubes are shown,
 * on both the live page and the exported image. */
function PsychubeModeToggle({ mode, onChange }: { mode: PsychubeDisplayMode; onChange: (next: PsychubeDisplayMode) => void }) {
  return (
    <div className="flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5 text-[0.72rem] font-medium">
      {(["compact", "detailed"] as PsychubeDisplayMode[]).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={mode === option}
          className={`rounded-md px-2.5 py-1.5 capitalize transition-colors ${
            mode === option
              ? "bg-[var(--color-accent)] text-white"
              : "text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default function MyTeamsPage() {
  const {
    state,
    hydrated,
    getProgress,
    getOwnedPsychube,
    addTeam,
    renameTeam,
    deleteTeam,
    setTeamSlot,
    setSlotPsychube,
  } = useTrackerState();
  const [activeSlot, setActiveSlot] = useState<{ teamId: number; slotIndex: number } | null>(null);
  const [activePsychubeSlot, setActivePsychubeSlot] = useState<{ teamId: number; slotIndex: number } | null>(null);
  const [psychubeDisplayMode, setPsychubeDisplayMode] = useState<PsychubeDisplayMode>("compact");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState<{ loaded: number; total: number } | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const myCharacters = useMemo(() => {
    return roster
      .filter((c) => state.progress[c.id]?.owned)
      .sort((a, b) => b.rarity - a.rarity || b.id - a.id);
  }, [state.progress]);

  const rosterById = useMemo(() => new Map(roster.map((c) => [c.id, c])), []);
  const resolveCharacter = (id: number) => rosterById.get(id);
  const getPsychubeProgress = (id: number) => getOwnedPsychube(id) ?? emptyPsychubeProgress();

  // grid-auto-flow: column fills each column top-to-bottom before starting
  // the next one — exactly "descending until the 5th team, then a 2nd
  // column starting next to the 1st team" with zero manual chunking.
  const rowCount = Math.max(1, Math.min(TEAMS_PER_COLUMN, state.teams.length));

  const activeTeam = activeSlot ? state.teams.find((t) => t.id === activeSlot.teamId) : undefined;
  const disabledIdsForActiveSlot = useMemo(() => {
    if (!activeTeam) return new Set<number>();
    return new Set(
      activeTeam.slots
        .filter((s): s is NonNullable<typeof s> => s != null)
        .map((s) => s.characterId)
    );
  }, [activeTeam]);

  const activePsychubeTeam = activePsychubeSlot ? state.teams.find((t) => t.id === activePsychubeSlot.teamId) : undefined;
  const activePsychubeCharacterSlot =
    activePsychubeTeam && activePsychubeSlot ? activePsychubeTeam.slots[activePsychubeSlot.slotIndex] : undefined;
  const disabledPsychubeIdsInTeam = useMemo(() => {
    if (!activePsychubeTeam || !activePsychubeSlot) return new Set<number>();
    return new Set(
      activePsychubeTeam.slots
        .filter((s, i) => s != null && s.psychubeId != null && i !== activePsychubeSlot.slotIndex)
        .map((s) => s!.psychubeId!)
    );
  }, [activePsychubeTeam, activePsychubeSlot]);

  async function handleExport() {
    if (!exportRef.current || exporting) return;
    setExporting(true);
    setExportError(null);
    setExportProgress(null);
    try {
      // pixelRatio 3 keeps card art crisp at typical Discord embed widths
      // (roughly 400-550px display) even though the underlying art files
      // are themselves modest resolution — this avoids the soft/blurry
      // look a 1x or 2x capture gets when Discord scales it back up.
      await exportPngToFile({
        node: exportRef.current,
        filename: "my-teams.webp",
        pixelRatio: 3,
        onProgress: (loaded, total) => setExportProgress({ loaded, total }),
      });
    } catch (err) {
      console.error("Export failed:", err);
      setExportError(describeExportError(err));
    } finally {
      setExporting(false);
      setExportProgress(null);
    }
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <span className="text-[0.75rem] text-[var(--color-text-faint)]">Loading…</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[0.8rem] font-medium text-[var(--color-text-dim)]">
            {state.teams.length === 0
              ? "Teams"
              : `${state.teams.length} team${state.teams.length === 1 ? "" : "s"}`}
          </h2>

          <div className="flex items-center gap-2">
            <PsychubeModeToggle mode={psychubeDisplayMode} onChange={setPsychubeDisplayMode} />
            {state.teams.length > 0 && (
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[0.75rem] font-medium text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] disabled:opacity-60"
              >
                {exporting ? <IconSpinner /> : <IconDownload />}
                {exporting
                  ? exportProgress && exportProgress.total > 0
                    ? `Exporting… ${exportProgress.loaded}/${exportProgress.total}`
                    : "Exporting…"
                  : "Export"}
              </button>
            )}
            <button
              onClick={addTeam}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[0.75rem] font-medium text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
            >
              <IconPlus />
              New team
            </button>
          </div>
        </div>

        {exportError && (
          <p className="mb-3 rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger)]/10 px-3 py-2 text-[0.75rem] text-[var(--color-danger)]">
            {exportError}
          </p>
        )}

        {state.teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <span className="relative h-40 w-40">
              <Image
                src={assetUrl("/Icons/bg_xinxiang_wuzhuangtai.webp")}
                alt="Empty"
                fill
                sizes="160px"
                className="object-contain"
              />
            </span>
            <p className="max-w-xs text-[0.75rem] text-[var(--color-text-faint)]">
              Build team setups from the arcanists you own.
            </p>
            <button
              onClick={addTeam}
              className="mt-2 flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-[0.78rem] font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              <IconPlus />
              New team
            </button>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-none sm:[grid-auto-flow:column] sm:[grid-auto-columns:minmax(620px,720px)]"
            style={{
              gridTemplateRows: `repeat(${rowCount}, auto)`,
            }}
          >
            {state.teams.map((team, i) => (
              <TeamCard
                key={team.id}
                team={team}
                displayNumber={i + 1}
                resolveCharacter={resolveCharacter}
                getProgress={getProgress}
                getPsychubeProgress={getPsychubeProgress}
                psychubeDisplayMode={psychubeDisplayMode}
                onRename={(name) => renameTeam(team.id, name)}
                onDelete={() => deleteTeam(team.id)}
                onSlotClick={(slotIndex) => setActiveSlot({ teamId: team.id, slotIndex })}
                onSlotClear={(slotIndex) => setTeamSlot(team.id, slotIndex, null)}
                onPsychubeClick={(slotIndex) => setActivePsychubeSlot({ teamId: team.id, slotIndex })}
              />
            ))}
          </div>
        )}
      </main>

      {/* Off-screen, always-mounted export target — same approach as the
          Roster page's export: positioned far outside the viewport (not
          display:none) so html-to-image can lay it out and capture it. */}
      <div
        aria-hidden
        style={{ position: "fixed", top: 0, left: "-99999px", pointerEvents: "none" }}
      >
        <div ref={exportRef}>
          <TeamExportGrid
            teams={state.teams}
            resolveCharacter={resolveCharacter}
            getProgress={getProgress}
            getPsychubeProgress={getPsychubeProgress}
            psychubeDisplayMode={psychubeDisplayMode}
            profile={state.profile}
            teamsPerColumn={TEAMS_PER_COLUMN}
          />
        </div>
      </div>

      {activeSlot && (
        <TeamSlotPickerModal
          characters={myCharacters}
          disabledIds={disabledIdsForActiveSlot}
          onClose={() => setActiveSlot(null)}
          onPick={(characterId) => {
            setTeamSlot(activeSlot.teamId, activeSlot.slotIndex, characterId);
            setActiveSlot(null);
          }}
        />
      )}

      {activePsychubeSlot && activePsychubeCharacterSlot && (
        <TeamSlotPsychubePickerModal
          characterId={activePsychubeCharacterSlot.characterId}
          ownedPsychubes={state.ownedPsychubes}
          disabledIds={disabledPsychubeIdsInTeam}
          currentPsychubeId={activePsychubeCharacterSlot.psychubeId}
          onClose={() => setActivePsychubeSlot(null)}
          onPick={(psychubeId) => {
            setSlotPsychube(activePsychubeSlot.teamId, activePsychubeSlot.slotIndex, psychubeId);
            setActivePsychubeSlot(null);
          }}
        />
      )}
    </div>
  );
}
