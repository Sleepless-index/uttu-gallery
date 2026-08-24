"use client";

import { useEffect, useState } from "react";

/** "08 / Today 24"-style date badge — a stacked month/"Today" label next to
 * a large day number, with an orange bar crossing behind the lower portion
 * of the text. Purely decorative; always shows today's real date.
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
      className="relative flex items-end gap-[3px] font-extrabold text-[var(--color-text)]"
      style={{ fontFamily: "var(--font-date-badge)" }}
    >
      <div
        className="absolute z-0"
        style={{
          bottom: "-9px",
          left: "-5px",
          width: "139px",
          height: "16px",
          background: "var(--color-accent)",
        }}
      />

      <div
        className="relative z-10 mt-2.5 text-right leading-[17px]"
        style={{ fontSize: "18px" }}
      >
        {month} /
        <div
          className="font-thin italic tracking-[1px]"
          style={{ userSelect: "none" }}
        >
          <span className="text-[25px] font-medium">T</span>
          ODAY
        </div>
      </div>

      <div className="relative z-10 leading-[0.85]" style={{ fontSize: "40px" }}>
        {day}
      </div>
    </div>
  );
}
