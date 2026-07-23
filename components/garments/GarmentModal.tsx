"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  garmentSplashPath,
  garmentFullBodyPath,
  garmentDisplayName,
} from "@/lib/assets/garmentAssets";
import { parseDisplayName } from "@/lib/data/roster";
import type { RosterCharacter, FlatGarment } from "@/lib/types";

interface GarmentModalProps {
  garment: FlatGarment | null;
  character: RosterCharacter | null;
  onClose: () => void;
}

export function GarmentModal({ garment, character, onClose }: GarmentModalProps) {
  const [showFullBody, setShowFullBody] = useState(false);

  useEffect(() => {
    setShowFullBody(false);
  }, [garment?.id]);

  useEffect(() => {
    if (!garment) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [garment, onClose]);

  if (!garment) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-md flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-2xl"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 p-3">
          <div className="min-w-0">
            <span className="block truncate text-[0.85rem] font-semibold text-[var(--color-text)]">
              {garmentDisplayName(garment)}
            </span>
            {character && (
              <span className="block truncate text-[0.68rem] text-[var(--color-text-faint)]">
                {parseDisplayName(character.name).text}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-faint)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          >
            <IconClose />
          </button>
        </div>

        {/* Art */}
        <div className="relative flex-1 overflow-hidden bg-[var(--color-surface)]">
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={showFullBody ? garmentFullBodyPath(garment) : garmentSplashPath(garment)}
              alt={garmentDisplayName(garment)}
              fill
              sizes="448px"
              className="object-contain"
            />
          </div>
        </div>

        {/* Splash / full-body toggle */}
        <div className="flex items-center justify-center gap-1 p-3">
          <div className="flex overflow-hidden rounded-lg border border-[var(--color-border)]">
            <button
              onClick={() => setShowFullBody(false)}
              className={`px-4 py-1.5 text-[0.72rem] font-medium transition-colors
                ${
                  !showFullBody
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-[var(--color-surface)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                }`}
            >
              Splash Art
            </button>
            <button
              onClick={() => setShowFullBody(true)}
              className={`px-4 py-1.5 text-[0.72rem] font-medium transition-colors
                ${
                  showFullBody
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-[var(--color-surface)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                }`}
            >
              Full Body
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
