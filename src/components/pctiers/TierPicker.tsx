import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GamemodeIcon } from "./GamemodeIcon";
import { TierBadge } from "./TierBadge";
import { GAMEMODES, RANKED_TIERS, type TierCode } from "@/lib/tiers";
import type { TierMap } from "@/lib/admin-tiers";

const NONE = "none";

/** One tier dropdown per gamemode. "No tier" removes the player from that mode. */
export function TierPicker({ value, onChange }: { value: TierMap; onChange: (v: TierMap) => void }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {GAMEMODES.map((g) => {
        const tier = value[g.slug];
        return (
          <div key={g.slug} className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-2 pl-3">
            <GamemodeIcon slug={g.slug} className="size-4 text-primary" />
            <span className="flex-1 text-sm font-medium">{g.name}</span>
            <Select
              value={tier ?? NONE}
              onValueChange={(v) => {
                const next = { ...value };
                if (v === NONE) delete next[g.slug];
                else next[g.slug] = v as TierCode;
                onChange(next);
              }}
            >
              <SelectTrigger className="h-9 w-32 bg-card" aria-label={`${g.name} tier`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>No tier</SelectItem>
                {RANKED_TIERS.map((t) => (
                  <SelectItem key={t} value={t}>
                    <TierBadge tier={t} className="px-1.5 py-0.5 text-[10px]" />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
}
