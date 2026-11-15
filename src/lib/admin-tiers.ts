import type { GamemodeSlug, TierCode } from "./tiers";

export type TierMap = Partial<Record<GamemodeSlug, TierCode>>;

/**
 * Tier updates to send when saving the admin editor.
 * Only modes whose tier changed are included; clearing a mode sends "Unranked",
 * which removes that player's tier in that mode.
 */
export function tierEdits(current: TierMap, next: TierMap): TierMap {
  const out: TierMap = {};
  const modes = new Set([...Object.keys(current), ...Object.keys(next)] as GamemodeSlug[]);
  for (const m of modes) {
    const before = current[m] ?? "Unranked";
    const after = next[m] ?? "Unranked";
    if (before !== after) out[m] = after;
  }
  return out;
}
