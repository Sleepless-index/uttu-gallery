"use client";

import { useState } from "react";
import Image from "next/image";
import { psychubeArtPath } from "@/lib/assets/psychubeAssets";
import { canAmplify } from "@/lib/types";
import type { Psychube, PsychubeProgress } from "@/lib/types";

interface PsychubeCardProps {
  psychube: Psychube;
  progress: PsychubeProgress;
  priority?: boolean;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export function PsychubeCard({ psychube, progress, priority = false }: PsychubeCardProps) {
  const [artLoaded, setArtLoaded] = useState(false);
  const [artErrored, setArtErrored] = useState(false);
  const showAmp = canAmplify(psychube.rarity) && progress.amp > 0;

  return (
    <div
      className="relative overflow-hidden rounded-md border border-[var(--color-border)]"
      style={{ aspectRatio: "224 / 224" }}
    >
      <div className="absolute inset-0 bg-[var(--color-surface)]" />
      {!artLoaded && !artErrored && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
      )}

      {!artErrored && (
        <Image
          src={psychubeArtPath(psychube.id)}
          alt={psychube.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 140px"
          className={`scale-125 object-cover transition-opacity duration-200 ${artLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setArtLoaded(true)}
          onError={() => setArtErrored(true)}
        />
      )}

      {artErrored && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface-hover)]">
          <span className="text-xl text-[var(--color-text-faint)]" style={{ fontFamily: "var(--font-display)" }}>
            {initials(psychube.name)}
          </span>
        </div>
      )}

      {showAmp && (
        <div className="absolute left-1.5 top-1.5 z-10 rounded bg-black/60 px-1.5 py-0.5 text-[0.65rem] font-bold leading-none text-[var(--color-accent)] sm:px-2 sm:py-1 sm:text-[0.8rem]">
          {progress.amp}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-1.5 z-10 flex flex-col items-center gap-0.5 px-1.5">
        <span
          className="text-[0.68rem] font-semibold leading-tight text-white sm:text-[0.75rem]"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
        >
          Lv.{progress.level}
        </span>
        <span
          className="block w-full truncate text-center text-[0.65rem] font-semibold leading-tight text-white"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)", fontFamily: "var(--font-display)" }}
        >
          {psychube.name}
        </span>
      </div>
    </div>
  );
}
