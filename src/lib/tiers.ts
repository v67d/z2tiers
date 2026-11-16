import type { Database } from "@/integrations/supabase/types";

export type TierCode = Database["public"]["Enums"]["tier_code"];
export type GamemodeSlug = Database["public"]["Enums"]["gamemode"];

/** Highest to lowest. Index = ranking order. */
export const TIERS: readonly TierCode[] = [
  "HT1",
  "LT1",
  "HT2",
  "LT2",
  "HT3",
  "LT3",
  "HT4",
  "LT4",
  "HT5",
  "LT5",
  "Unranked",
] as const;

export const RANKED_TIERS = TIERS.filter((t) => t !== "Unranked");

const TIER_NAMES: Record<TierCode, string> = {
  HT1: "Highest Tier 1",
  LT1: "Lowest Tier 1",
  HT2: "Highest Tier 2",
  LT2: "Lowest Tier 2",
  HT3: "Highest Tier 3",
  LT3: "Lowest Tier 3",
  HT4: "Highest Tier 4",
  LT4: "Lowest Tier 4",
  HT5: "Highest Tier 5",
  LT5: "Lowest Tier 5",
  Unranked: "Unranked",
};

/** Points used for the overall leaderboard. */
const TIER_POINTS: Record<TierCode, number> = {
  HT1: 60,
  LT1: 45,
  HT2: 30,
  LT2: 20,
  HT3: 10,
  LT3: 6,
  HT4: 4,
  LT4: 3,
  HT5: 2,
  LT5: 1,
  Unranked: 0,
};

export function tierName(tier: TierCode) {
  return TIER_NAMES[tier];
}

export function tierPoints(tier: TierCode) {
  return TIER_POINTS[tier];
}

/** Lower = better. Unranked is last. */
export function tierRank(tier: TierCode) {
  return TIERS.indexOf(tier);
}

/** Tier number 1–5, or 0 for Unranked. Drives badge glow intensity. */
export function tierLevel(tier: TierCode) {
  if (tier === "Unranked") return 0;
  return Number(tier.slice(2));
}

export function compareTiers(a: TierCode, b: TierCode) {
  return tierRank(a) - tierRank(b);
}

/** Direction of a tier change: "up" when the new tier is better. */
export function tierMovement(from: TierCode | null, to: TierCode): "up" | "down" | "new" | "same" {
  if (!from) return "new";
  const d = tierRank(to) - tierRank(from);
  if (d < 0) return "up";
  if (d > 0) return "down";
  return "same";
}

export type Gamemode = { slug: GamemodeSlug; name: string; blurb: string };

export const GAMEMODES: readonly Gamemode[] = [
  { slug: "sword", name: "Sword", blurb: "Pure melee — spacing, crits and w-taps." },
  { slug: "axe", name: "Axe", blurb: "Shield-breaking, timing-heavy duels." },
  { slug: "crystal", name: "Crystal", blurb: "End crystals, anchors and totems." },
  { slug: "smp", name: "SMP", blurb: "Survival-server kit with pearls and gaps." },
  { slug: "uhc", name: "UHC", blurb: "No natural regen, golden heads, rods." },
  { slug: "pot", name: "Pot", blurb: "Splash-heal management and pressure." },
  { slug: "nethpot", name: "NethPot", blurb: "Netherite armour with potion support." },
  { slug: "mace", name: "Mace", blurb: "Wind charges, smash attacks and air control." },
  { slug: "diamond", name: "Diamond", blurb: "Classic full-diamond SMP combat." },
  { slug: "netherite", name: "Netherite", blurb: "Max-gear netherite brawls." },
  { slug: "spearmace", name: "Spear Mace", blurb: "Spear lunges mixed with mace smashes." },
  { slug: "elytra", name: "Elytra", blurb: "Mid-air fights, rockets and flight control." },
] as const;

export function getGamemode(slug: string): Gamemode | undefined {
  return GAMEMODES.find((g) => g.slug === slug);
}

/** True for gamemodes shown on the site (retired modes like Bow/Crossbow are excluded). */
export function isActiveGamemode(slug: string): slug is GamemodeSlug {
  return GAMEMODES.some((g) => g.slug === slug);
}

export type OverallTitle = "Combat Master" | "Combat Specialist" | "Noble" | "Noobie";

/** Minimum overall points for each title, highest first. */
export const TITLE_THRESHOLDS: readonly { title: OverallTitle; minPoints: number }[] = [
  { title: "Combat Master", minPoints: 150 },
  { title: "Combat Specialist", minPoints: 60 },
  { title: "Noble", minPoints: 20 },
  { title: "Noobie", minPoints: 0 },
];

/** Overall title earned from total points across all gamemodes. */
export function overallTitle(points: number): OverallTitle {
  return TITLE_THRESHOLDS.find((t) => points >= t.minPoints)?.title ?? "Noobie";
}

export function avatarUrl(username: string, size = 64) {
  return `https://mc-heads.net/avatar/${encodeURIComponent(username)}/${size}`;
}

export function bodyUrl(username: string, size = 280) {
  return `https://mc-heads.net/body/${encodeURIComponent(username)}/${size}`;
}

export const DISCORD_URL = "https://discord.gg/VwfudeGasW";

/** PCTIERS Discord server, used to read which testers are online. */
export const DISCORD_GUILD_ID = "1570963268372004886";
