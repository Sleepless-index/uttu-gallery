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
    <div className="flex min-h-screen flex-col items-center bg-[var(--color-bg)] px-4 pb-10 pt-12">
      <div className="flex w-full max-w-md flex-col items-center">
        <DateBadge scale={2.2} />

        <div className="mt-5">
          <DailyResetCountdown />
        </div>

        <div
          className="mt-8 h-px w-24"
          style={{ background: "var(--color-border-strong)" }}
        />

        <div className="mt-8 grid w-full grid-cols-3 gap-2.5">
          {HOME_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex flex-col items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)]/60 px-2 py-4 text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
            >
              <span className="flex h-7 w-7 items-center justify-center text-[var(--color-text-faint)] transition-colors [&_svg]:h-full [&_svg]:w-full group-hover:text-[var(--color-accent)]">
                {link.icon}
              </span>
              <span
                className="text-[0.7rem] font-medium italic tracking-wide"
                style={{ fontFamily: "var(--font-date-badge)" }}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
