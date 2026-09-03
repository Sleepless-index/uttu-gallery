"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { psychubes, getVisiblePsychube } from "@/lib/data/psychubes";
import { isCnOnly } from "@/lib/version";
import { useTrackerState } from "@/lib/hooks/useTrackerState";
import { PsychubeCard } from "@/components/psychubes/PsychubeCard";
import { PsychubePickerModal } from "@/components/psychubes/PsychubePickerModal";
import { PsychubeDetailModal } from "@/components/psychubes/PsychubeDetailModal";
import { assetUrl } from "@/lib/assets/assetUrl";

function IconPlus() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function MyPsychubesPage() {
  const { state, hydrated, getOwnedPsychube, togglePsychubeOwned, updatePsychubeProgress } = useTrackerState();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const myPsychubes = useMemo(() => {
    return psychubes
      .filter((p) => state.ownedPsychubes[p.id])
      .filter((p) => !state.settings.hideCn || !isCnOnly(p.version))
      .sort((a, b) => b.rarity - a.rarity || b.id - a.id);
  }, [state.ownedPsychubes, state.settings.hideCn]);

  const selectedIds = useMemo(() => new Set(myPsychubes.map((p) => p.id)), [myPsychubes]);

  function handleDone(nextIds: Set<number>) {
    for (const p of psychubes) {
      const shouldOwn = nextIds.has(p.id);
      const currentlyOwns = !!state.ownedPsychubes[p.id];
      if (shouldOwn !== currentlyOwns) togglePsychubeOwned(p.id);
    }
    setPickerOpen(false);
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <span className="text-[0.75rem] text-[var(--color-text-faint)]">Loading…</span>
      </div>
    );
  }

  const detailPsychube = detailId != null ? getVisiblePsychube(detailId, state.settings.hideCn) : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[0.8rem] font-medium text-[var(--color-text-dim)]">
            {myPsychubes.length === 0 ? "Psychubes" : `${myPsychubes.length} psychube${myPsychubes.length === 1 ? "" : "s"}`}
          </h2>
          <button
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[0.75rem] font-medium text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
          >
            <IconPlus />
            Add psychubes
          </button>
        </div>

        {myPsychubes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <span className="relative h-40 w-40">
              <Image src={assetUrl("/Icons/bg_xinxiang_wuzhuangtai.webp")} alt="Empty" fill sizes="160px" className="object-contain" />
            </span>
            <p className="max-w-xs text-[0.75rem] text-[var(--color-text-faint)]">Add the psychubes you own to start tracking them.</p>
            <button
              onClick={() => setPickerOpen(true)}
              className="mt-2 flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-[0.78rem] font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              <IconPlus />
              Add psychubes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 sm:grid-cols-4 md:grid-cols-5 lg:[grid-template-columns:repeat(auto-fill,minmax(140px,1fr))]">
            {myPsychubes.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setDetailId(p.id)}
                className="group text-left outline-none"
              >
                <PsychubeCard psychube={p} progress={getOwnedPsychube(p.id) ?? { level: 0, amp: 0 }} priority={i < 12} />
              </button>
            ))}
          </div>
        )}
      </main>

      {pickerOpen && <PsychubePickerModal selectedIds={selectedIds} onClose={() => setPickerOpen(false)} onDone={handleDone} />}

      {detailPsychube && (
        <PsychubeDetailModal
          key={detailPsychube.id}
          psychube={detailPsychube}
          progress={getOwnedPsychube(detailPsychube.id) ?? { level: 0, amp: 0 }}
          onClose={() => setDetailId(null)}
          onUpdateProgress={(patch) => updatePsychubeProgress(detailPsychube.id, patch)}
        />
      )}
    </div>
  );
}
