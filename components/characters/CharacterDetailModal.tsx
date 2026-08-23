"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { RosterCharacter, CharacterProgress } from "@/lib/types";
import { garmentsForCharacter } from "@/lib/data/garments";
import { garmentCardPath, garmentDisplayName } from "@/lib/assets/garmentAssets";
import {
  characterArtPath,
  characterI2ArtPath,
  hasCharacterI2Art,
  afflatusIconPath,
  insightIconPath,
} from "@/lib/assets/characterAssets";
import { parseDisplayName } from "@/lib/data/roster";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";

interface CharacterDetailModalProps {
  character: RosterCharacter;
  progress: CharacterProgress;
  onClose: () => void;
  onUpdateProgress: (patch: Partial<CharacterProgress>) => void;
}

const MAX_LEVEL = 60;
const MAX_RESONANCE = 15;
const MAX_PORTRAIT = 5;

/** Level cap per Insight tier — 0 = Base. */
const INSIGHT_LEVEL_CAP: Record<number, number> = { 0: 30, 1: 40, 2: 50, 3: 60 };

interface QuickFillPreset {
  label: string;
  insight: number;
  level: number;
  resonance: number;
}

const QUICK_FILL_PRESETS: QuickFillPreset[] = [
  { label: "I3 · Lv30 · R10", insight: 3, level: 30, resonance: 10 },
  { label: "I3 · Lv60 · R10", insight: 3, level: 60, resonance: 10 },
];

/** One carousel entry — the character's base look, its Insight 2 alternate art, or a real garment. */
interface CarouselItem {
  key: string;
  garmentId?: number | "insight2";
  cardImage: string;
  label: string;
}

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

function IconChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 3.5L5 8l5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 3.5L11 8l-5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Stepper({
  label,
  value,
  max,
  onChange,
  rightSlot,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (next: number) => void;
  rightSlot?: React.ReactNode;
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
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
          {label}
        </span>
        {rightSlot}
      </div>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value <= 0}
          aria-label={`Decrease ${label}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] active:bg-[var(--color-surface-hover)] disabled:opacity-30 disabled:hover:border-[var(--color-border)] disabled:hover:text-[var(--color-text-dim)]"
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
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] active:bg-[var(--color-surface-hover)] disabled:opacity-30 disabled:hover:border-[var(--color-border)] disabled:hover:text-[var(--color-text-dim)]"
        >
          <IconPlus />
        </button>
      </div>
    </div>
  );
}

function InsightTierButtons({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((tier) => {
        const active = value === tier;
        return (
          <button
            key={tier}
            type="button"
            onClick={() => onChange(active ? 0 : tier)}
            aria-pressed={active}
            aria-label={`Set Insight ${tier}`}
            title={`Insight ${tier}`}
            className={`flex h-5 w-5 items-center justify-center rounded transition-colors duration-150
              ${active ? "bg-[var(--color-accent)]" : "bg-[var(--color-surface-hover)] hover:bg-[var(--color-border-strong)]"}`}
          >
            <span className="relative h-3 w-3">
              <Image
                src={insightIconPath(tier as 1 | 2 | 3)}
                alt={`Insight ${tier}`}
                fill
                sizes="12px"
                className={`object-contain ${active ? "" : "opacity-60"}`}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PortraitPips({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
          Portrait
        </span>
        <span className="text-[0.7rem] font-normal text-[var(--color-text-faint)] tabular-nums">
          {value} / {max}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
          const filled = n <= value;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(value === n ? n - 1 : n)}
              aria-label={`Set portrait to ${n}`}
              aria-pressed={filled}
              className={`flex h-8 flex-1 items-center justify-center rounded-md text-[0.75rem] font-semibold transition-colors duration-150
                ${
                  filled
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-[var(--color-surface-hover)] text-[var(--color-text-faint)] hover:text-[var(--color-text-dim)]"
                }`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Shortest signed distance from `index` to `center` on a ring of size `count`. */
function ringOffset(index: number, center: number, count: number): number {
  let diff = (index - center) % count;
  if (diff > count / 2) diff -= count;
  if (diff < -count / 2) diff += count;
  return diff;
}

function GarmentCarousel({
  items,
  centerIndex,
  onCenter,
  centerWidth = 116,
  sideWidth = 84,
}: {
  items: CarouselItem[];
  centerIndex: number;
  onCenter: (index: number) => void;
  centerWidth?: number;
  sideWidth?: number;
}) {
  const count = items.length;

  function go(delta: number) {
    onCenter(((centerIndex + delta) % count + count) % count);
  }

  // Real pixel widths per card state — side cards are genuinely smaller,
  // not just a scaled-down copy of the center card, so nothing clips.
  const CENTER_WIDTH = centerWidth;
  const SIDE_WIDTH = sideWidth;
  const CARD_GAP = 10; // visible breathing room between adjacent cards
  const CENTER_HEIGHT = Math.round((CENTER_WIDTH * 524) / 224);
  const SIDE_HEIGHT = Math.round((SIDE_WIDTH * 524) / 224);
  const LABEL_HEIGHT = 52;

  return (
    <div
      className="relative flex items-center justify-center overflow-visible"
      style={{ height: CENTER_HEIGHT + LABEL_HEIGHT }}
    >
      {count > 1 && (
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous garment"
          className="absolute left-0 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-panel)] text-[var(--color-text-dim)] shadow-md ring-1 ring-[var(--color-border)] transition-colors hover:text-[var(--color-text)]"
        >
          <IconChevronLeft />
        </button>
      )}

      <div className="relative h-full w-full">
        {items.map((item, i) => {
          const offset = ringOffset(i, centerIndex, count);
          // Only render the center card and its immediate neighbors — anything
          // further away would be fully hidden behind them anyway.
          if (Math.abs(offset) > 1) return null;

          const isCenter = offset === 0;
          const width = isCenter ? CENTER_WIDTH : SIDE_WIDTH;
          const cardHeight = isCenter ? CENTER_HEIGHT : SIDE_HEIGHT;
          const translateX = offset * (CENTER_WIDTH / 2 + SIDE_WIDTH / 2 + CARD_GAP);
          // Push shorter side-card images down so they align on the same
          // vertical center as the taller center card image.
          const topOffset = (CENTER_HEIGHT - cardHeight) / 2;
          const opacity = isCenter ? 1 : 0.45;
          const z = isCenter ? 20 : 10;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onCenter(i)}
              aria-pressed={isCenter}
              title={item.label}
              className="absolute left-1/2 top-0 flex flex-col items-center gap-1.5 transition-all duration-300 ease-out"
              style={{
                transform: `translateX(calc(-50% + ${translateX}px)) translateY(${topOffset}px)`,
                opacity,
                zIndex: z,
                width,
              }}
            >
              <div
                className={`relative w-full overflow-hidden rounded-lg border transition-colors duration-200
                  ${isCenter ? "border-[var(--color-accent)]" : "border-[var(--color-border)]"}`}
                style={{
                  aspectRatio: "224 / 524",
                  boxShadow: isCenter
                    ? "0 0 0 4px var(--color-accent), 0 0 0 7px rgba(0,0,0,0.85)"
                    : undefined,
                }}
              >
                <Image
                  src={item.cardImage}
                  alt={item.label}
                  fill
                  sizes="120px"
                  className="object-cover object-top"
                />
              </div>

              <span
                title={item.label}
                className={`w-full truncate text-center text-[0.7rem] leading-tight transition-colors duration-200
                  ${isCenter ? "font-semibold text-[var(--color-text)]" : "font-medium text-[var(--color-text-faint)]"}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {count > 1 && (
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next garment"
          className="absolute right-0 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-panel)] text-[var(--color-text-dim)] shadow-md ring-1 ring-[var(--color-border)] transition-colors hover:text-[var(--color-text)]"
        >
          <IconChevronRight />
        </button>
      )}
    </div>
  );
}

export function CharacterDetailModal({
  character,
  progress,
  onClose,
  onUpdateProgress,
}: CharacterDetailModalProps) {
  const displayName = parseDisplayName(character.name);
  const characterGarments = garmentsForCharacter(character.id);

  // Base look is always the first carousel entry, followed by the Insight 2
  // alternate art (when the character has one) and then real garments.
  const items: CarouselItem[] = useMemo(() => {
    const base: CarouselItem = {
      key: "base",
      garmentId: undefined,
      cardImage: characterArtPath(character.id),
      label: "Base",
    };
    const insight2: CarouselItem[] = hasCharacterI2Art(character.id)
      ? [
          {
            key: "insight2",
            garmentId: "insight2",
            cardImage: characterI2ArtPath(character.id),
            label: "Insight 2",
          },
        ]
      : [];
    const garmentItems: CarouselItem[] = characterGarments.map((g) => ({
      key: String(g.id),
      garmentId: g.id,
      cardImage: garmentCardPath(g),
      label: garmentDisplayName(g),
    }));
    return [base, ...insight2, ...garmentItems];
  }, [character.id, characterGarments]);

  const initialIndex = useMemo(() => {
    if (progress.selectedGarmentId == null) {
      // No stored preference — default to the Insight 2 look once the
      // character has actually reached Insight 2, if that art exists.
      if (progress.insight >= 2 && hasCharacterI2Art(character.id)) {
        const i2Idx = items.findIndex((it) => it.garmentId === "insight2");
        if (i2Idx !== -1) return i2Idx;
      }
      return 0; // base
    }
    const idx = items.findIndex((it) => it.garmentId === progress.selectedGarmentId);
    return idx === -1 ? 0 : idx;
  }, [items, progress.selectedGarmentId, progress.insight, character.id]);

  // `centerIndex` is purely a live preview — swiping/clicking through the
  // carousel while the modal is open only changes what's shown here. It is
  // NOT written back to progress unless the user explicitly presses Equip
  // (see equip() below), so browsing garments/art never silently overwrites
  // the user's stored preference.
  const [centerIndex, setCenterIndex] = useState(initialIndex);
  const centerIndexRef = useRef(centerIndex);
  centerIndexRef.current = centerIndex;

  // Lock background scroll while the modal is open, and restore it on close.
  useBodyScrollLock();

  function handleCenter(index: number) {
    setCenterIndex(index);
  }

  // If insight drops below 2 while the stored preference is the Insight 2
  // look, that preference no longer qualifies — clear it back to "no
  // preference" so the character falls back to Base (or re-derives
  // automatically if insight later climbs back to 2+).
  useEffect(() => {
    if (progress.selectedGarmentId === "insight2" && progress.insight < 2) {
      onUpdateProgress({ selectedGarmentId: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.insight]);

  // If the stored preference isn't set, keep the live preview in sync as
  // insight is raised to 2+ within this session (e.g. via the tier buttons
  // or a quick-fill preset) — same auto-default logic as initialIndex,
  // applied live instead of just on open.
  useEffect(() => {
    if (progress.selectedGarmentId != null) return;
    if (progress.insight < 2 || !hasCharacterI2Art(character.id)) return;
    const i2Idx = items.findIndex((it) => it.garmentId === "insight2");
    if (i2Idx !== -1 && i2Idx !== centerIndexRef.current) {
      setCenterIndex(i2Idx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.insight]);

  // Persist the preview as the user's explicit preference — only ever
  // triggered by the Equip button, never by browsing the carousel or
  // closing the modal. This is the one action that counts as "choosing"
  // a look, per the preview-vs-equip distinction.
  function equip() {
    const finalGarmentId = items[centerIndexRef.current]?.garmentId;
    if (finalGarmentId !== progress.selectedGarmentId) {
      onUpdateProgress({ selectedGarmentId: finalGarmentId });
    }
  }

  const isEquipped = (items[centerIndex]?.garmentId ?? undefined) === (progress.selectedGarmentId ?? undefined);

  const levelCap = INSIGHT_LEVEL_CAP[progress.insight] ?? MAX_LEVEL;

  function applyPreset(preset: QuickFillPreset) {
    onUpdateProgress({
      insight: preset.insight,
      level: preset.level,
      resonance: preset.resonance,
    });
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={displayName.text}
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-2xl sm:max-h-[90vh] sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Carousel — left column on desktop, top section on mobile.
            Base look + garments, replaces the old static portrait */}
        <div className="relative flex shrink-0 flex-col overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-3 sm:w-64 sm:border-b-0 sm:border-r sm:py-4">
          <span className="mb-2 block text-center text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
            Garments
          </span>
          <div className="flex flex-1 flex-col justify-center">
            <GarmentCarousel
              items={items}
              centerIndex={centerIndex}
              onCenter={handleCenter}
              centerWidth={116}
              sideWidth={78}
            />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <button
              type="button"
              onClick={equip}
              disabled={isEquipped}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[0.75rem] font-semibold transition-colors
                ${
                  isEquipped
                    ? "cursor-default bg-[var(--color-surface-hover)] text-[var(--color-text-faint)]"
                    : "border border-[var(--color-accent)] bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
                }`}
            >
              {isEquipped ? "Equipped" : "Equip"}
            </button>
          </div>
        </div>

        {/* Content — right column */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <div className="flex items-start justify-between gap-2 px-4 pt-4">
            <div>
              <span className="relative inline-block h-4 w-3 align-middle">
                <Image src={afflatusIconPath(character.afflatus)} alt={character.afflatus} fill sizes="12px" className="object-contain" />
              </span>
              <span
                className={`ml-1.5 align-middle text-[1.05rem] font-semibold leading-tight text-[var(--color-text)] ${displayName.italic ? "italic" : ""}`}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {displayName.text}
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-dim)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
            >
              <IconClose />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex flex-wrap gap-2">
              {QUICK_FILL_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-[0.7rem] font-medium text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
                >
                  <span className="relative h-3.5 w-3.5 shrink-0">
                    <Image src={insightIconPath(preset.insight as 1 | 2 | 3)} alt="" fill sizes="14px" className="object-contain" />
                  </span>
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Stepper
                label="Level"
                value={progress.level}
                max={levelCap}
                onChange={(next) => onUpdateProgress({ level: next })}
                rightSlot={
                  <InsightTierButtons
                    value={progress.insight}
                    onChange={(next) => {
                      const nextCap = INSIGHT_LEVEL_CAP[next] ?? MAX_LEVEL;
                      onUpdateProgress({
                        insight: next,
                        level: Math.min(progress.level, nextCap),
                      });
                    }}
                  />
                }
              />
              <Stepper
                label="Resonance"
                value={progress.resonance}
                max={MAX_RESONANCE}
                onChange={(next) => onUpdateProgress({ resonance: next })}
              />
            </div>

            <div className="mt-3 flex gap-3">
              <PortraitPips
                value={progress.portrait}
                max={MAX_PORTRAIT}
                onChange={(next) => onUpdateProgress({ portrait: next })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
