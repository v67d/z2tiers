import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { tierPoints, compareTiers, type TierCode, type GamemodeSlug } from "./tiers";

/** Read-only client for public ranking data. Create per request. */
export function publicDb() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type RankingRow = {
  username: string;
  region: string;
  gamemode: GamemodeSlug;
  tier: TierCode;
  previousTier: TierCode | null;
  lastTested: string;
  tester: string | null;
};

/** Every ranking row, paged past the 1000-row API limit. */
export async function fetchAllRankings(): Promise<RankingRow[]> {
  const db = publicDb();
  const out: RankingRow[] = [];
  const page = 1000;
  for (let from = 0; ; from += page) {
    const { data, error } = await db
      .from("rankings")
      .select("gamemode, tier, previous_tier, last_tested, players!inner(username, region), testers(username)")
      .range(from, from + page - 1);
    if (error) throw new Error(`Could not load rankings: ${error.message}`);
    for (const r of data ?? []) {
      out.push({
        username: r.players.username,
        region: r.players.region,
        gamemode: r.gamemode,
        tier: r.tier,
        previousTier: r.previous_tier,
        lastTested: r.last_tested,
        tester: r.testers?.username ?? null,
      });
    }
    if (!data || data.length < page) break;
  }
  return out;
}

export type OverallEntry = {
  position: number;
  username: string;
  region: string;
  points: number;
  bestTier: TierCode;
  modes: number;
  tiers: Partial<Record<GamemodeSlug, TierCode>>;
};

export function buildOverall(rows: RankingRow[]): OverallEntry[] {
  const map = new Map<string, Omit<OverallEntry, "position">>();
  for (const r of rows) {
    const e =
      map.get(r.username) ??
      { username: r.username, region: r.region, points: 0, bestTier: "Unranked" as TierCode, modes: 0, tiers: {} };
    e.points += tierPoints(r.tier);
    e.modes += 1;
    e.tiers[r.gamemode] = r.tier;
    if (compareTiers(r.tier, e.bestTier) < 0) e.bestTier = r.tier;
    map.set(r.username, e);
  }
  return [...map.values()]
    .sort((a, b) => b.points - a.points || compareTiers(a.bestTier, b.bestTier) || a.username.localeCompare(b.username))
    .map((e, i) => ({ ...e, position: i + 1 }));
}
