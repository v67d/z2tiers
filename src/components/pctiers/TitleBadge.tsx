import { Award, Crown, Medal, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OverallTitle } from "@/lib/tiers";

const STYLE: Record<OverallTitle, { icon: typeof Crown; className: string }> = {
  "Combat Master": { icon: Crown, className: "bg-gradient-brand text-primary-foreground shadow-glow border-transparent" },
  "Combat Specialist": { icon: Award, className: "border-secondary/50 bg-secondary/15 text-foreground" },
  Noble: { icon: Medal, className: "border-primary/40 bg-primary/10 text-foreground" },
  Noobie: { icon: Sprout, className: "border-border bg-muted/60 text-muted-foreground" },
};

export function TitleBadge({ title, className }: { title: OverallTitle; className?: string }) {
  const s = STYLE[title];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2 py-1 text-xs font-semibold",
        s.className,
        className,
      )}
    >
      <s.icon className="size-3.5" aria-hidden="true" /> {title}
    </span>
  );
}
