import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { z } from "zod";
import { buildOverall, fetchAllRankings, fetchDiscordOnline, publicDb } from "./pctiers.server";
import { sortTesters, testerStatus, type DiscordStatus } from "./testers";
import { GAMEMODES, compareTiers, isActiveGamemode, overallTitle, type GamemodeSlug, type TierCode } from "./tiers";

export type ChangeItem = {
  id: string;
  username: string;
  gamemode: GamemodeSlug;
  fromTier: TierCode | null;
  toTier: TierCode;
  tester: string | null;
  notes: string | null;
  changedAt: string;
};

type ChangeRow = {
  id: string;
  gamemode: GamemodeSlug;
  from_tier: TierCode | null;
  to_tier: TierCode;
  notes: string | null;
  changed_at: string;
  players: { username: string };
  testers: { username: string } | null;
};

function mapChange(r: ChangeRow): ChangeItem {
  return {
    id: r.id,
    username: r.players.username,
    gamemode: r.gamemode,
    fromTier: r.from_tier,
    toTier: r.to_tier,
    tester: r.testers?.username ?? null,
    notes: r.notes,
    changedAt: r.changed_at,
  };
}

const CHANGE_SELECT = "id, gamemode, from_tier, to_tier, notes, changed_at, players!inner(username), testers(username)";

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const db = publicDb();
  const [players, tests, testers, placements, changes, rankings] = await Promise.all([
    db.from("players").select("id", { count: "exact", head: true }),
    db.from("tier_changes").select("id", { count: "exact", head: true }),
    db.from("testers").select("id", { count: "exact", head: true }),
    db.from("tier_changes").select(CHANGE_SELECT).is("from_tier", null).order("changed_at", { ascending: false }).limit(6),
    db.from("tier_changes").select(CHANGE_SELECT).not("from_tier", "is", null).order("changed_at", { ascending: false }).limit(8),
    fetchAllRankings(),
  ]);
  for (const r of [players, tests, testers, placements, changes]) {
    if (r.error) throw new Error(`Could not load homepage data: ${r.error.message}`);
  }
  const perMode = Object.fromEntries(GAMEMODES.map((g) => [g.slug, 0])) as Record<GamemodeSlug, number>;
  for (const r of rankings) perMode[r.gamemode] = (perMode[r.gamemode] ?? 0) + 1;

  return {
    stats: { players: players.count ?? 0, tests: tests.count ?? 0, testers: testers.count ?? 0 },
    recentlyRanked: (placements.data as ChangeRow[]).map(mapChange),
    latestChanges: (changes.data as ChangeRow[]).map(mapChange),
    topPlayers: buildOverall(rankings).slice(0, 5),
    perMode,
  };
});

export const getOverallLeaderboard = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await fetchAllRankings();
  return buildOverall(rows);
});

export const getModeLeaderboard = createServerFn({ method: "GET" })
  .validator((d) => z.object({ mode: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const mode = GAMEMODES.find((g) => g.slug === data.mode);
    if (!mode) throw notFound();
    const db = publicDb();
    const { data: rows, error } = await db
      .from("rankings")
      .select("tier, previous_tier, last_tested, players!inner(username, region), testers(username)")
      .eq("gamemode", mode.slug);
    if (error) throw new Error(`Could not load ${mode.name} rankings: ${error.message}`);
    return (rows ?? [])
      .map((r) => ({
        username: r.players.username,
        region: r.players.region,
        tier: r.tier,
        previousTier: r.previous_tier,
        lastTested: r.last_tested,
        tester: r.testers?.username ?? null,
      }))
      .sort(
        (a, b) =>
          compareTiers(a.tier, b.tier) ||
          b.lastTested.localeCompare(a.lastTested) ||
          a.username.localeCompare(b.username),
      )
      .map((r, i) => ({ ...r, position: i + 1 }));
  });

export const getPlayerProfile = createServerFn({ method: "GET" })
  .validator((d) => z.object({ username: z.string().min(1).max(32) }).parse(d))
  .handler(async ({ data }) => {
    const db = publicDb();
    const { data: player, error } = await db
      .from("players")
      .select("id, username, region, joined_at")
      .ilike("username", data.username.replace(/[\\%_]/g, (c) => `\\${c}`))
      .maybeSingle();
    if (error) throw new Error(`Could not load player: ${error.message}`);
    if (!player) throw notFound();

    const [rankingsRes, historyRes, all] = await Promise.all([
      db.from("rankings").select("gamemode, tier, previous_tier, last_tested, testers(username)").eq("player_id", player.id),
      db.from("tier_changes").select(CHANGE_SELECT).eq("player_id", player.id).order("changed_at", { ascending: false }),
      fetchAllRankings(),
    ]);
    if (rankingsRes.error) throw new Error(rankingsRes.error.message);
    if (historyRes.error) throw new Error(historyRes.error.message);

    const overall = buildOverall(all).find((e) => e.username === player.username);
    const rankings = (rankingsRes.data ?? []).filter((r) => isActiveGamemode(r.gamemode)).map((r) => ({
      gamemode: r.gamemode,
      tier: r.tier,
      previousTier: r.previous_tier,
      lastTested: r.last_tested,
      tester: r.testers?.username ?? null,
    }));
    const history = (historyRes.data as ChangeRow[]).map(mapChange);

    return {
      player: { username: player.username, region: player.region, joinedAt: player.joined_at },
      rankings,
      history,
      stats: {
        position: overall?.position ?? null,
        totalPlayers: buildOverall(all).length,
        points: overall?.points ?? 0,
        title: overall?.title ?? overallTitle(0),
        bestTier: overall?.bestTier ?? ("Unranked" as TierCode),
        modesRanked: rankings.length,
        testsTaken: history.length,
        tier1Count: rankings.filter((r) => r.tier === "HT1" || r.tier === "LT1").length,
      },
    };
  });

export type TesterCard = {
  id: string;
  username: string;
  discordName: string | null;
  status: DiscordStatus;
  tests: number;
};

export const getTesters = createServerFn({ method: "GET" }).handler(async () => {
  const db = publicDb();
  const [testersRes, changesRes, online] = await Promise.all([
    db.from("testers").select("id, username, discord_name"),
    db.from("tier_changes").select("tester_id").not("tester_id", "is", null),
    fetchDiscordOnline(),
  ]);
  if (testersRes.error) throw new Error(`Could not load testers: ${testersRes.error.message}`);
  if (changesRes.error) throw new Error(`Could not load testers: ${changesRes.error.message}`);
  const counts = new Map<string, number>();
  for (const c of changesRes.data ?? []) if (c.tester_id) counts.set(c.tester_id, (counts.get(c.tester_id) ?? 0) + 1);
  const testers: TesterCard[] = (testersRes.data ?? []).map((t) => ({
    id: t.id,
    username: t.username,
    discordName: t.discord_name,
    status: testerStatus(t.discord_name, online ?? []),
    tests: counts.get(t.id) ?? 0,
  }));
  return { discordConnected: online !== null, onlineCount: online?.length ?? 0, testers: sortTesters(testers) };
});
