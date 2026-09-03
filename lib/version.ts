/** The latest version currently live on Global. Anything with a strictly
 * higher numeric version has only released in CN and not reached Global
 * yet — that's what "Hide CN content" filters out. Bump this as Global
 * catches up to CN patches. */
export const GLB_VERSION = "3.7";

/** Non-numeric version tags (event/collab content, etc.) that should never
 * be treated as CN-only regardless of the numeric cutoff, since they don't
 * follow the X.Y patch numbering this comparison relies on. */
const ALWAYS_VISIBLE_VERSIONS = new Set(["s01", "s02"]);

/** True if `version` has only released in CN and hasn't reached Global —
 * i.e. it parses as a number strictly greater than GLB_VERSION. Missing,
 * unparseable, or explicitly-exempt versions are never treated as CN-only,
 * so content without version data (or non-numeric tags) stays visible by
 * default rather than being silently hidden. */
export function isCnOnly(version: string | undefined | null): boolean {
  if (!version) return false;
  if (ALWAYS_VISIBLE_VERSIONS.has(version)) return false;
  const parsed = Number(version);
  if (Number.isNaN(parsed)) return false;
  return parsed > Number(GLB_VERSION);
}

/** Sorts numeric versions ("3.9" before "1.0") for a latest-first list.
 * Non-numeric tags (s01/s02) and missing versions have no clear
 * chronological slot relative to numbered patches, so they're sorted to
 * the end rather than guessed at — safer than silently misplacing them
 * ahead of or behind a patch they may not actually relate to. */
export function compareVersionDesc(
  a: string | undefined | null,
  b: string | undefined | null
): number {
  const aNum = a ? Number(a) : NaN;
  const bNum = b ? Number(b) : NaN;
  const aValid = !Number.isNaN(aNum);
  const bValid = !Number.isNaN(bNum);
  if (aValid && bValid) return bNum - aNum;
  if (aValid) return -1;
  if (bValid) return 1;
  return 0;
}
