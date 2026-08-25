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
    <main className="relative flex min-h-screen overflow-hidden bg-[var(--color-bg)] px-4 py-8 sm:px-6 sm:py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute left-1/2 top-[-18rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[var(--color-surface)] blur-3xl" />
        <div className="absolute bottom-[-14rem] left-[-10rem] h-[24rem] w-[24rem] rounded-full bg-[var(--color-panel)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-2xl flex-col">
        <header className="mb-7 flex items-center gap-5 px-1 sm:mb-8 sm:gap-6">
          <div className="min-w-0 flex-1">
            <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[var(--color-text-dim)]">
              Reverse: 1999
            </p>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold tracking-[-0.025em] text-[var(--color-text)] sm:text-3xl">
                UTTU Archive
              </h1>

              <div className="hidden shrink-0 sm:block">
                <DateBadge scale={1.8} />
              </div>
            </div>
          </div>
        </header>

        <div className="mb-6 flex justify-center sm:hidden">
          <DateBadge scale={1.8} />
        </div>

        <div className="mb-8 flex justify-center sm:justify-end">
          <DailyResetCountdown />
        </div>

        <section aria-label="Quick access">
          <div className="mb-4 flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-dim)]">
              Quick access
            </h2>
          </div>

          <nav className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5">
            {HOME_LINKS.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative flex min-h-[138px] flex-col justify-between overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 text-[var(--color-text-dim)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-strong)] active:translate-y-0"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-transform duration-200 group-hover:scale-105 [&_svg]:h-5 [&_svg]:w-5">
                  {link.icon}
                </span>

                <span className="flex items-end justify-between gap-2">
                  <span>
                    <span className="block text-[0.88rem] font-semibold tracking-tight">
                      {link.label}
                    </span>
                    <span className="mt-0.5 block text-[0.62rem] uppercase tracking-wider opacity-60">
                      Module {String(index + 1).padStart(2, "0")}
                    </span>
                  </span>
                  <span aria-hidden="true" className="translate-x-0 text-sm opacity-30 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-80">
                    →
                  </span>
                </span>
              </Link>
            ))}
          </nav>
        </section>

        <section
          aria-label="Daily status"
          className="mb-9 flex flex-col items-center gap-4 border-y border-[var(--color-border)] py-5 sm:mb-10 sm:flex-row sm:justify-between sm:border-y-0 sm:py-0 sm:pl-1"
        >
          <DateBadge scale={1.8} />

          <div className="flex min-w-0 items-center justify-center sm:justify-end">
            <DailyResetCountdown />
          </div>
        </section>

      </div>
    </main>
  );
}
