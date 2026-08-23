import type { Afflatus } from "@/lib/types";

interface AfflatusMeta {
  label: Afflatus;
  colorVar: string;
  icon: string;
}

export const AFFLATUS_META: Record<Afflatus, AfflatusMeta> = {
  Star: { label: "Star", colorVar: "var(--color-afl-star)", icon: "/icons/afl_star.webp" },
  Plant: { label: "Plant", colorVar: "var(--color-afl-plant)", icon: "/icons/afl_plant.webp" },
  Mineral: { label: "Mineral", colorVar: "var(--color-afl-mineral)", icon: "/icons/afl_mineral.webp" },
  Beast: { label: "Beast", colorVar: "var(--color-afl-beast)", icon: "/icons/afl_beast.webp" },
  Spirit: { label: "Spirit", colorVar: "var(--color-afl-spirit)", icon: "/icons/afl_spirit.webp" },
  Intelligence: { label: "Intelligence", colorVar: "var(--color-afl-intellect)", icon: "/icons/afl_intellect.webp" },
};

/** Compact icon set (public/icons/af-{name}.webp) used for small inline UI
 * like the Arcanists filter menu, distinct from AFFLATUS_META.icon which is
 * the larger badge art used on character cards. */
const AFFLATUS_FILTER_ICON_SLUG: Record<Afflatus, string> = {
  Star: "star",
  Plant: "plant",
  Mineral: "mineral",
  Beast: "beast",
  Spirit: "spirit",
  Intelligence: "intellect",
};

export function afflatusFilterIconPath(afflatus: Afflatus): string {
  return `/icons/af-${AFFLATUS_FILTER_ICON_SLUG[afflatus]}.webp`;
}
