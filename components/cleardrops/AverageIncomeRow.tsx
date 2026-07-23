import Image from "next/image";
import { CURRENCY_ICONS } from "@/lib/assets/currencyAssets";

interface AverageIncomeRowProps {
  perDay: number;
  perWeek: number;
  perMonth: number;
}

function IncomeTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 rounded-lg bg-[var(--color-surface)] px-3 py-3.5 text-center">
      <span className="text-xs text-[var(--color-text-faint)]">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className="relative h-6 w-6 shrink-0">
          <Image src={CURRENCY_ICONS.cleardrops} alt="" fill sizes="24px" className="object-contain" />
        </div>
        <span className="font-mono text-lg font-bold text-[var(--color-text)]">
          {value.toLocaleString()}
        </span>
      </div>
      <span className="text-xs text-[var(--color-text-faint)]">Cleardrops</span>
    </div>
  );
}

export function AverageIncomeRow({ perDay, perWeek, perMonth }: AverageIncomeRowProps) {
  return (
    <div className="flex gap-2.5">
      <IncomeTile label="Per Day" value={perDay} />
      <IncomeTile label="Per Week" value={perWeek} />
      <IncomeTile label="Per Month" value={perMonth} />
    </div>
  );
}
