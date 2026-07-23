"use client";

export function MenuItem({
  active,
  onClick,
  children,
  dot,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dot?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[0.75rem] transition-colors
        ${
          active
            ? "bg-[var(--color-accent-dim)] text-[var(--color-accent-hover)]"
            : "text-[var(--color-text-dim)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
        }`}
    >
      {dot && (
        <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: dot }} />
      )}
      {children}
    </button>
  );
}
