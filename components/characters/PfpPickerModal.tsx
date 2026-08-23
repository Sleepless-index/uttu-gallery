"use client";

import { useState } from "react";
import Image from "next/image";
import { pfpIds, pfpPath, pfpName } from "@/lib/data/pfp";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";

function IconClose() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path d="M3.5 8.3l2.8 2.8 6.2-6.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface PfpPickerModalProps {
  selectedId?: string;
  onClose: () => void;
  onSelect: (id: string) => void;
}

export function PfpPickerModal({ selectedId, onClose, onSelect }: PfpPickerModalProps) {
  useBodyScrollLock();
  const [previewId, setPreviewId] = useState<string | undefined>(selectedId);
  const previewName = previewId ? pfpName(previewId) : undefined;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Choose profile icon"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-[0.9rem] font-semibold text-[var(--color-text)]">Choose profile icon</h2>
            <p className="truncate text-[0.72rem] text-[var(--color-text-faint)]">
              {previewName ?? "Hover or select an icon to see its name"}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-dim)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          >
            <IconClose />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-6 gap-2.5 sm:grid-cols-7">
            {pfpIds.map((id) => {
              const active = id === selectedId;
              const name = pfpName(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelect(id)}
                  onMouseEnter={() => setPreviewId(id)}
                  onFocus={() => setPreviewId(id)}
                  aria-pressed={active}
                  aria-label={name}
                  className={`group relative aspect-square overflow-hidden rounded-lg border transition-colors duration-150
                    ${active ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]" : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"}`}
                >
                  <Image src={pfpPath(id)} alt="" fill sizes="64px" className="object-cover" />

                  {active && (
                    <>
                      <div className="pointer-events-none absolute inset-0 bg-black/35" />
                      <span className="pointer-events-none absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-accent)] text-white shadow">
                        <IconCheck />
                      </span>
                    </>
                  )}

                  {/* Custom tooltip — appears instantly, unlike the native title attribute */}
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute top-full left-1/2 z-10 mt-1.5 w-max max-w-[8rem] -translate-x-1/2 scale-95 rounded-md bg-black/90 px-2 py-1 text-center text-[0.68rem] font-medium text-white opacity-0 shadow-lg transition-all duration-100 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
                  >
                    {name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
