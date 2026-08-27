import type { FlatGarment } from "@/lib/types";
import { assetUrl } from "./assetUrl";

/** Path to a garment's card art (used in grid/list views), relative to /public (or CDN). */
export function garmentCardPath(garment: FlatGarment): string {
  return assetUrl(`/Characters/Garments/${garment.id}.webp`);
}

/** Path to a garment's splash art (used in the detail modal), relative to /public (or CDN). */
export function garmentSplashPath(garment: FlatGarment): string {
  return assetUrl(`/Characters/Garments/splash/${garment.id}.webp`);
}

/** Path to a garment's full-body art (used in the detail modal), relative to /public (or CDN). */
export function garmentFullBodyPath(garment: FlatGarment): string {
  return assetUrl(`/Characters/Garments/fullbody/${garment.id}.webp`);
}

/** Garments always carry an English name in the new backend schema — this is now just a passthrough, kept for a stable import path. */
export function garmentDisplayName(garment: FlatGarment): string {
  return garment.name;
}
