"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { roster } from "@/lib/data/roster";
import { useTrackerState } from "@/lib/hooks/useTrackerState";
import { exportPngToFile, describeExportError } from "@/lib/export/exportPngToFile";
import { CharacterCard } from "@/components/arcanists/CharacterCard";
import { CharacterPickerModal } from "@/components/characters/CharacterPickerModal";
import { CharacterDetailModal } from "@/components/characters/CharacterDetailModal";
import { ExportGrid } from "@/components/characters/ExportGrid";

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


function IconInsight2() {
  return (
    <span className="relative h-[15px] w-[15px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/insight/insight-2.webp" alt="" className="h-full w-full object-contain" />
    </span>
  );
}

export default function MyCharactersPage() {
  const { state, hydrated, getProgress, updateProgress } = useTrackerState();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [detailCharacterId, setDetailCharacterId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [showI2Art, setShowI2Art] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const myCharacters = useMemo(() => {
    return roster
      .filter((c) => state.progress[c.id]?.owned)
      .sort((a, b) => b.rarity - a.rarity || b.id - a.id);
  }, [state.progress]);

  const selectedIds = useMemo(
    () => new Set(myCharacters.map((c) => c.id)),
    [myCharacters]
  );

  function handleDone(nextIds: Set<number>) {
    // Diff against current owned set so we only touch what actually changed.
    for (const c of roster) {
      const shouldOwn = nextIds.has(c.id);
      const currentlyOwns = !!state.progress[c.id]?.owned;
      if (shouldOwn !== currentlyOwns) {
        updateProgress(c.id, { owned: shouldOwn });
      }
    }
    setPickerOpen(false);
  }

  async function handleExport() {
    if (!exportRef.current || exporting) return;
    setExporting(true);
    setExportError(null);
    try {
      await exportPngToFile({ node: exportRef.current, filename: "my-roster.webp", pixelRatio: 2 });
    } catch (err) {
      console.error("Export failed:", err);
      setExportError(describeExportError(err));
    } finally {
      setExporting(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-[0.75rem] text-[var(--color-text-faint)]">Loading…</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[0.8rem] font-medium text-[var(--color-text-dim)]">
            {myCharacters.length === 0
              ? "Roster"
              : `${myCharacters.length} character${myCharacters.length === 1 ? "" : "s"}`}
          </h2>
          <div className="flex items-center gap-2">
            {myCharacters.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setShowI2Art((v) => !v)}
                  aria-pressed={showI2Art}
                  aria-label="Toggle Insight 2 art for all characters"
                  title="Show Insight 2 art"
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors
                    ${
                      showI2Art
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-dim)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
                    }`}
                >
                  <IconInsight2 />
                </button>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[0.75rem] font-medium text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] disabled:opacity-60"
                >
                  {exporting ? <IconSpinner /> : <IconDownload />}
                  {exporting ? "Exporting…" : "Export"}
                </button>
              </>
            )}
            <button
              onClick={() => setPickerOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[0.75rem] font-medium text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
            >
              <IconPlus />
              Add characters
            </button>
          </div>
        </div>

        {exportError && (
          <p className="mb-3 rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger)]/10 px-3 py-2 text-[0.75rem] text-[var(--color-danger)]">
            {exportError}
          </p>
        )}

        {myCharacters.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <span className="relative h-40 w-40">
              <Image
                src="/icons/bg_xinxiang_wuzhuangtai.webp"
                alt="Empty"
                fill
                sizes="160px"
                className="object-contain"
              />
            </span>
            <p className="max-w-xs text-[0.75rem] text-[var(--color-text-faint)]">
              Add the arcanists you own to build your own roster view.
            </p>
            <button
              onClick={() => setPickerOpen(true)}
              className="mt-2 flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-[0.78rem] font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              <IconPlus />
              Add characters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:gap-4 sm:grid-cols-4 md:grid-cols-5 lg:[grid-template-columns:repeat(auto-fill,minmax(140px,1fr))]">
            {myCharacters.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setDetailCharacterId(c.id)}
                className="text-left outline-none"
              >
                <CharacterCard
                  character={c}
                  progress={getProgress(c.id)}
                  showI2Art={showI2Art}
                  priority={i < 12}
                />
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Off-screen, always-mounted export target — positioned far outside
          the viewport (not display:none) so html-to-image can lay it out
          and capture it. Uses plain <img> tags via ExportGrid for reliable
          rendering, independent of what's currently visible on the page. */}
      <div
        aria-hidden
        style={{ position: "fixed", top: 0, left: "-99999px", pointerEvents: "none" }}
      >
        <div ref={exportRef}>
          <ExportGrid characters={myCharacters} getProgress={getProgress} profile={state.profile} showI2Art={showI2Art} />
        </div>
      </div>

      {pickerOpen && (
        <CharacterPickerModal
          selectedIds={selectedIds}
          onClose={() => setPickerOpen(false)}
          onDone={handleDone}
        />
      )}

      {detailCharacterId != null && (() => {
        const detailCharacter = roster.find((c) => c.id === detailCharacterId);
        if (!detailCharacter) return null;
        return (
          <CharacterDetailModal
            character={detailCharacter}
            progress={getProgress(detailCharacterId)}
            onClose={() => setDetailCharacterId(null)}
            onUpdateProgress={(patch) => updateProgress(detailCharacterId, patch)}
          />
        );
      })()}
    </div>
  );
}
