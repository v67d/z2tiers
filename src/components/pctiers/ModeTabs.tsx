import { Link } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import { GAMEMODES } from "@/lib/tiers";
import { GamemodeIcon } from "./GamemodeIcon";

const tab =
  "flex shrink-0 items-center gap-2 rounded-xl border border-transparent px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted data-[status=active]:border-primary/50 data-[status=active]:bg-primary/15 data-[status=active]:text-foreground";

export function ModeTabs() {
  return (
    <nav className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" aria-label="Gamemodes">
      <div className="flex w-max gap-1.5">
        <Link to="/rankings" className={tab} activeOptions={{ exact: true }}>
          <Crown className="size-4" /> Overall
        </Link>
        {GAMEMODES.map((g) => (
          <Link key={g.slug} to="/rankings/$mode" params={{ mode: g.slug }} className={tab}>
            <GamemodeIcon slug={g.slug} className="size-4" /> {g.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
