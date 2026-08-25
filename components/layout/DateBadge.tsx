"use client";

import { useEffect, useState } from "react";

interface DateBadgeProps {
  /** Multiplier applied to every size/spacing value below, so the same
   * proportions can be reused at a different scale (e.g. bigger in the
   * desktop sidebar's toggle row, which has more vertical room than the
   * mobile top bar this was originally sized for). Defaults to 1, the
   * mobile-bar-fitted size. */
  scale?: number;
}

/** "08 / Today 24"-style date badge — a stacked month/"Today" label next to
 * a large day number, with an orange bar crossing behind the lower portion
 * of the text. Purely decorative; always shows today's real date.
 *
 * Every size/spacing value below is an inline style rather than a Tailwind
 * utility class — deliberately, so this renders identically regardless of
 * how Tailwind's arbitrary-value classes get compiled/purged. Base values
 * (scale=1) fit the mobile top bar's fixed h-11 (44px) row without
 * overflowing it.
 *
 * Font: Noto Serif SC (see --font-date-badge in globals.css). Renders
 * nothing until mounted so the date is always the viewer's local date
 * rather than whatever the server happened to render at build/request time. */
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
