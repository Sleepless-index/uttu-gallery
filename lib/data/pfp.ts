import rawPfpIds from "@/data/pfp-ids.json";
import rawPfpNames from "@/data/pfp-names.json";
import { assetUrl } from "@/lib/assets/assetUrl";

/** All available profile-icon ids (filenames under /public/pfp, no extension). */
export const pfpIds: string[] = rawPfpIds as string[];

const pfpNames: Record<string, string> = rawPfpNames as Record<string, string>;

export function pfpPath(id: string): string {
  return assetUrl(`/pfp/${id}.webp`);
}

/** Display name for a profile icon, if known. */
export function pfpName(id: string): string {
  return pfpNames[id] ?? "Untitled";
}
