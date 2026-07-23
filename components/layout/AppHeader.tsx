"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Arcanists" },
  { href: "/tools", label: "Tools" },
];

export interface HeaderSubTab {
  key: string;
  label: string;
}

interface AppHeaderProps {
  rightSlot?: React.ReactNode;
  /** When provided, the nav item matching the current route becomes a dropdown with these sub-tabs. */
  subTabs?: HeaderSubTab[];
  activeSubTab?: string;
  onSubTabChange?: (key: string) => void;
}

function IconChevronSmall() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
      <path
        d="M2.5 4.5L6 8L9.5 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AppHeader({ rightSlot, subTabs, activeSubTab, onSubTabChange }: AppHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6">
      <div className="flex items-center gap-8">
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const hasSubTabs = active && subTabs && subTabs.length > 0;

            if (hasSubTabs) {
              return (
                <div className="relative" key={item.href} ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-expanded={menuOpen}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors
                      ${
                        active
                          ? "bg-[var(--color-accent)] text-white"
                          : "text-[var(--color-text-dim)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                      }`}
                  >
                    {item.label}
                    <IconChevronSmall />
                  </button>
                  {menuOpen && (
                    <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-44 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] py-1 shadow-xl">
                      {subTabs!.map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => {
                            onSubTabChange?.(tab.key);
                            setMenuOpen(false);
                          }}
                          className={`flex w-full items-center px-3 py-2 text-left text-[0.8rem] transition-colors
                            ${
                              activeSubTab === tab.key
                                ? "bg-[var(--color-accent-dim)] text-[var(--color-accent-hover)]"
                                : "text-[var(--color-text-dim)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                            }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors
                  ${
                    active
                      ? "bg-[var(--color-accent)] text-white"
                      : "text-[var(--color-text-dim)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {rightSlot && <div className="flex items-center gap-1.5">{rightSlot}</div>}
    </header>
  );
}
