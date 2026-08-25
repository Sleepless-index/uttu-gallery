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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] px-4 py-10">
      <div className="flex w-full max-w-md flex-col items-center gap-10">
        <div className="grid w-full grid-cols-2 gap-3">
          {HOME_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-6 text-[var(--color-text-dim)] transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-surface)] [&_svg]:h-5 [&_svg]:w-5">
                {link.icon}
              </span>
              <span className="text-[0.85rem] font-semibold">{link.label}</span>
            </Link>
          ))}
        </div>

        <DateBadge scale={2} />

        <DailyResetCountdown />
      </div>
    </div>
  );
}
