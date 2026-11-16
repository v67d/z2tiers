import {
  Axe,
  Crosshair,
  Diamond,
  Feather,
  FlaskConical,
  Flame,
  Gem,
  Hammer,
  Heart,
  Shield,
  Swords,
  Target,
  Zap,
  Tent,
  type LucideIcon,
} from "lucide-react";
import type { GamemodeSlug } from "@/lib/tiers";

const ICONS: Record<GamemodeSlug, LucideIcon> = {
  sword: Swords,
  axe: Axe,
  crystal: Gem,
  smp: Tent,
  uhc: Heart,
  pot: FlaskConical,
  nethpot: Flame,
  mace: Hammer,
  diamond: Diamond,
  netherite: Shield,
  bow: Target,
  crossbow: Crosshair,
  spearmace: Zap,
  elytra: Feather,
};

export function GamemodeIcon({ slug, className }: { slug: GamemodeSlug; className?: string }) {
  const Icon = ICONS[slug];
  return <Icon className={className} aria-hidden="true" />;
}
