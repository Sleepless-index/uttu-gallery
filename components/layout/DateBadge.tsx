"use client";

import { useEffect, useState } from "react";

/** "08 / Today 24"-style date badge — a stacked month/"Today" label next to
 * a large day number, with an orange bar crossing behind the lower portion
 * of the text. Purely decorative; always shows today's real date.
 *
 * Every size/spacing value below is an inline style rather than a Tailwind
 * utility class — deliberately, so this renders identically regardless of
 * how Tailwind's arbitrary-value classes get compiled/purged. Sized to sit
 * inside the mobile top bar's fixed h-11 (44px) row without overflowing it.
 *
 * Font: Noto Serif SC (see --font-date-badge in globals.css). Renders
 * nothing until mounted so the date is always the viewer's local date
 * rather than whatever the server happened to render at build/request time. */
export function DateBadge() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  if (!now) return null;

  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-end",
        gap: "2px",
        fontFamily: "var(--font-date-badge)",
        fontWeight: 800,
        color: "var(--color-text)",
      }}
    >
      <div
        style={{
          position: "absolute",
          zIndex: 0,
          bottom: "-5px",
          left: "-3px",
          width: "83px",
          height: "10px",
          background: "var(--color-accent)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          marginTop: "6px",
          textAlign: "right",
          lineHeight: "10px",
          fontSize: "11px",
        }}
      >
        {month} /
        <div
          style={{
            fontStyle: "italic",
            fontWeight: 100,
            letterSpacing: "0.6px",
            userSelect: "none",
          }}
        >
          <span style={{ fontSize: "15px", fontWeight: 500 }}>T</span>
          ODAY
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 10, lineHeight: 0.85, fontSize: "24px" }}>
        {day}
      </div>
    </div>
  );
}
