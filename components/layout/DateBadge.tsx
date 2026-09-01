"use client";

import { useEffect, useState } from "react";

interface DateBadgeProps {
  /** Multiplier applied to every size/spacing value below. */
  scale?: number;
}

/** "08 / Today 24"-style date badge. Shows today's real date. */
export function DateBadge({ scale = 1 }: DateBadgeProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  if (!now) return null;

  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const px = (base: number) => `${base * scale}px`;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-end",
        gap: px(2),
        fontFamily: "var(--font-date-badge)",
        fontWeight: 800,
        color: "var(--color-text)",
      }}
    >
      <div
        style={{
          position: "absolute",
          zIndex: 0,
          bottom: px(-5),
          left: px(-3),
          width: px(83),
          height: px(10),
          background: "var(--color-accent)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          marginTop: px(6),
          textAlign: "right",
          lineHeight: px(10),
          fontSize: px(11),
        }}
      >
        {month} /
        <div
          style={{
            fontStyle: "italic",
            fontWeight: 100,
            letterSpacing: px(0.6),
            userSelect: "none",
          }}
        >
          <span style={{ fontSize: px(15), fontWeight: 500 }}>T</span>
          ODAY
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 10, lineHeight: 0.85, fontSize: px(24) }}>
        {day}
      </div>
    </div>
  );
}