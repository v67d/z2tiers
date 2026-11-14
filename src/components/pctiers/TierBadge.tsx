import { cn } from "@/lib/utils";
import { tierLevel, tierName, type TierCode } from "@/lib/tiers";

type Props = {
  tier: TierCode;
  size?: "sm" | "lg" | "xl";
  className?: string;
};

export function TierBadge({ tier, size = "sm", className }: Props) {
  return (
    <span
      className={cn("tier-badge", className)}
      data-tier={tier}
      data-level={tierLevel(tier)}
      data-size={size}
      title={tierName(tier)}
    >
      {tier === "Unranked" ? "—" : tier}
    </span>
  );
}

export function TierDot({ tier, className }: { tier: TierCode; className?: string }) {
  return <span className={cn("tier-dot inline-block size-2 rounded-[2px]", className)} data-tier={tier} />;
}
