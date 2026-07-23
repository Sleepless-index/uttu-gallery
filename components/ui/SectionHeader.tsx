import { InfoTooltip } from "./InfoTooltip";

interface SectionHeaderProps {
  title: string;
  info?: React.ReactNode;
}

export function SectionHeader({ title, info }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center gap-1.5">
      <h2 className="text-sm font-semibold text-[var(--color-text)]">{title}</h2>
      {info && <InfoTooltip>{info}</InfoTooltip>}
    </div>
  );
}
