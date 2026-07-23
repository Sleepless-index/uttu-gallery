"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  characterArtPath,
  characterI2ArtPath,
  hasCharacterI2Art,
  afflatusIconPath,
  rarityPlatePath,
  insightIconPath,
} from "@/lib/assets/characterAssets";
import { parseDisplayName } from "@/lib/data/roster";
import { getCharacterDetail } from "@/lib/data/characterDetails";
import type { RosterCharacter, CharacterProgress } from "@/lib/types";

interface EditModalProps {
  character: RosterCharacter | null;
  progress: CharacterProgress | null;
  onClose: () => void;
  onUpdateProgress: (id: number, patch: Partial<CharacterProgress>) => void;
  onToggleWishlist: (id: number) => void;
  wishlisted: boolean;
  /** When false, renders a read-only quick-look: portrait + stats, no controls. */
  editable?: boolean;
  /** Global setting: show I2 art instead of base art when available. */
  showI2Art?: boolean;
}

type ModalTab = "overview" | "profile" | "stats" | "skills" | "upgrades";

const INSIGHT_TIER_NUMBER: Record<string, 1 | 2 | 3> = { I: 1, II: 2, III: 3 };

const TABS: { key: ModalTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "profile", label: "Profile" },
  { key: "stats", label: "Stats" },
  { key: "skills", label: "Skills" },
  { key: "upgrades", label: "Upgrades" },
];

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[0.6rem] uppercase tracking-wide text-[var(--color-text-faint)]">
        {label}
      </span>
      <span className="text-[0.75rem] font-medium text-[var(--color-text)]">{value}</span>
    </div>
  );
}

function EmptyTabNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="p-4 text-center text-[0.75rem] text-[var(--color-text-faint)]">{children}</p>
  );
}

function SingleStatRow({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[var(--color-border)] py-2 text-[0.75rem] last:border-b-0">
      <span className="text-[var(--color-text-dim)]">{label}</span>
      <span className="w-16 text-right font-mono font-semibold text-[var(--color-text)]">
        {value.toLocaleString()}
        {suffix}
      </span>
    </div>
  );
}

function IconStar({ filled }: { filled: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill={filled ? "currentColor" : "none"}>
      <path
        d="M8 1.5l1.9 4.2 4.6.5-3.4 3.1.9 4.6L8 11.7l-4 2.2.9-4.6L1.5 6.2l4.6-.5L8 1.5z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function StepperGroup({
  label,
  value,
  max,
  onChange,
  format,
  disabled,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  disabled?: boolean;
}) {
  const options = Array.from({ length: max + 1 }, (_, i) => i);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[0.7rem] font-medium text-[var(--color-text-dim)]">
          {label}
        </span>
        <span className="rounded-lg bg-[var(--color-accent-dim)] px-1.5 py-0.5 font-mono text-[0.65rem] font-medium text-[var(--color-accent-hover)]">
          {value === 0 ? "0" : format ? format(value) : value}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            disabled={disabled}
            onClick={() => onChange(opt)}
            className={`h-7 min-w-7 rounded-lg border px-1.5 font-mono text-[0.62rem] transition-colors disabled:cursor-not-allowed disabled:opacity-40
              ${
                value === opt
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-dim)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
              }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function EditModal({
  character,
  progress,
  onClose,
  onUpdateProgress,
  onToggleWishlist,
  wishlisted,
  editable = true,
  showI2Art = false,
}: EditModalProps) {
  const [levelDraft, setLevelDraft] = useState("");
  const [tab, setTab] = useState<ModalTab>("overview");

  useEffect(() => {
    setLevelDraft("");
    setTab("overview");
  }, [character?.id]);

  useEffect(() => {
    if (!character) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [character, onClose]);

  if (!character || !progress) return null;

  const detail = getCharacterDetail(character.slug)?.character;
  const displayName = parseDisplayName(character.name);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${displayName.text} details`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-2xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-2xl max-h-[88vh] pt-3"
      >
        {/* Preview */}
        <div className="relative hidden w-56 shrink-0 sm:block">
          {/* Afflatus bookmark — hangs above the preview's top edge, left side, matching the card treatment */}
          <div className="absolute left-2 top-[-0.75rem] z-20 h-11 w-7">
            <Image
              src={afflatusIconPath(character.afflatus)}
              alt={character.afflatus}
              fill
              sizes="28px"
              className="object-contain object-top drop-shadow-md"
            />
          </div>

          <div
            className="relative w-full overflow-hidden rounded-bl-2xl border border-[var(--color-border-strong)]"
            style={{ aspectRatio: "224 / 524" }}
          >
            {/* Solid backdrop — the character art has transparent cutout edges */}
            <div className="absolute inset-0 bg-[var(--color-surface)]" />

            {/* Dark gradient, subtle vignette from top to bottom */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/60" />

            {/* Character art, full bleed */}
            <Image
              src={
                showI2Art && hasCharacterI2Art(character.id)
                  ? characterI2ArtPath(character.id)
                  : characterArtPath(character.id)
              }
              alt={displayName.text}
              fill
              sizes="224px"
              className="object-cover object-top"
              priority
            />

            {/* Rarity plate, anchored to the bottom */}
            <div className="absolute inset-x-0 bottom-0 h-[55%]">
              <Image
                src={rarityPlatePath(character.rarity)}
                alt=""
                fill
                sizes="224px"
                className="object-cover object-bottom"
              />
            </div>

            {/* Name, raised off the bottom edge with breathing room below it */}
            <div className="absolute inset-x-0 bottom-5 z-10 px-2">
              <span
                className={`block truncate text-center text-[1.05rem] font-semibold leading-tight text-white ${displayName.italic ? "italic" : ""}`}
                style={{
                  textShadow: "0 1px 4px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.7)",
                  fontFamily: "var(--font-display)",
                }}
                title={displayName.text}
              >
                {displayName.text}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-1 flex-col overflow-y-auto rounded-tr-2xl">
          {/* Toolbar header */}
          <div className="flex items-center justify-between gap-2 p-3">
            <div className="flex flex-col gap-0.5 sm:hidden">
              <span className={`text-[0.9rem] font-semibold leading-none text-[var(--color-text)] ${displayName.italic ? "italic" : ""}`}>
                {displayName.text}
              </span>
              <span className="flex items-center gap-1 text-[0.65rem] text-[var(--color-text-faint)]">
                <span className="relative h-3.5 w-3.5 shrink-0">
                  <Image
                    src={afflatusIconPath(character.afflatus)}
                    alt={character.afflatus}
                    fill
                    sizes="14px"
                    className="object-contain"
                  />
                </span>
                {character.afflatus} · {character.rarity}★
              </span>
            </div>
            <span className="hidden text-[0.75rem] font-medium text-[var(--color-text-dim)] sm:inline">
              {editable ? "Edit case" : "Details"}
            </span>

            <div className="flex items-center gap-1.5">
              {editable ? (
                <button
                  onClick={() => onToggleWishlist(character.id)}
                  aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  aria-pressed={wishlisted}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors
                    ${
                      wishlisted
                        ? "border-[var(--color-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent-hover)]"
                        : "border-[var(--color-border)] text-[var(--color-text-faint)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
                    }`}
                >
                  <IconStar filled={wishlisted} />
                </button>
              ) : wishlisted ? (
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent-hover)]">
                  <IconStar filled />
                </span>
              ) : null}
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-faint)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
              >
                <IconClose />
              </button>
            </div>
          </div>

          {/* Header info row */}
          <div className="border-b border-[var(--color-border)] px-3 pb-3">
            <InfoField
              label="Acquisition Status"
              value={progress.owned ? "Owned" : "Not owned"}
            />
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 border-b border-[var(--color-border)] px-3">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative px-2.5 py-2.5 text-[0.72rem] font-medium transition-colors
                  ${
                    tab === t.key
                      ? "text-[var(--color-text)]"
                      : "text-[var(--color-text-faint)] hover:text-[var(--color-text-dim)]"
                  }`}
              >
                {t.label}
                {tab === t.key && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--color-accent)]" />
                )}
              </button>
            ))}
          </div>

          {/* Overview tab */}
          {tab === "overview" && (
            <>
              <div className="flex items-center gap-3 p-3">
                {editable ? (
                  <div className="flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5">
                    <button
                      onClick={() => onUpdateProgress(character.id, { owned: false })}
                      className={`rounded-lg px-3 py-1.5 text-[0.7rem] font-medium transition-colors
                        ${!progress.owned ? "bg-[var(--color-border-strong)] text-[var(--color-text)]" : "text-[var(--color-text-faint)] hover:text-[var(--color-text-dim)]"}`}
                    >
                      Not owned
                    </button>
                    <button
                      onClick={() => onUpdateProgress(character.id, { owned: true })}
                      className={`rounded-lg px-3 py-1.5 text-[0.7rem] font-medium transition-colors
                        ${progress.owned ? "bg-[var(--color-success)] text-white" : "text-[var(--color-text-faint)] hover:text-[var(--color-text-dim)]"}`}
                    >
                      Owned
                    </button>
                  </div>
                ) : (
                  <span
                    className={`rounded-lg px-3 py-1.5 text-[0.7rem] font-medium
                      ${progress.owned ? "bg-[var(--color-success)] text-white" : "bg-[var(--color-surface)] text-[var(--color-text-faint)]"}`}
                  >
                    {progress.owned ? "Owned" : "Not owned"}
                  </span>
                )}
              </div>

              {progress.owned && (
                <div className="grid grid-cols-1 gap-3.5 p-3 sm:grid-cols-2">
                  <StepperGroup
                    label="Portrait"
                    value={progress.portrait}
                    max={5}
                    disabled={!editable}
                    onChange={(v) => onUpdateProgress(character.id, { portrait: v })}
                  />
                  <StepperGroup
                    label="Resonance"
                    value={progress.resonance}
                    max={15}
                    disabled={!editable}
                    onChange={(v) => onUpdateProgress(character.id, { resonance: v })}
                  />
                  <StepperGroup
                    label="Insight"
                    value={progress.insight}
                    max={3}
                    disabled={!editable}
                    format={(v) => `I${v}`}
                    onChange={(v) => onUpdateProgress(character.id, { insight: v })}
                  />

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.7rem] font-medium text-[var(--color-text-dim)]">
                        Level
                      </span>
                      <span className="rounded-lg bg-[var(--color-accent-dim)] px-1.5 py-0.5 font-mono text-[0.65rem] font-medium text-[var(--color-accent-hover)]">
                        {progress.level || 0}
                      </span>
                    </div>
                    {editable ? (
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          min={1}
                          max={60}
                          placeholder={progress.level > 0 ? String(progress.level) : "1–60"}
                          value={levelDraft}
                          onChange={(e) => setLevelDraft(e.target.value)}
                          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-[0.72rem] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                        />
                        <button
                          onClick={() => {
                            const n = Number(levelDraft);
                            if (n >= 1 && n <= 60) {
                              onUpdateProgress(character.id, { level: n });
                              setLevelDraft("");
                            }
                          }}
                          className="shrink-0 rounded-lg border border-[var(--color-border-strong)] px-3 text-[0.68rem] font-medium text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
                        >
                          Set
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-[0.72rem] text-[var(--color-text-dim)]">
                        {progress.level || "—"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Profile tab */}
          {tab === "profile" && (
            <div className="flex flex-col gap-4 p-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
                <InfoField label="Rarity" value={`${character.rarity}★`} />
                <InfoField label="Afflatus" value={character.afflatus} />
                <InfoField label="Damage Type" value={detail?.identity.damage_type ?? "—"} />
                <InfoField
                  label="Class"
                  value={detail?.identity.role_tags.length ? detail.identity.role_tags.join(", ") : "—"}
                />
              </div>

              {detail && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[var(--color-border)] pt-3">
                  {detail.identity.title && (
                    <InfoField label="Title" value={detail.identity.title} />
                  )}
                  {detail.identity.va && <InfoField label="Voice Actor" value={detail.identity.va} />}
                  {detail.identity.other_names.length > 0 && (
                    <InfoField label="Other Names" value={detail.identity.other_names.join(", ")} />
                  )}
                  {detail.profile.medium && (
                    <InfoField label="Medium" value={detail.profile.medium} />
                  )}
                  {detail.profile.inspired && (
                    <InfoField label="Inspired By" value={detail.profile.inspired} />
                  )}
                  {detail.profile.fragrance_note && (
                    <InfoField label="Fragrance Note" value={detail.profile.fragrance_note} />
                  )}
                  {detail.profile.dimensions && (
                    <InfoField label="Dimensions" value={detail.profile.dimensions} />
                  )}
                  {detail.profile.exhibition_blurb && (
                    <div className="col-span-2">
                      <InfoField label="Exhibition Blurb" value={detail.profile.exhibition_blurb} />
                    </div>
                  )}
                </div>
              )}

              {!detail && (
                <p className="text-[0.75rem] text-[var(--color-text-faint)]">
                  No profile data yet for {displayName.text}.
                </p>
              )}
            </div>
          )}

          {/* Stats tab */}
          {tab === "stats" && (
            <div className="p-3">
              {detail?.combat.base_stats ? (
                <div>
                  <div className="grid grid-cols-[1fr_auto] gap-3 pb-1.5 text-[0.62rem] font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
                    <span>Stat</span>
                    <span className="w-16 text-right">Base</span>
                  </div>
                  <SingleStatRow label="ATK" value={detail.combat.base_stats.ATK} />
                  <SingleStatRow label="HP" value={detail.combat.base_stats.HP} />
                  <SingleStatRow label="Reality DEF" value={detail.combat.base_stats.reality_def} />
                  <SingleStatRow label="Mental DEF" value={detail.combat.base_stats.mental_def} />
                  <SingleStatRow
                    label="Critical Technique"
                    value={detail.combat.base_stats.critical_technique}
                  />
                </div>
              ) : (
                <EmptyTabNote>No stats data yet for {displayName.text}.</EmptyTabNote>
              )}
            </div>
          )}

          {/* Skills tab */}
          {tab === "skills" && (
            <div className="flex flex-col gap-2.5 p-3">
              <EmptyTabNote>
                No skill breakdown available yet for {displayName.text}. This data source doesn&apos;t
                yet include Incantation/Ultimate details — only Insight and Portray text (see the
                Upgrades tab).
              </EmptyTabNote>
            </div>
          )}

          {/* Upgrades tab */}
          {tab === "upgrades" && (
            <div className="flex flex-col gap-4 p-3">
              <div>
                <span className="mb-2 block text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
                  Insight Passives
                </span>
                {detail?.combat.skills.insights && detail.combat.skills.insights.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {detail.combat.skills.insights.map((p) => (
                      <div
                        key={p.tier}
                        className="flex items-start gap-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                      >
                        <span className="relative h-6 w-6 shrink-0">
                          <Image
                            src={insightIconPath(INSIGHT_TIER_NUMBER[p.tier])}
                            alt={`Insight ${p.tier}`}
                            fill
                            sizes="24px"
                            className="object-contain"
                          />
                        </span>
                        <p className="text-[0.75rem] leading-snug text-[var(--color-text-dim)]">
                          {p.text || <span className="text-[var(--color-text-faint)]">No text yet.</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyTabNote>No Insight passive data yet.</EmptyTabNote>
                )}
              </div>

              <div>
                <span className="mb-2 block text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
                  Portray Levels
                </span>
                {detail?.combat.skills.portray && detail.combat.skills.portray.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {detail.combat.skills.portray.map((p) => (
                      <div
                        key={p.level}
                        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                      >
                        <span className="mb-1 block text-[0.7rem] font-semibold text-[var(--color-accent-hover)]">
                          Lv. {p.level}
                        </span>
                        <p className="text-[0.75rem] leading-snug text-[var(--color-text-dim)]">
                          {p.text || <span className="text-[var(--color-text-faint)]">No text yet.</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyTabNote>No Portray data yet.</EmptyTabNote>
                )}
              </div>

              <div>
                <span className="mb-2 block text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
                  Euphoria
                </span>
                <EmptyTabNote>
                  Not available in this data source yet.
                </EmptyTabNote>
              </div>

              <div>
                <span className="mb-2 block text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
                  Materials
                </span>
                <EmptyTabNote>
                  Not available in this data source yet.
                </EmptyTabNote>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
