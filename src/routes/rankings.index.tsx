import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Crown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ModeTabs } from "@/components/pctiers/ModeTabs";
import { PageHero } from "@/components/pctiers/PageHero";
import { Pager } from "@/components/pctiers/Pager";
import { PlayerAvatar } from "@/components/pctiers/PlayerAvatar";
import { TierBadge } from "@/components/pctiers/TierBadge";
import { GamemodeIcon } from "@/components/pctiers/GamemodeIcon";
import { Position } from "@/components/pctiers/Position";
import { overallQuery } from "@/lib/queries";
import { GAMEMODES } from "@/lib/tiers";

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

const PAGE_SIZE = 15;

function OverallRankings() {
  const { data } = useSuspenseQuery(overallQuery());
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => data.filter((p) => p.username.toLowerCase().includes(q.trim().toLowerCase())),
    [data, q],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 pt-10 sm:px-6">
      <PageHero
        eyebrow="Leaderboard"
        title="Overall Rankings"
        subtitle="Points from every gamemode tier, combined."
        icon={<Crown className="size-7" />}
      />
      <ModeTabs />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
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
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    No players match “{q}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pager page={current} pageCount={pageCount} total={filtered.length} onPage={setPage} />
    </div>
  );
}
