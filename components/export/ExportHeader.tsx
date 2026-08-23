import { pfpPath } from "@/lib/data/pfp";
import type { UserProfile } from "@/lib/types";

const DEFAULT_NAME = "Timekeeper";

interface ExportHeaderProps {
  profile: UserProfile;
}

/** Avatar + name + UID banner shown at the top of every exported PNG.
 * Shared between the Roster export (ExportGrid) and the Teams export
 * (TeamExportGrid) so both PNGs identify whose collection they show. */
export function ExportHeader({ profile }: ExportHeaderProps) {
  const displayName = profile.name.trim() || DEFAULT_NAME;
  const uid = profile.uid.trim();

  return (
    <div className="mb-6 flex items-center gap-4">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-surface)]">
        {profile.pfpId && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pfpPath(profile.pfpId)} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="flex flex-col justify-center">
        <span className="text-[1.9rem] font-semibold leading-tight text-[var(--color-text)]">
          {displayName}
        </span>
        {uid && (
          <span className="mt-1 text-[1.15rem] leading-tight text-[var(--color-text-faint)]">
            UID: {uid}
          </span>
        )}
      </div>
    </div>
  );
}
