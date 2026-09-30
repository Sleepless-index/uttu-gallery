"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { parseDisplayName } from "@/lib/data/roster";
import { afflatusIconPath, characterArtPath } from "@/lib/assets/characterAssets";
import type { RosterCharacter } from "@/lib/types";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface ArcanistSearchProps {
  pool: RosterCharacter[];
  excludedIds: ReadonlySet<number>;
  disabled?: boolean;
  onPick: (id: number) => void;
}

export function ArcanistSearch({ pool, excludedIds, disabled = false, onPick }: ArcanistSearchProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = normalize(query);
    return pool
      .filter((c) => !excludedIds.has(c.id))
      .map((c) => ({ character: c, label: parseDisplayName(c.name).text }))
      .map((entry) => ({ ...entry, key: normalize(entry.label) }))
      .filter((entry) => q === "" || entry.key.includes(q))
      .sort((a, b) => {
        if (q !== "") {
          const aStarts = a.key.startsWith(q) ? 0 : 1;
          const bStarts = b.key.startsWith(q) ? 0 : 1;
          if (aStarts !== bStarts) return aStarts - bStarts;
        }
        return a.key.localeCompare(b.key);
      });
  }, [pool, excludedIds, query]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, open, listId]);

  function pick(id: number) {
    onPick(id);
    setQuery("");
    setActive(0);
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const entry = results[active];
      if (entry) pick(entry.character.id);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]">
        <IconSearch />
      </span>
      <input
        ref={inputRef}
        value={query}
        disabled={disabled}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && results.length > 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
        placeholder={disabled ? "Round over" : "Type an arcanist name…"}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-9 pr-3 text-[0.85rem] text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
      />

      {open && !disabled && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-1.5 max-h-52 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-1 shadow-2xl md:max-h-60"
        >
          {results.length === 0 ? (
            <li className="px-3 py-3 text-[0.75rem] text-[var(--color-text-faint)]">
              No arcanist matches “{query.trim()}”.
            </li>
          ) : (
            results.map((entry, index) => (
              <li
                key={entry.character.id}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => pick(entry.character.id)}
                onMouseMove={() => setActive(index)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-2.5 py-2 transition-colors ${
                  index === active
                    ? "border-[var(--color-accent)] bg-[var(--color-surface-hover)]"
                    : "border-transparent"
                }`}
              >
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
                  <Image
                    src={characterArtPath(entry.character.id)}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover object-top"
                  />
                </span>
                <span className="flex min-w-0 flex-1 items-center gap-1.5">
                  <span className="relative h-4 w-4 shrink-0">
                    <Image
                      src={afflatusIconPath(entry.character.afflatus)}
                      alt={entry.character.afflatus}
                      fill
                      sizes="16px"
                      className="object-contain"
                    />
                  </span>
                  <span className="truncate text-[0.82rem] font-medium text-[var(--color-text)]">
                    {entry.label}
                  </span>
                </span>
                <span className="shrink-0 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 text-[0.65rem] font-semibold tabular-nums text-[var(--color-text-dim)]">
                  {entry.character.rarity}★
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
