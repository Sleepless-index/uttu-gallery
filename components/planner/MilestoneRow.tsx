import Image from "next/image";
import { CURRENCY_ICONS } from "@/lib/assets/currencyAssets";

interface MilestoneRowProps {
  label: string;
  successChance: number;
  averagePulls: number;
  reached: boolean;
}

function chanceColor(pct: number): string {
  if (pct >= 0.9) return "var(--color-success)";
  if (pct >= 0.5) return "#c9d95f";
  if (pct >= 0.15) return "#e0b84f";
  if (pct >= 0.05) return "#d97a3d";
  return "var(--color-danger)";
}

export function MilestoneRow({
  label,
  successChance,
  averagePulls,
  reached,
}: MilestoneRowProps) {
  const pct = Math.round(successChance * 1000) / 10;
  const barWidth = reached ? 100 : Math.max(pct, 2);
  const color = reached ? "var(--color-accent)" : chanceColor(successChance);
  const labelFitsInBar = barWidth >= 22;

  return (
    <div className="grid grid-cols-[1fr_1.5fr_1.5fr] items-center gap-4 border-b border-[var(--color-border)] py-0 last:border-b-0">
      <div className="relative flex h-9 items-center overflow-hidden rounded-md bg-[var(--color-surface)]">
        <div
          className="absolute inset-y-0 left-0 rounded-md"
          style={{ width: `${barWidth}%`, background: color }}
        />
        <div
          className="relative flex h-full items-center"
          style={labelFitsInBar ? { paddingLeft: "0.625rem" } : { paddingLeft: `calc(${barWidth}% + 0.5rem)` }}
        >
          <span className="whitespace-nowrap rounded-full bg-black/30 px-2 py-0.5 text-[0.68rem] font-semibold text-white">
            {label}
          </span>
        </div>
      </div>

      <span
        className="text-center font-mono text-[0.8rem] font-semibold"
        style={{ color: reached ? "var(--color-text-faint)" : chanceColor(successChance) }}
      >
        {reached ? "owned" : `${pct}%`}
      </span>
      <span className="flex items-center justify-center gap-1.5 font-mono text-[0.8rem] text-[var(--color-text-dim)]">
        {Math.round(averagePulls)}
        <span className="relative h-4 w-4 shrink-0">
          <Image src={CURRENCY_ICONS.unilog} alt="" fill sizes="16px" className="object-contain" />
        </span>
      </span>
    </div>
  );
}
