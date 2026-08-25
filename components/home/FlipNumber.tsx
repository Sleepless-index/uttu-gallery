"use client";

import { useEffect, useRef, useState } from "react";

interface FlipDigitProps {
  /** Single character to display (a digit, but works for anything). */
  value: string;
}

/** A single boxed character that visually "flips" to its new value whenever
 * `value` changes — a lightweight CSS-only approximation of a mechanical
 * flip clock, built from two stacked halves that each get a brief rotateX
 * transition rather than a full 3D flip-card rig. */
function FlipDigit({ value }: FlipDigitProps) {
  const [display, setDisplay] = useState(value);
  const [flipping, setFlipping] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value === prevValue.current) return;
    prevValue.current = value;
    setFlipping(true);
    // Swap the displayed character partway through the flip, at the point
    // the card is edge-on and the change wouldn't be visible anyway —
    // matches how a real flip clock reveals the new leaf mid-motion.
    const swapTimer = setTimeout(() => setDisplay(value), 150);
    const endTimer = setTimeout(() => setFlipping(false), 300);
    return () => {
      clearTimeout(swapTimer);
      clearTimeout(endTimer);
    };
  }, [value]);

  return (
    <div
      className="relative flex h-11 w-8 items-center justify-center overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] sm:h-14 sm:w-10"
      style={{ perspective: "200px" }}
    >
      <span
        className="font-sans text-[1.5rem] font-bold tabular-nums text-[var(--color-text)] transition-transform duration-150 sm:text-[1.9rem]"
        style={{
          transform: flipping ? "rotateX(90deg)" : "rotateX(0deg)",
          transformOrigin: "center",
        }}
      >
        {display}
      </span>
      {/* Center seam, like the two-leaf split on a real flip clock. */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[var(--color-bg)]" />
    </div>
  );
}

interface FlipNumberProps {
  /** Zero-padded two-digit value, e.g. "09". Each character renders as its
   * own flipping card. */
  value: string;
}

/** Two FlipDigits side by side for a two-digit field (hours/minutes/seconds). */
export function FlipNumber({ value }: FlipNumberProps) {
  return (
    <div className="flex gap-[3px]">
      {value.split("").map((char, i) => (
        <FlipDigit key={i} value={char} />
      ))}
    </div>
  );
}
