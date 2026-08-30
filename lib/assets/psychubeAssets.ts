import { assetUrl } from "./assetUrl";

/** Path to a Psychube's thumbnail art, relative to /public (or CDN). */
export function psychubeArtPath(id: number): string {
  return assetUrl(`/Psychubes/${id}.webp`);
}
