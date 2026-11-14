import { cn } from "@/lib/utils";
import { avatarUrl } from "@/lib/tiers";

export function PlayerAvatar({ username, size = 40, className }: { username: string; size?: number; className?: string }) {
  return (
    <img
      src={avatarUrl(username, size * 2)}
      alt={`${username}'s Minecraft head`}
      width={size}
      height={size}
      loading="lazy"
      className={cn("pixelated shrink-0 rounded-md bg-muted ring-1 ring-border", className)}
      style={{ width: size, height: size }}
    />
  );
}
