"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { roster } from "@/lib/data/roster";
import { isCnOnly, compareVersionDesc } from "@/lib/version";
import { useTrackerState } from "@/lib/hooks/useTrackerState";
import {
  renderExportImage,
  downloadDataUrl,
  describeExportError,
  formatFileSize,
  type RenderedExportImage,
} from "@/lib/export/exportPngToFile";
import { PullChecklistCard } from "@/components/playground/PullChecklistCard";
import { PullChecklistExportGrid } from "@/components/playground/PullChecklistExportGrid";
import { ExportButtonLabel } from "@/components/export/ExportButtonLabel";

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

export default function PullChecklistPage() {
  const { state, hydrated, setPullDecision } = useTrackerState();
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [renderedExport, setRenderedExport] = useState<RenderedExportImage | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRenderedExport(null);
  }, [state.pullChecklist]);

  const groups = useMemo(() => {
    const cnCharacters = roster.filter((c) => isCnOnly(c.version) && c.rarity === 6);
    const byVersion = new Map<string, typeof cnCharacters>();
    for (const c of cnCharacters) {
      const key = c.version ?? "";
      const list = byVersion.get(key) ?? [];
      list.push(c);
      byVersion.set(key, list);
    }
    return Array.from(byVersion.entries())
      .sort((a, b) => compareVersionDesc(a[0], b[0]))
      .map(([version, characters]) => ({
        version,
        characters: [...characters].sort((a, b) => b.rarity - a.rarity),
      }));
  }, []);

  const totalCount = useMemo(() => groups.reduce((sum, g) => sum + g.characters.length, 0), [groups]);

  async function handleGenerateExport() {
    if (!exportRef.current || exporting) return;
    setExporting(true);
    setExportError(null);
    setExportProgress(null);
    setRenderedExport(null);
    try {
      const result = await renderExportImage({
        node: exportRef.current,
        pixelRatio: 2,
        onProgress: (loaded, total) => setExportProgress({ loaded, total }),
      });
      setRenderedExport(result);
    } catch (err) {
      console.error("Export failed:", err);
      setExportError(describeExportError(err));
    } finally {
      setExporting(false);
      setExportProgress(null);
    }
  }

  function handleDownloadExport() {
    if (!renderedExport) return;
    downloadDataUrl(renderedExport.dataUrl, "pull-checklist.webp");
    setRenderedExport(null);
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
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-3 flex justify-end">
          {totalCount > 0 && (
            <button
              onClick={renderedExport ? handleDownloadExport : handleGenerateExport}
              disabled={exporting}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[0.75rem] font-medium text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] disabled:opacity-60"
            >
              {exporting ? <IconSpinner /> : <IconDownload />}
              <ExportButtonLabel
                exporting={exporting}
                exportProgress={exportProgress}
                byteSizeLabel={renderedExport ? formatFileSize(renderedExport.byteSize) : null}
              />
            </button>
          )}
        </div>

        {exportError && (
          <p className="mb-3 rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger)]/10 px-3 py-2 text-[0.75rem] text-[var(--color-danger)]">
            {exportError}
          </p>
        )}

        {totalCount === 0 ? (
          <p className="py-16 text-center text-[0.8rem] text-[var(--color-text-faint)]">
            No CN-exclusive arcanists to plan for right now.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map((group) => (
              <div key={group.version} className="flex flex-col gap-2">
                <span
                  className="text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--color-text-faint)]"
                >
                  Version {group.version}
                </span>
                <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-3">
                  {group.characters.map((c) => (
                    <PullChecklistCard
                      key={c.id}
                      character={c}
                      decision={state.pullChecklist[c.id] ?? null}
                      onChange={(decision) => setPullDecision(c.id, decision)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Off-screen export target — see app/characters/page.tsx for why this
          is positioned far outside the viewport rather than display:none. */}
      <div aria-hidden style={{ position: "fixed", top: 0, left: "-99999px", pointerEvents: "none" }}>
        <div ref={exportRef}>
          <PullChecklistExportGrid groups={groups} decisions={state.pullChecklist} />
        </div>
      </div>
    </div>
  );
}
