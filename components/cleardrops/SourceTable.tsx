import type { CleardropSource } from "@/lib/calculations/cleardrops";

interface SourceTableProps {
  sources: CleardropSource[];
  total: number;
}

export function SourceTable({ sources, total }: SourceTableProps) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex items-center justify-between px-1 text-[0.625rem] uppercase tracking-wide text-[var(--color-text-faint)]">
        <span>Source</span>
        <span>Cleardrops</span>
      </div>
      {sources.map((s) => {
        const pct = total > 0 ? Math.round((s.total / total) * 1000) / 10 : 0;
        return (
          <div key={s.key} className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2 truncate">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: s.color }}
              />
              <span className="truncate text-sm text-[var(--color-text)]">
                {s.label}
              </span>
            </div>
            <div className="flex shrink-0 items-baseline gap-1.5">
              <span className="font-mono text-sm font-medium text-[var(--color-text)]">
                {s.total.toLocaleString()}
              </span>
              <span className="w-10 text-right font-mono text-[0.625rem] text-[var(--color-text-faint)]">
                {pct}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
