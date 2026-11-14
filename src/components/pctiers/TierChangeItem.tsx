import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, ArrowUp, Sparkles } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { getGamemode, tierMovement } from "@/lib/tiers";
import type { ChangeItem } from "@/lib/pctiers.functions";
import { PlayerAvatar } from "./PlayerAvatar";
import { TierBadge } from "./TierBadge";
import { GamemodeIcon } from "./GamemodeIcon";

export function TierChangeItem({ change, showPlayer = true }: { change: ChangeItem; showPlayer?: boolean }) {
  const move = tierMovement(change.fromTier, change.toTier);
  const mode = getGamemode(change.gamemode);
  const MoveIcon = move === "up" ? ArrowUp : move === "down" ? ArrowDown : move === "new" ? Sparkles : ArrowRight;
  const moveClass =
    move === "up" ? "text-success" : move === "down" ? "text-destructive" : "text-secondary";

  return (
    <li className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60">
      {showPlayer && <PlayerAvatar username={change.username} size={34} />}
      <div className="min-w-0 flex-1">
        {showPlayer ? (
          <Link
            to="/players/$username"
            params={{ username: change.username }}
            className="block truncate font-semibold hover:text-primary"
          >
            {change.username}
          </Link>
        ) : null}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <GamemodeIcon slug={change.gamemode} className="size-3.5" />
          <span>{mode?.name}</span>
          <span aria-hidden>·</span>
          <span suppressHydrationWarning>{formatDistanceToNowStrict(new Date(change.changedAt), { addSuffix: true })}</span>
          {change.tester && (
            <>
              <span aria-hidden>·</span>
              <span className="truncate">by {change.tester}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {change.fromTier && <TierBadge tier={change.fromTier} className="opacity-70" />}
        <MoveIcon className={`size-4 ${moveClass}`} aria-label={move} />
        <TierBadge tier={change.toTier} />
      </div>
    </li>
  );
}
