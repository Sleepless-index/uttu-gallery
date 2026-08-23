/**
 * Resolves any static asset path (art, garments, icons, pfp) against a
 * configurable base URL instead of always assuming /public on this same
 * origin. This exists so heavy assets (e.g. hi-res splash art) can be
 * moved to an external CDN — a jsDelivr-fronted GitHub repo, for example —
 * without touching every call site that builds a path.
 *
 * Local dev / default: assets stay under /public, this is a no-op passthrough.
 * Once assets move off-repo: set NEXT_PUBLIC_ASSET_BASE_URL to the CDN root
 * (e.g. "https://cdn.jsdelivr.net/gh/{user}/{repo}@{tag}") and every helper
 * in characterAssets.ts / garmentAssets.ts / pfp.ts picks it up automatically.
 *
 * Pin to a release tag or commit SHA in the env var, not a branch name —
 * jsDelivr caches branch references (@main) and won't purge instantly when
 * new art is pushed, so a tag/SHA is the only way to control exactly when
 * an update goes live.
 */
const ASSET_BASE_URL = (process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? "").replace(/\/+$/, "");

/** Resolves a root-relative asset path (e.g. "/art/300301.webp") against
 * the configured asset base. Returns the path unchanged when no external
 * base is set, so local /public assets keep working with zero config. */
export function assetUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return ASSET_BASE_URL ? `${ASSET_BASE_URL}${normalized}` : normalized;
}
