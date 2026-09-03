"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CharacterCard } from "@/components/arcanists/CharacterCard";
import { PsychubeDetailedRow } from "@/components/psychubes/PsychubeDetailedRow";
import { psychubeArtPath } from "@/lib/assets/psychubeAssets";
import type { CharacterProgress, Psychube, PsychubeProgress, RosterCharacter, Team } from "@/lib/types";

export type PsychubeDisplayMode = "compact" | "detailed";

interface TeamCardProps {
  team: Team;
  /** 1-based display index ("NN"), independent of the team's storage id. */
  displayNumber: number;
  /** Resolves a slot's stored character id to its roster entry, if still owned. */
  resolveCharacter: (id: number) => RosterCharacter | undefined;
  /** Resolves a slot's stored Psychube id, respecting the Hide CN setting —
   * a CN-only equipped Psychube resolves to undefined here so the slot
   * displays as unequipped, same as resolveCharacter does for characters. */
  resolvePsychube: (id: number) => Psychube | undefined;
  getProgress: (id: number) => CharacterProgress;
  getPsychubeProgress: (id: number) => PsychubeProgress;
  psychubeDisplayMode: PsychubeDisplayMode;
  onRename: (name: string) => void;
  onDelete: () => void;
  onSlotClick: (slotIndex: number) => void;
  onSlotClear: (slotIndex: number) => void;
  onPsychubeClick: (slotIndex: number) => void;
}

function IconClose() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
      <path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 4.5h10M6.5 4.5V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5M4.5 4.5 5 13a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l.5-8.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPsychubeSlot() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Empty slot placeholder — same 224:524 aspect ratio as a filled CharacterCard
 * so the row stays aligned regardless of how many slots are filled. */
function EmptySlot({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add character to this slot"
      className="group flex w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-hover)]"
      style={{ aspectRatio: "224 / 524" }}
    >
      <span className="text-[var(--color-text-faint)] transition-colors group-hover:text-[var(--color-text-dim)]">
        <IconPlus />
      </span>
    </button>
  );
}

/** Compact-mode badge sitting middle-center, just above the character name
 * (not the bottom-right corner anymore) — the name stays centered like
 * every other page's CharacterCard. */
function PsychubeCompactBadge({ psychube, onClick }: { psychube?: Psychube; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={psychube ? `Change equipped psychube (${psychube.name})` : "Equip a psychube"}
      title={psychube?.name ?? "Equip a psychube"}
      className="absolute bottom-8 left-1/2 z-30 flex h-11 w-11 -translate-x-1/2 items-center justify-center overflow-hidden rounded-md text-[var(--color-text-faint)] transition-transform hover:scale-110 hover:text-[var(--color-text)] sm:bottom-10 sm:h-14 sm:w-14"
    >
      {psychube ? (
        <Image src={psychubeArtPath(psychube.id)} alt={psychube.name} fill sizes="56px" className="object-contain drop-shadow-lg" />
      ) : (
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-bg)] shadow-md sm:h-9 sm:w-9">
          <IconPsychubeSlot />
        </span>
      )}
    </button>
  );
}

function FilledSlot({
  character,
  progress,
  psychube,
  psychubeProgress,
  psychubeDisplayMode,
  onClick,
  onClear,
  onPsychubeClick,
}: {
  character: RosterCharacter;
  progress: CharacterProgress;
  psychube?: Psychube;
  psychubeProgress: PsychubeProgress;
  psychubeDisplayMode: PsychubeDisplayMode;
  onClick: () => void;
  onClear: () => void;
  onPsychubeClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="group/slot relative">
        <button type="button" onClick={onClick} className="block w-full text-left outline-none">
          <CharacterCard character={character} progress={progress} hideProgressStack />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          aria-label={`Remove ${character.name} from this slot`}
          className="absolute right-1.5 top-4 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-100 backdrop-blur-sm transition-opacity hover:bg-black/80 sm:opacity-0 sm:group-hover/slot:opacity-100"
        >
          <IconClose />
        </button>
        {psychubeDisplayMode === "compact" && <PsychubeCompactBadge psychube={psychube} onClick={onPsychubeClick} />}
      </div>

      {psychubeDisplayMode === "detailed" && (
        <button type="button" onClick={onPsychubeClick} className="block w-full text-left outline-none">
          {psychube ? (
            <PsychubeDetailedRow psychube={psychube} progress={psychubeProgress} />
          ) : (
            <div className="flex items-center justify-center gap-1.5 rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-2 text-[0.68rem] text-[var(--color-text-faint)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-dim)]">
              <IconPlus />
              Equip psychube
            </div>
          )}
        </button>
      )}
    </div>
  );
}

export function TeamCard({
  team,
  displayNumber,
  resolveCharacter,
  resolvePsychube,
  getProgress,
  getPsychubeProgress,
  psychubeDisplayMode,
  onRename,
  onDelete,
  onSlotClick,
  onSlotClear,
  onPsychubeClick,
}: TeamCardProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(team.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingName) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingName]);

  function commitName() {
    const trimmed = nameDraft.trim();
    onRename(trimmed || team.name);
    setEditingName(false);
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="shrink-0 text-2xl font-extrabold text-[var(--color-text-faint)]" style={{ fontFamily: "var(--font-display)" }}>
          {String(displayNumber).padStart(2, "0")}
        </span>

        {editingName ? (
          <input
            ref={inputRef}
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitName();
              } else if (e.key === "Escape") {
                e.preventDefault();
                setNameDraft(team.name);
                setEditingName(false);
              }
            }}
            className="min-w-0 flex-1 rounded-md border border-[var(--color-accent)] bg-transparent px-2 py-1 text-[0.85rem] font-semibold text-[var(--color-text)] outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setNameDraft(team.name);
              setEditingName(true);
            }}
            className="min-w-0 flex-1 truncate rounded-md px-2 py-1 text-left text-[0.85rem] font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-hover)]"
            title="Click to rename"
          >
            {team.name}
          </button>
        )}

        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${team.name}`}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--color-text-faint)] transition-colors hover:bg-[var(--color-danger)]/15 hover:text-[var(--color-danger)]"
        >
          <IconTrash />
        </button>
      </div>

      <div className="grid gap-2 [grid-template-columns:repeat(4,minmax(0,1fr))]">
        {team.slots.map((slot, slotIndex) => {
          const character = slot != null ? resolveCharacter(slot.characterId) : undefined;
          if (character && slot) {
            return (
              <FilledSlot
                key={slotIndex}
                character={character}
                progress={getProgress(character.id)}
                psychube={slot.psychubeId != null ? resolvePsychube(slot.psychubeId) : undefined}
                psychubeProgress={slot.psychubeId != null ? getPsychubeProgress(slot.psychubeId) : { level: 0, amp: 0 }}
                psychubeDisplayMode={psychubeDisplayMode}
                onClick={() => onSlotClick(slotIndex)}
                onClear={() => onSlotClear(slotIndex)}
                onPsychubeClick={() => onPsychubeClick(slotIndex)}
              />
            );
          }
          return <EmptySlot key={slotIndex} onClick={() => onSlotClick(slotIndex)} />;
        })}
      </div>
    </div>
  );
}
