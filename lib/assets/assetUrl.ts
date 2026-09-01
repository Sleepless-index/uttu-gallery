/**
 * Resolves asset paths against a configurable CDN base URL.
 * Set NEXT_PUBLIC_ASSET_BASE_URL to serve assets from a CDN
 * (use a tag/SHA, not a branch, to control cache updates).
 */
const ASSET_BASE_URL = (process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? "").replace(/\/+$/, "");

/**
 * Mirrors next.config.ts's basePath for plain <img> strings that
 * bypass next/image (e.g. html-to-image exports).
 */
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");

/** Resolves a root-relative asset path against the configured base URL. */
export function assetUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (ASSET_BASE_URL) return `${ASSET_BASE_URL}${normalized}`;
  return `${BASE_PATH}${normalized}`;
}