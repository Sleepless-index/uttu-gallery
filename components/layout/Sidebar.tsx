"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTrackerState } from "@/lib/hooks/useTrackerState";
import { pfpPath } from "@/lib/data/pfp";
import { PfpPickerModal } from "@/components/characters/PfpPickerModal";

const DEFAULT_NAME = "Timekeeper";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

function IconArcanists() {
  // Portrait bust — matches the "character" gallery
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5.3" r="2.8" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M2.5 14c0-2.8 2.46-4.5 5.5-4.5s5.5 1.7 5.5 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconGarments() {
  // Simple garment / hanger shape
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 2.5a1.4 1.4 0 0 1 1.4 1.4M4.5 5.3 8 3.4l3.5 1.9 3 2.6-1.7 1.9-1.3-1v5.7h-7.5V8.8l-1.3 1-1.7-1.9 3-2.6Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCleardrops() {
  // Droplet — currency/resource icon
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 2.2s4 4.32 4 7.1a4 4 0 1 1-8 0c0-2.78 4-7.1 4-7.1Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPlanner() {
  // Checklist — planning tool
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M5 8.1 6.6 9.7 10.8 5.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMyCharacters() {
  // 2x2 grid — a personal collection, distinct from the full gallery's bust icon
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconMyTeams() {
  // Two small busts side by side — a squad/team, distinct from a single roster bust
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="5.6" cy="5.1" r="2.3" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M1.6 13.6c0-2.3 1.9-3.7 4-3.7s4 1.4 4 3.7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="11.2" cy="4.3" r="1.7" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M9 9.3c.55-.4 1.3-.65 2.2-.65 1.9 0 3.3 1.15 3.3 3.05"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const MY_CHARACTERS_ITEM = {
  href: "/characters",
  label: "Roster",
  icon: <IconMyCharacters />,
};

const MY_TEAMS_ITEM = {
  href: "/teams",
  label: "Teams",
  icon: <IconMyTeams />,
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Gallery",
    items: [
      { href: "/gallery/arcanists", label: "Arcanists", icon: <IconArcanists /> },
      { href: "/gallery/garments", label: "Garments", icon: <IconGarments /> },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/tools/cleardrops", label: "Cleardrops", icon: <IconCleardrops /> },
      { href: "/tools/planner", label: "Planner", icon: <IconPlanner /> },
    ],
  },
];

function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5.3" r="2.8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 14c0-2.8 2.46-4.5 5.5-4.5s5.5 1.7 5.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M2.5 5H15.5M2.5 9H15.5M2.5 13H15.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const asideRef = useRef<HTMLElement>(null);
  const { state, hydrated, updateProfile } = useTrackerState();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingUid, setEditingUid] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [uidDraft, setUidDraft] = useState("");

  const profile = state.profile;
  const displayName = profile.name.trim() || DEFAULT_NAME;

  // Collapse the sidebar on any interaction outside it — but not while the
  // PFP picker modal is open (that's a separate overlay the person is still
  // actively using) and not for the click that opened it in the first place.
  useEffect(() => {
    if (!expanded || pickerOpen) return;
    function handlePointerDown(e: PointerEvent) {
      if (asideRef.current && !asideRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [expanded, pickerOpen]);

  function commitName() {
    updateProfile({ name: nameDraft.trim() });
    setEditingName(false);
  }

  function commitUid() {
    updateProfile({ uid: uidDraft.trim() });
    setEditingUid(false);
  }

  const allNavItems = [MY_CHARACTERS_ITEM, MY_TEAMS_ITEM, ...NAV_GROUPS.flatMap((g) => g.items)];

  return (
    <>
      {/* Mobile top bar — same inline tap-to-edit name/UID as the desktop
          rail's profile card, but plain (no bordered card wrapper) and
          smaller to keep the bar compact. */}
      {hydrated && (
        <div className="sticky top-0 z-40 flex h-11 shrink-0 items-center border-b border-[var(--color-border)] bg-[var(--color-panel)]/95 px-3 backdrop-blur md:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              aria-label="Change profile icon"
              className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors hover:border-[var(--color-border-strong)]"
            >
              {profile.pfpId ? (
                <Image src={pfpPath(profile.pfpId)} alt="Profile icon" fill sizes="28px" className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[var(--color-text-faint)]">
                  <IconUser />
                </span>
              )}
            </button>

            <div className="flex min-w-0 flex-col justify-center">
              {editingName ? (
                <input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onBlur={commitName}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitName();
                    if (e.key === "Escape") {
                      setNameDraft(profile.name);
                      setEditingName(false);
                    }
                  }}
                  placeholder={DEFAULT_NAME}
                  className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 text-[0.68rem] font-semibold text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setNameDraft(profile.name);
                    setEditingName(true);
                  }}
                  className="w-fit max-w-[9rem] truncate text-left text-[0.68rem] font-semibold leading-tight text-[var(--color-text)] transition-colors hover:text-[var(--color-accent)]"
                >
                  {displayName}
                </button>
              )}

              {editingUid ? (
                <input
                  autoFocus
                  value={uidDraft}
                  onChange={(e) => setUidDraft(e.target.value)}
                  onBlur={commitUid}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitUid();
                    if (e.key === "Escape") {
                      setUidDraft(profile.uid);
                      setEditingUid(false);
                    }
                  }}
                  placeholder="UID"
                  className="mt-0.5 w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 text-[0.58rem] text-[var(--color-text-faint)] outline-none focus:border-[var(--color-accent)]"
                />
              ) : profile.uid.trim() ? (
                <button
                  type="button"
                  onClick={() => {
                    setUidDraft(profile.uid);
                    setEditingUid(true);
                  }}
                  className="w-fit max-w-[9rem] truncate text-left text-[0.58rem] leading-tight text-[var(--color-text-faint)] transition-colors hover:text-[var(--color-text-dim)]"
                >
                  UID: {profile.uid}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setUidDraft("");
                    setEditingUid(true);
                  }}
                  className="w-fit text-left text-[0.58rem] leading-tight text-[var(--color-text-faint)] transition-colors hover:text-[var(--color-text-dim)]"
                >
                  + Add UID
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom nav — icons only, always visible, no expand/collapse
          (that interaction doesn't translate to touch). Desktop keeps the
          floating rail below untouched. */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-panel)]/95 px-1 backdrop-blur md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {allNavItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={`flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg text-[0.6rem] font-medium transition-colors
                ${active ? "text-[var(--color-accent)]" : "text-[var(--color-text-faint)]"}`}
            >
              <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop floating rail — unchanged from before, hidden on mobile. */}
      <aside
        ref={asideRef}
        className={`fixed left-3 top-3 bottom-3 z-40 hidden flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/95 shadow-2xl backdrop-blur transition-[width] duration-200 ease-out md:flex
          ${expanded ? "w-56" : "w-14"}`}
      >
        {/* Toggle */}
        <div className="flex h-14 shrink-0 items-center border-b border-[var(--color-border)] px-2.5">
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            aria-expanded={expanded}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-dim)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          >
            <IconMenu />
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-2 py-3">
          {/* My Characters — standalone, above Gallery */}
          <div className="flex flex-col gap-1">
            <Link
              href={MY_CHARACTERS_ITEM.href}
              title={expanded ? undefined : MY_CHARACTERS_ITEM.label}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.8rem] font-medium transition-colors
                ${expanded ? "" : "justify-center"}
                ${
                  pathname === MY_CHARACTERS_ITEM.href
                    ? "bg-[var(--color-accent)] text-white"
                    : "text-[var(--color-text-dim)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                }`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                {MY_CHARACTERS_ITEM.icon}
              </span>
              {expanded && <span className="truncate">{MY_CHARACTERS_ITEM.label}</span>}
            </Link>
            <Link
              href={MY_TEAMS_ITEM.href}
              title={expanded ? undefined : MY_TEAMS_ITEM.label}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.8rem] font-medium transition-colors
                ${expanded ? "" : "justify-center"}
                ${
                  pathname === MY_TEAMS_ITEM.href
                    ? "bg-[var(--color-accent)] text-white"
                    : "text-[var(--color-text-dim)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                }`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                {MY_TEAMS_ITEM.icon}
              </span>
              {expanded && <span className="truncate">{MY_TEAMS_ITEM.label}</span>}
            </Link>
          </div>

          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              {expanded ? (
                <span className="px-2.5 pb-1 text-[0.62rem] font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
                  {group.label}
                </span>
              ) : (
                <div className="mx-2 mb-1 h-px bg-[var(--color-border)]" />
              )}

              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={expanded ? undefined : item.label}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.8rem] font-medium transition-colors
                      ${expanded ? "" : "justify-center"}
                      ${
                        active
                          ? "bg-[var(--color-accent)] text-white"
                          : "text-[var(--color-text-dim)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                      }`}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                      {item.icon}
                    </span>
                    {expanded && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Profile — bottom of sidebar, as its own card with breathing room */}
        {hydrated && (
          <div className={`shrink-0 ${expanded ? "px-2.5 pb-3 pt-2" : "flex justify-center px-2.5 pb-3 pt-2"}`}>
            <div
              className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] ${expanded ? "px-2.5 py-2.5" : "flex w-12 shrink-0 justify-center px-0 py-1.5"}`}
            >
              <div className={`flex items-center gap-2.5 ${expanded ? "" : "justify-center"}`}>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                aria-label="Change profile icon"
                className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors hover:border-[var(--color-border-strong)]"
              >
                {profile.pfpId ? (
                  <Image src={pfpPath(profile.pfpId)} alt="Profile icon" fill sizes="36px" className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[var(--color-text-faint)]">
                    <IconUser />
                  </span>
                )}
              </button>

              {expanded && (
                <div className="flex min-w-0 flex-col justify-center">
                  {editingName ? (
                    <input
                      autoFocus
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      onBlur={commitName}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitName();
                        if (e.key === "Escape") {
                          setNameDraft(profile.name);
                          setEditingName(false);
                        }
                      }}
                      placeholder={DEFAULT_NAME}
                      className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 text-[0.78rem] font-semibold text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setNameDraft(profile.name);
                        setEditingName(true);
                      }}
                      className="w-fit truncate text-left text-[0.78rem] font-semibold text-[var(--color-text)] transition-colors hover:text-[var(--color-accent)]"
                    >
                      {displayName}
                    </button>
                  )}

                  {editingUid ? (
                    <input
                      autoFocus
                      value={uidDraft}
                      onChange={(e) => setUidDraft(e.target.value)}
                      onBlur={commitUid}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitUid();
                        if (e.key === "Escape") {
                          setUidDraft(profile.uid);
                          setEditingUid(false);
                        }
                      }}
                      placeholder="UID"
                      className="mt-0.5 w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 text-[0.65rem] text-[var(--color-text-faint)] outline-none focus:border-[var(--color-accent)]"
                    />
                  ) : profile.uid.trim() ? (
                    <button
                      type="button"
                      onClick={() => {
                        setUidDraft(profile.uid);
                        setEditingUid(true);
                      }}
                      className="w-fit truncate text-left text-[0.65rem] text-[var(--color-text-faint)] transition-colors hover:text-[var(--color-text-dim)]"
                    >
                      UID: {profile.uid}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setUidDraft("");
                        setEditingUid(true);
                      }}
                      className="w-fit text-left text-[0.65rem] text-[var(--color-text-faint)] transition-colors hover:text-[var(--color-text-dim)]"
                    >
                      + Add UID
                    </button>
                  )}
                </div>
              )}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Spacer so page content isn't tucked under the collapsed rail.
          The sidebar itself floats (fixed) above content; this just
          reserves layout space matching its collapsed width. Desktop only —
          the mobile bottom nav's space is reserved via padding in layout.tsx. */}
      <div aria-hidden className="hidden w-[4.25rem] shrink-0 md:block" />

      {pickerOpen && (
        <PfpPickerModal
          selectedId={profile.pfpId}
          onClose={() => setPickerOpen(false)}
          onSelect={(id) => {
            updateProfile({ pfpId: id });
            setPickerOpen(false);
          }}
        />
      )}
    </>
  );
}
