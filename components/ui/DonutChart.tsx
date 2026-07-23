interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
  centerLabel: string;
  centerValue: string;
  size?: number;
}

export function DonutChart({
  slices,
  centerLabel,
  centerValue,
  size = 180,
}: DonutChartProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const radius = size / 2;
  const strokeWidth = size * 0.16;
  const innerRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * innerRadius;

  let cumulative = 0;
  const segments = slices.map((slice) => {
    const fraction = total > 0 ? slice.value / total : 0;
    const dash = fraction * circumference;
    const offset = cumulative * circumference;
    cumulative += fraction;
    return { ...slice, dash, offset, fraction };
  });

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={radius}
            cy={radius}
            r={innerRadius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
            strokeDashoffset={-seg.offset}
            transform={`rotate(-90 ${radius} ${radius})`}
          />
        ))}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-[var(--color-text)]">
          {centerValue}
        </span>
        <span className="text-[0.625rem] text-[var(--color-text-faint)]">{centerLabel}</span>
      </div>
    </div>
  );
}
