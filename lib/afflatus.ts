import type { Afflatus } from "@/lib/types";
import { assetUrl } from "@/lib/assets/assetUrl";

interface AfflatusMeta {
  label: Afflatus;
  colorVar: string;
  icon: string;
}

export const AFFLATUS_META: Record<Afflatus, AfflatusMeta> = {
  Star: { label: "Star", colorVar: "var(--color-afl-star)", icon: assetUrl("/Icons/Afflatus/afl_star.webp") },
  Plant: { label: "Plant", colorVar: "var(--color-afl-plant)", icon: assetUrl("/Icons/Afflatus/afl_plant.webp") },
  Mineral: { label: "Mineral", colorVar: "var(--color-afl-mineral)", icon: assetUrl("/Icons/Afflatus/afl_mineral.webp") },
  Beast: { label: "Beast", colorVar: "var(--color-afl-beast)", icon: assetUrl("/Icons/Afflatus/afl_beast.webp") },
  Spirit: { label: "Spirit", colorVar: "var(--color-afl-spirit)", icon: assetUrl("/Icons/Afflatus/afl_spirit.webp") },
  Intelligence: { label: "Intelligence", colorVar: "var(--color-afl-intellect)", icon: assetUrl("/Icons/Afflatus/afl_intellect.webp") },
};
