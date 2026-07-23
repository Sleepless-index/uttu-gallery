import Image from "next/image";

interface ConversionTileProps {
  label: string;
  count: number;
  equivalentLabel?: string;
  iconSrc: string;
}

export function ConversionTile({
  label,
  count,
  equivalentLabel,
  iconSrc,
}: ConversionTileProps) {
  return (
    <div className="flex flex-1 items-center gap-3 rounded-lg bg-[var(--color-surface)] px-3.5 py-3">
      <div className="relative h-9 w-9 shrink-0">
        <Image src={iconSrc} alt="" fill sizes="36px" className="object-contain" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-[var(--color-text-faint)]">{label}</span>
        <span className="font-mono text-lg font-bold text-[var(--color-text)]">
          {count.toLocaleString()}
        </span>
        {equivalentLabel && (
          <span className="text-xs text-[var(--color-text-faint)]">
            {equivalentLabel}
          </span>
        )}
      </div>
    </div>
  );
}
