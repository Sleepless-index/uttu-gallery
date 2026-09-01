import { assetUrl } from "./assetUrl";

/** Currency icon paths, relative to /public. */
export const CURRENCY_ICONS = {
  cleardrops: assetUrl("/Icons/Currency/cleardrops.webp"),
  crystalDrops: assetUrl("/Icons/Currency/crystal-drops.webp"),
  unilog: assetUrl("/Icons/Currency/unilog.webp"),
} as const;
