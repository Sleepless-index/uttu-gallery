interface BreakdownRowProps {
  label: string;
  formula: string;
  total: number;
}

export function BreakdownRow({ label, formula, total }: BreakdownRowProps) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--color-border)] py-3 last:border-b-0">
      <div className="flex flex-col gap-0.5">
        <span className="text-[0.8rem] font-medium text-[var(--color-text)]">{label}</span>
        <span className="text-[0.68rem] text-[var(--color-text-faint)]">{formula}</span>
      </div>
      <span className="font-mono text-[0.9rem] font-semibold text-[var(--color-text)]">
        {total.toLocaleString()}
      </span>
    </div>
  );
}
