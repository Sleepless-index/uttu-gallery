"use client";

import Link from "next/link";
import { DateBadge } from "@/components/layout/DateBadge";
import { DailyResetCountdown } from "@/components/home/DailyResetCountdown";
import {
  IconArcanists,
  IconGarments,
  IconCleardrops,
  IconPlanner,
  IconMyCharacters,
  IconMyTeams,
} from "@/components/layout/navIcons";

const HOME_LINKS = [
  { href: "/characters", label: "Roster", icon: <IconMyCharacters /> },
  { href: "/teams", label: "Teams", icon: <IconMyTeams /> },
  { href: "/gallery/arcanists", label: "Arcanists", icon: <IconArcanists /> },
  { href: "/gallery/garments", label: "Garments", icon: <IconGarments /> },
  { href: "/tools/cleardrops", label: "Cleardrops", icon: <IconCleardrops /> },
  { href: "/tools/planner", label: "Planner", icon: <IconPlanner /> },
];

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[var(--color-bg)] px-5 py-7 sm:px-8 sm:py-9">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[var(--color-border-strong)] opacity-60"
      />

      <div className="relative mx-auto flex w-full max-w-3xl flex-col">
        <header className="border-b border-[var(--color-border)] pb-5 sm:pb-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="mb-2 text-[0.62rem] font-bold uppercase tracking-[0.28em] text-[var(--color-text-dim)]">
                Reverse: 1999
              </p>
              <h1 className="font-serif text-[2.45rem] font-medium leading-none tracking-[-0.045em] text-[var(--color-text)] sm:text-5xl">
                UTTU Archive
              </h1>
            </div>

            <div className="pt-1 text-right">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-dim)]">
                Field Terminal
              </p>
              <p className="mt-1 font-mono text-[0.62rem] text-[var(--color-text-dim)]">
                01 / 06
              </p>
            </div>
          </div>
        </header>

        <section className="flex items-center justify-between gap-5 border-b border-[var(--color-border)] py-5 sm:py-6">
          <div className="shrink-0">
            <DateBadge scale={1.8} />
          </div>

          <div className="min-w-0 text-right">
            <p className="mb-1 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-dim)]">
              Daily reset
            </p>
            <div className="flex justify-end">
              <DailyResetCountdown />
            </div>
          </div>
        </section>

        <section className="pt-7 sm:pt-8">
          <div className="mb-4 flex items-baseline justify-between border-b border-[var(--color-border)] pb-2">
            <h2 className="font-serif text-lg italic tracking-tight text-[var(--color-text)]">
              Index
            </h2>
            <span className="font-mono text-[0.58rem] text-[var(--color-text-dim)]">
              MODULES
            </span>
          </div>

          <nav
            aria-label="Quick access"
            className="grid w-full grid-cols-1 gap-0 sm:grid-cols-2"
          >
            {HOME_LINKS.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex min-h-[94px] items-center gap-4 border-b border-[var(--color-border)] px-1 py-5 text-[var(--color-text-dim)] transition-colors duration-200 hover:bg-[var(--color-surface)] hover:px-3 hover:text-[var(--color-text)] focus-visible:bg-[var(--color-surface)] focus-visible:outline-none sm:min-h-[106px] sm:px-3 sm:hover:px-5"
              >
                <span className="w-7 shrink-0 font-mono text-[0.58rem] text-[var(--color-text-dim)] opacity-70">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--color-border)] bg-[var(--color-panel)] transition-transform duration-200 group-hover:scale-105 [&_svg]:h-[1.1rem] [&_svg]:w-[1.1rem]">
                  {link.icon}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-[1.05rem] font-medium tracking-[-0.015em]">
                    {link.label}
                  </span>
                  <span className="mt-0.5 block text-[0.57rem] uppercase tracking-[0.18em] opacity-55">
                    Archive section
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className="font-serif text-lg opacity-25 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-80"
                >
                  ↗
                </span>
              </Link>
            ))}
          </nav>
        </section>

        <footer className="flex items-center justify-between pt-5 text-[0.57rem] uppercase tracking-[0.18em] text-[var(--color-text-dim)]">
          <span>UTTU / Archive interface</span>
          <span className="font-mono">v1.0</span>
        </footer>
      </div>
    </main>
  );
}
