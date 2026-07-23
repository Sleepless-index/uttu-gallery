import type { FlatGarment } from "@/lib/types";

/** Path to a garment's card art (used in grid/list views), relative to /public. */
export function garmentCardPath(garment: FlatGarment): string {
  return `/garments/cards/${garment.id}.webp`;
}

/** Path to a garment's splash art (used in the detail modal), relative to /public. */
export function garmentSplashPath(garment: FlatGarment): string {
  return `/garments/splash/${garment.id}.webp`;
}

/** Path to a garment's full-body art (used in the detail modal), relative to /public. */
export function garmentFullBodyPath(garment: FlatGarment): string {
  return `/garments/fullbody/${garment.id}.webp`;
}

/** Garments always carry an English name in the new backend schema — this is now just a passthrough, kept for a stable import path. */
export function garmentDisplayName(garment: FlatGarment): string {
  return garment.name;
}
