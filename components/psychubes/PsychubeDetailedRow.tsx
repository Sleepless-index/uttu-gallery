import Image from "next/image";
import { psychubeArtPath } from "@/lib/assets/psychubeAssets";
import { canAmplify } from "@/lib/types";
import type { Psychube, PsychubeProgress } from "@/lib/types";

interface PsychubeDetailedRowProps {
  psychube: Psychube;
  progress: PsychubeProgress;
}

export function PsychubeDetailedRow({ psychube, progress }: PsychubeDetailedRowProps) {
  const amplifiable = canAmplify(psychube.rarity);
  const showAmp = amplifiable && progress.amp > 0;

  return (
    <div className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5">
      <div className="relative h-12 w-12 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={psychubeArtPath(psychube.id)} alt={psychube.name} className="h-full w-full object-contain" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="line-clamp-2 text-[0.68rem] font-medium leading-tight text-[var(--color-text)]">
          {psychube.name}
        </span>
        <span className="text-[0.62rem] leading-tight text-white">
          Lv.{progress.level}
          {showAmp && <span className="ml-1.5 text-[var(--color-accent)]">A{progress.amp}</span>}
        </span>
      </div>
    </div>
  );
}
