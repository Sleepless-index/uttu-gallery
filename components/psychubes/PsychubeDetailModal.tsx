"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { psychubeArtPath } from "@/lib/assets/psychubeAssets";
import { canAmplify } from "@/lib/types";
import type { Psychube, PsychubeProgress } from "@/lib/types";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";

interface PsychubeDetailModalProps {
  psychube: Psychube;
  progress: PsychubeProgress;
  onClose: () => void;
  onUpdateProgress: (patch: Partial<PsychubeProgress>) => void;
}

const MAX_LEVEL = 60;
const MAX_AMP = 5;
const QUICK_LEVELS = [20, 40, 60];

function IconClose() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconMinus() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function Stepper({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (next: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  function startEditing() {
    setDraft(String(value));
    setEditing(true);
  }

  function commit() {
    const parsed = Math.round(Number(draft));
    if (Number.isFinite(parsed)) {
      onChange(Math.max(0, Math.min(max, parsed)));
    }
    setEditing(false);
  }

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  return (
    <div className="flex flex-1 flex-col gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5">
      <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
        {label}
      </span>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value <= 0}
          aria-label={`Decrease ${label}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] active:bg-[var(--color-surface-hover)] disabled:opacity-30"
        >
          <IconMinus />
        </button>

        {editing ? (
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            min={0}
            max={max}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              } else if (e.key === "Escape") {
                e.preventDefault();
                setEditing(false);
              }
            }}
            className="w-14 rounded-md border border-[var(--color-accent)] bg-transparent text-center text-[0.95rem] font-semibold text-[var(--color-text)] tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        ) : (
          <button
            type="button"
            onClick={startEditing}
            aria-label={`Edit ${label} (currently ${value} of ${max})`}
            className="rounded-md px-1.5 py-0.5 text-[0.95rem] font-semibold text-[var(--color-text)] tabular-nums transition-colors hover:bg-[var(--color-surface-hover)]"
          >
            {value}
            <span className="text-[0.7rem] font-normal text-[var(--color-text-faint)]"> / {max}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] active:bg-[var(--color-surface-hover)] disabled:opacity-30"
        >
          <IconPlus />
        </button>
      </div>
    </div>
  );
}

export function PsychubeDetailModal({ psychube, progress, onClose, onUpdateProgress }: PsychubeDetailModalProps) {
  useBodyScrollLock();
  const amplifiable = canAmplify(psychube.rarity);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={psychube.name}
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 border-b border-[var(--color-border)] px-4 py-3">
          <span className="text-[0.95rem] font-semibold leading-tight text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
            {psychube.name}
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          >
            <IconClose />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="relative mx-auto mb-4 w-40 overflow-hidden rounded-lg border border-[var(--color-border)]" style={{ aspectRatio: "224 / 224" }}>
            <Image src={psychubeArtPath(psychube.id)} alt={psychube.name} fill sizes="160px" className="object-cover" />
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {QUICK_LEVELS.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => onUpdateProgress({ level: lvl })}
                aria-pressed={progress.level === lvl}
                className={`rounded-lg border px-2.5 py-1.5 text-[0.7rem] font-medium transition-colors ${
                  progress.level === lvl
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-dim)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
                }`}
              >
                Lv{lvl}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <Stepper label="Level" value={progress.level} max={MAX_LEVEL} onChange={(next) => onUpdateProgress({ level: next })} />
            {amplifiable && (
              <Stepper label="Amplification" value={progress.amp} max={MAX_AMP} onChange={(next) => onUpdateProgress({ amp: next })} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
