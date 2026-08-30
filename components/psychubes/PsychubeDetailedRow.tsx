import Image from "next/image";
import { psychubeArtPath } from "@/lib/assets/psychubeAssets";
import { canAmplify } from "@/lib/types";
import type { Psychube, PsychubeProgress } from "@/lib/types";

interface PsychubeDetailedRowProps {
  psychube: Psychube;
  progress: PsychubeProgress;
}

/** Horizontal thumbnail + name + Lv/Amplification readout, used under a
 * character card in Detailed team display mode. Matches the in-game
 * reference: square thumbnail on the left, name on top-right, "Lv.N" and
 * "AN" (accent-colored, short for Amplification N) stacked below it. */
export function PsychubeDetailedRow({ psychube, progress }: PsychubeDetailedRowProps) {
  const amplifiable = canAmplify(psychube.rarity);

  return (
    <div className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded" style={{ aspectRatio: "1 / 1" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={psychubeArtPath(psychube.id)} alt={psychube.name} className="h-full w-full scale-125 object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[0.68rem] font-medium leading-tight text-[var(--color-text)]">
          {psychube.name}
        </span>
        <span className="text-[0.62rem] leading-tight text-white">
          Lv.{progress.level}
          {amplifiable && <span className="ml-1.5 text-[var(--color-accent)]">A{progress.amp}</span>}
        </span>
      </div>
    </div>
  );
}