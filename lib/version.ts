/** The latest version currently live on Global. Anything with a strictly
 * higher numeric version has only released in CN and not reached Global
 * yet — that's what "Hide CN content" filters out. Bump this as Global
 * catches up to CN patches. */
export const GLB_VERSION = "3.7";

const ALWAYS_VISIBLE_VERSIONS = new Set(["s01", "s02"]);

export function isCnOnly(version: string | undefined | null): boolean {
  if (!version) return false;
  if (ALWAYS_VISIBLE_VERSIONS.has(version)) return false;
  const parsed = Number(version);
  if (Number.isNaN(parsed)) return false;
  return parsed > Number(GLB_VERSION);
}

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
