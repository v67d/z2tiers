import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Crown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ModeTabs } from "@/components/pctiers/ModeTabs";
import { PageHero } from "@/components/pctiers/PageHero";
import { PlayerAvatar } from "@/components/pctiers/PlayerAvatar";
import { TierBadge } from "@/components/pctiers/TierBadge";
import { GamemodeIcon } from "@/components/pctiers/GamemodeIcon";
import { Position } from "@/components/pctiers/Position";
import { TitleBadge } from "@/components/pctiers/TitleBadge";
import { overallQuery } from "@/lib/queries";
import { GAMEMODES, TITLE_THRESHOLDS } from "@/lib/tiers";

export const Route = createFileRoute("/rankings/")({
  head: () => ({
    meta: [
      { title: "Overall Rankings — PCTIERS" },
      { name: "description", content: "The overall Minecraft PvP leaderboard, combining tiers from all 12 PCTIERS gamemodes." },
      { property: "og:title", content: "Overall Rankings — PCTIERS" },
      { property: "og:description", content: "The overall Minecraft PvP leaderboard across all 12 gamemodes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(overallQuery()),
  component: OverallRankings,
});

function OverallRankings() {
  const { data } = useSuspenseQuery(overallQuery());
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () => data.filter((p) => p.username.toLowerCase().includes(q.trim().toLowerCase())),
    [data, q],
  );
  // Everyone on one list — no pages, so every ranked player is visible.
  const rows = filtered;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 pt-10 sm:px-6">
      <PageHero
        eyebrow="Leaderboard"
        title="Overall Rankings"
        subtitle={`Every ranked player — ${data.length} total. Points from every gamemode tier, combined.`}
        icon={<Crown className="size-7" />}
      />
      <ModeTabs />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search players"
          className="h-11 rounded-xl bg-card pl-9"
          aria-label="Search players"
        />
      </div>

      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Player</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Points</th>
                <th className="px-4 py-3 font-medium">Best</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Gamemode tiers</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.username} className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <Position n={p.position} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to="/players/$username"
                      params={{ username: p.username }}
                      className="flex items-center gap-3 font-semibold hover:text-primary"
                    >
                      <PlayerAvatar username={p.username} size={36} />
                      <span>
                        {p.username}
                        <span className="block text-xs font-normal text-muted-foreground">{p.region}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <TitleBadge title={p.title} />
                  </td>
                  <td className="px-4 py-3 font-display font-semibold tabular-nums">{p.points}</td>
                  <td className="px-4 py-3">
                    <TierBadge tier={p.bestTier} />
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <div className="flex flex-wrap gap-1.5">
                      {GAMEMODES.filter((g) => p.tiers[g.slug]).map((g) => (
                        <span key={g.slug} className="flex items-center gap-1 rounded-lg bg-muted/70 py-0.5 pl-1.5 pr-0.5" title={g.name}>
                          <GamemodeIcon slug={g.slug} className="size-3.5 text-muted-foreground" />
                          <TierBadge tier={p.tiers[g.slug]!} className="px-1.5 py-1 text-[10px]" />
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    {q.trim() ? <>No players match “{q}”.</> : "No players ranked yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <TitleLegend />
    </div>
  );
}

function TitleLegend() {
  return (
    <div className="surface flex flex-wrap items-center gap-x-5 gap-y-3 p-4 text-sm text-muted-foreground">
      <span className="font-semibold text-foreground">Titles</span>
      {TITLE_THRESHOLDS.map((t) => (
        <span key={t.title} className="flex items-center gap-2">
          <TitleBadge title={t.title} />
          {t.minPoints > 0 ? `${t.minPoints}+ points` : `under ${TITLE_THRESHOLDS[TITLE_THRESHOLDS.length - 2].minPoints} points`}
        </span>
      ))}
    </div>
  );
}
