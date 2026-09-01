"use client";

import { useEffect, useRef, useState } from "react";

interface FlipDigitProps {
  /** Single character to display. */
  value: string;
}

/** A single boxed character that flips to its new value on change. */
function FlipDigit({ value }: FlipDigitProps) {
  const [display, setDisplay] = useState(value);
  const [flipping, setFlipping] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value === prevValue.current) return;
    prevValue.current = value;
    setFlipping(true);
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
      {/* Center seam */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[var(--color-bg)]" />
    </div>
  );
}

interface FlipNumberProps {
  /** Zero-padded two-digit value, e.g. "09". */
  value: string;
}

/** Two FlipDigits side by side for a two-digit field. */
export function FlipNumber({ value }: FlipNumberProps) {
  return (
    <div className="flex gap-[3px]">
      {value.split("").map((char, i) => (
        <FlipDigit key={i} value={char} />
      ))}
    </div>
  );
}