import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { CalendarDays, ClipboardCheck, Crown, Globe2, Layers, Star } from "lucide-react";
import { PlayerAvatar } from "@/components/pctiers/PlayerAvatar";
import { TierBadge } from "@/components/pctiers/TierBadge";
import { GamemodeIcon } from "@/components/pctiers/GamemodeIcon";
import { TierChangeItem } from "@/components/pctiers/TierChangeItem";
import { TitleBadge } from "@/components/pctiers/TitleBadge";
import { playerQuery } from "@/lib/queries";
import { GAMEMODES, bodyUrl, tierName } from "@/lib/tiers";

export const Route = createFileRoute("/players/$username")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(playerQuery(params.username));
    return { username: data.player.username, bestTier: data.stats.bestTier, points: data.stats.points };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.username} — PCTIERS Player Profile` : "Player — PCTIERS";
    const description = loaderData
      ? `${loaderData.username}'s Minecraft PvP tiers on PCTIERS. Best tier ${loaderData.bestTier}, ${loaderData.points} points.`
      : "Minecraft PvP player profile on PCTIERS.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">Player not found</h1>
      <p className="mt-2 text-muted-foreground">This player hasn’t been tested on PCTIERS yet.</p>
      <Link to="/rankings" className="mt-6 inline-block text-primary hover:underline">
        Browse rankings
      </Link>
    </div>
  ),
  component: PlayerProfile,
});

function PlayerProfile() {
  const { username } = Route.useParams();
  const { data } = useSuspenseQuery(playerQuery(username));
  const { player, stats, rankings, history } = data;
  const byMode = new Map(rankings.map((r) => [r.gamemode, r]));
  const recentChanges = history.filter((h) => h.fromTier).slice(0, 5);

  const statCards = [
    { label: "Overall position", value: stats.position ? `#${stats.position}` : "—", sub: `of ${stats.totalPlayers}`, icon: Crown },
    { label: "Points", value: stats.points, sub: "all gamemodes", icon: Star },
    { label: "Modes ranked", value: stats.modesRanked, sub: "of 12", icon: Layers },
    { label: "Tests taken", value: stats.testsTaken, sub: `${stats.tier1Count} at Tier 1`, icon: ClipboardCheck },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 pt-10 sm:px-6">
      {/* Header card */}
      <section className="surface relative overflow-hidden">
        <div className="pixel-grid absolute inset-0" />
        <div className="absolute -left-20 -top-24 size-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -right-10 bottom-0 size-72 rounded-full bg-secondary/20 blur-3xl" />
        <div className="relative grid gap-8 p-6 sm:p-8 md:grid-cols-[auto_1fr] md:items-center">
          <div className="mx-auto flex h-64 w-40 items-end justify-center md:mx-0">
            <img
              src={bodyUrl(player.username, 320)}
              alt={`${player.username}'s Minecraft skin`}
              width={160}
              height={256}
              className="pixelated max-h-full w-auto drop-shadow-[0_20px_30px_oklch(0_0_0/0.6)]"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <PlayerAvatar username={player.username} size={44} />
              <h1 className="text-3xl font-bold sm:text-4xl">{player.username}</h1>
              <TitleBadge title={stats.title} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Globe2 className="size-4" /> {player.region}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" /> Joined {format(parseISO(player.joinedAt), "MMMM yyyy")}
              </span>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <TierBadge tier={stats.bestTier} size="xl" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Best tier</div>
                <div className="font-semibold">{tierName(stats.bestTier)}</div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {statCards.map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-background/50 p-4">
                  <s.icon className="size-4 text-secondary" />
                  <div className="mt-2 font-display text-2xl font-bold tabular-nums">{s.value}</div>
                  <div className="text-xs text-muted-foreground">
                    {s.label} · {s.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gamemode tiers */}
      <section>
        <h2 className="mb-4 text-xl font-bold">Gamemode tiers</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {GAMEMODES.map((g) => {
            const r = byMode.get(g.slug);
            return (
              <Link
                key={g.slug}
                to="/rankings/$mode"
                params={{ mode: g.slug }}
                className={`surface surface-hover flex flex-col gap-3 p-4 ${r ? "" : "opacity-55"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <GamemodeIcon slug={g.slug} className="size-4 text-primary" /> {g.name}
                  </span>
                  <TierBadge tier={r?.tier ?? "Unranked"} size="lg" />
                </div>
                <div className="text-xs text-muted-foreground">
                  {r ? (
                    <>
                      {r.previousTier ? (
                        <span>
                          Previously <span className="font-semibold text-foreground">{r.previousTier}</span>
                        </span>
                      ) : (
                        <span>First placement</span>
                      )}
                      <span className="block">
                        Tested {format(parseISO(r.lastTested), "MMM d, yyyy")}
                        {r.tester ? ` by ${r.tester}` : ""}
                      </span>
                    </>
                  ) : (
                    <span>Not tested yet</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="surface p-5 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Recent tier changes</h2>
          {recentChanges.length ? (
            <ul className="space-y-0.5">
              {recentChanges.map((c) => (
                <TierChangeItem key={c.id} change={c} showPlayer={false} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No tier changes yet — only first placements.</p>
          )}
        </section>

        <section className="surface p-5 lg:col-span-3">
          <h2 className="mb-4 text-lg font-semibold">Testing history</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Gamemode</th>
                  <th className="pb-2 font-medium">Result</th>
                  <th className="hidden pb-2 font-medium sm:table-cell">Tester</th>
                  <th className="hidden pb-2 font-medium md:table-cell">Type</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-t border-border/60">
                    <td className="py-2.5 pr-3 text-muted-foreground">{format(new Date(h.changedAt), "MMM d, yyyy")}</td>
                    <td className="py-2.5 pr-3">
                      <span className="flex items-center gap-1.5">
                        <GamemodeIcon slug={h.gamemode} className="size-3.5 text-muted-foreground" />
                        {GAMEMODES.find((g) => g.slug === h.gamemode)?.name}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className="flex items-center gap-1.5">
                        {h.fromTier && (
                          <>
                            <TierBadge tier={h.fromTier} className="opacity-60" />
                            <span className="text-muted-foreground">→</span>
                          </>
                        )}
                        <TierBadge tier={h.toTier} />
                      </span>
                    </td>
                    <td className="hidden py-2.5 pr-3 text-muted-foreground sm:table-cell">{h.tester ?? "—"}</td>
                    <td className="hidden py-2.5 text-muted-foreground md:table-cell">{h.notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
