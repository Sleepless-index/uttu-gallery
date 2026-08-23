/**
 * Character art/icon path helpers.
 *
 * roster.json no longer carries explicit artFile/i2ArtFile fields — instead,
 * every character's numeric id is a truncated prefix (e.g. 3144 for Coppélia),
 * and appending "01"/"02" reconstructs the full base/insight-2 art id
 * (314401 / 314402). This convention is confirmed to hold across all 130
 * characters in the current roster.
 */

import { assetUrl } from "./assetUrl";

/** Path to a character's base portrait art, relative to /public (or the
 * configured asset CDN — see assetUrl.ts). */
export function characterArtPath(id: number): string {
  return assetUrl(`/art/${id}01.webp`);
}

/**
 * Roster ids that have an Insight 2 alternate portrait on disk. There's no
 * explicit flag for this in roster.json, so this manifest is generated from
 * the actual contents of public/art — regenerate it if new i2 art is added.
 */
const I2_ART_IDS = new Set([
  3003, 3004, 3005, 3006, 3007, 3009, 3010, 3011, 3012, 3013, 3014, 3015,
  3016, 3017, 3018, 3020, 3022, 3024, 3025, 3026, 3028, 3031, 3032, 3033,
  3037, 3038, 3039, 3041, 3042, 3043, 3044, 3046, 3047, 3048, 3049, 3051,
  3052, 3053, 3056, 3057, 3058, 3060, 3061, 3062, 3063, 3064, 3065, 3066,
  3070, 3071, 3072, 3073, 3074, 3075, 3076, 3077, 3078, 3079, 3080, 3081,
  3082, 3083, 3084, 3086, 3087, 3088, 3091, 3092, 3094, 3095, 3097, 3098,
  3099, 3100, 3101, 3102, 3103, 3104, 3105, 3106, 3107, 3108, 3109, 3110,
  3111, 3112, 3113, 3114, 3115, 3116, 3117, 3118, 3120, 3121, 3122, 3123,
  3124, 3125, 3126, 3127, 3128, 3132, 3134, 3135, 3136, 3137, 3138, 3139,
  3140, 3141, 3142, 3143, 3144, 3145, 3146, 3147, 3149, 3151, 3154, 3156,
  3157,
]);

/** Whether a character has an Insight 2 alternate portrait available. */
export function hasCharacterI2Art(id: number): boolean {
  return I2_ART_IDS.has(id);
}

/** Path to a character's Insight 2 alternate portrait, relative to /public (or CDN). Falls back to the base art if none exists. */
export function characterI2ArtPath(id: number): string {
  if (!hasCharacterI2Art(id)) return characterArtPath(id);
  return assetUrl(`/art/${id}02.webp`);
}

/** Path to an afflatus icon, relative to /public (or CDN). */
export function afflatusIconPath(afflatus: string): string {
  // The "Intelligence" affinity's icon file is still named "afl_intellect.webp" on disk.
  const key = afflatus.toLowerCase() === "intelligence" ? "intellect" : afflatus.toLowerCase();
  return assetUrl(`/icons/afl_${key}.webp`);
}

/** Path to the rarity-colored bottom plate, relative to /public (or CDN). Falls back to the lowest available plate (2★) since no 1★ asset exists. */
export function rarityPlatePath(rarity: number): string {
  const clamped = Math.max(2, Math.min(6, rarity));
  return assetUrl(`/icons/bg-rare-${clamped}.webp`);
}

/** Path to an Insight tier badge icon (1, 2, or 3), relative to /public (or CDN). */
export function insightIconPath(tier: 1 | 2 | 3): string {
  return assetUrl(`/insight/insight-${tier}.webp`);
}
