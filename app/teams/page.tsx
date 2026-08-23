"use client";

import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { roster } from "@/lib/data/roster";
import { useTrackerState } from "@/lib/hooks/useTrackerState";
import { TeamCard } from "@/components/teams/TeamCard";
import { TeamSlotPickerModal } from "@/components/teams/TeamSlotPickerModal";
import { TeamExportGrid } from "@/components/teams/TeamExportGrid";

/** Teams stack top-to-bottom within a column; once a column holds this many
 * teams, the next team starts a new column to the right, beside the first. */
const TEAMS_PER_COLUMN = 5;

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

function IconEmptyTeams() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="5" y="9" width="12" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="23" y="9" width="12" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M28 5.5v6M25 8.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function MyTeamsPage() {
  const { state, hydrated, getProgress, addTeam, renameTeam, deleteTeam, setTeamSlot } = useTrackerState();
  const [activeSlot, setActiveSlot] = useState<{ teamId: number; slotIndex: number } | null>(null);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const myCharacters = useMemo(() => {
    return roster
      .filter((c) => state.progress[c.id]?.owned)
      .sort((a, b) => b.rarity - a.rarity || b.id - a.id);
  }, [state.progress]);

  const rosterById = useMemo(() => new Map(roster.map((c) => [c.id, c])), []);
  const resolveCharacter = (id: number) => rosterById.get(id);

  // grid-auto-flow: column fills each column top-to-bottom before starting
  // the next one — exactly "descending until the 5th team, then a 2nd
  // column starting next to the 1st team" with zero manual chunking.
  const rowCount = Math.max(1, Math.min(TEAMS_PER_COLUMN, state.teams.length));

  const activeTeam = activeSlot ? state.teams.find((t) => t.id === activeSlot.teamId) : undefined;
  const disabledIdsForActiveSlot = useMemo(() => {
    if (!activeTeam) return new Set<number>();
    return new Set(
      activeTeam.slots.filter((id): id is number => id != null)
    );
  }, [activeTeam]);

  async function handleExport() {
    if (!exportRef.current || exporting) return;
    setExporting(true);
    try {
      // Give the off-screen grid's <img> tags a moment to finish loading
      // before capture — toPng doesn't wait for image decode on its own.
      const images = Array.from(exportRef.current.querySelectorAll("img"));
      await Promise.all(
        images.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                img.onload = () => resolve();
                img.onerror = () => resolve();
              })
        )
      );

      // pixelRatio 3 keeps card art crisp at typical Discord embed widths
      // (roughly 400-550px display) even though the underlying art files
      // are themselves modest resolution — this avoids the soft/blurry
      // look a 1x or 2x capture gets when Discord scales it back up.
      const dataUrl = await toPng(exportRef.current, {
        pixelRatio: 3,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--color-bg") || "#0a0a0f",
      });

      const link = document.createElement("a");
      link.download = "my-teams.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
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
            {state.teams.length > 0 && (
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[0.75rem] font-medium text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] disabled:opacity-60"
              >
                {exporting ? <IconSpinner /> : <IconDownload />}
                {exporting ? "Exporting…" : "Export PNG"}
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

        {state.teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <span className="text-[var(--color-text-faint)]">
              <IconEmptyTeams />
            </span>
            <p className="text-[0.85rem] font-medium text-[var(--color-text-dim)]">No teams yet</p>
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
            className="grid grid-cols-1 gap-4 sm:[grid-auto-flow:column] sm:[grid-auto-columns:minmax(620px,720px)]"
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
                onRename={(name) => renameTeam(team.id, name)}
                onDelete={() => deleteTeam(team.id)}
                onSlotClick={(slotIndex) => setActiveSlot({ teamId: team.id, slotIndex })}
                onSlotClear={(slotIndex) => setTeamSlot(team.id, slotIndex, null)}
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
          <TeamExportGrid teams={state.teams} resolveCharacter={resolveCharacter} />
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
    </div>
  );
}
