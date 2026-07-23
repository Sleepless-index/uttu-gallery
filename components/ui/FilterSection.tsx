export function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[var(--color-border)] p-3 last:border-b-0">
      <span className="mb-1.5 block text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
        {title}
      </span>
      {children}
    </div>
  );
}
