import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModeTabs } from "@/components/pctiers/ModeTabs";
import { PageHero } from "@/components/pctiers/PageHero";
import { Pager } from "@/components/pctiers/Pager";
import { PlayerAvatar } from "@/components/pctiers/PlayerAvatar";
import { Position } from "@/components/pctiers/Position";
import { TierBadge } from "@/components/pctiers/TierBadge";
import { GamemodeIcon } from "@/components/pctiers/GamemodeIcon";
import { modeQuery } from "@/lib/queries";
import { RANKED_TIERS, getGamemode, type TierCode } from "@/lib/tiers";

export const Route = createFileRoute("/rankings/$mode")({
  loader: async ({ context, params }) => {
    const mode = getGamemode(params.mode);
    if (!mode) throw notFound();
    await context.queryClient.ensureQueryData(modeQuery(mode.slug));
    return { name: mode.name };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.name;
    const title = name ? `${name} PvP Rankings — PCTIERS` : "Rankings — PCTIERS";
    const description = name
      ? `The ${name} Minecraft PvP leaderboard: every tested player, their tier, tester and test date.`
      : "Minecraft PvP gamemode leaderboard on PCTIERS.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">Unknown gamemode</h1>
      <p className="mt-2 text-muted-foreground">That gamemode isn’t tracked on PCTIERS.</p>
      <Link to="/rankings" className="mt-6 inline-block text-primary hover:underline">
        Back to rankings
      </Link>
    </div>
  ),
  component: ModeRankings,
});

const PAGE_SIZE = 15;
type Sort = "rank" | "az";

function ModeRankings() {
  const { mode: slug } = Route.useParams();
  const mode = getGamemode(slug)!;
  const { data } = useSuspenseQuery(modeQuery(mode.slug));
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<TierCode | "all">("all");
  const [sort, setSort] = useState<Sort>("rank");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = data.filter(
      (r) => (tier === "all" || r.tier === tier) && r.username.toLowerCase().includes(needle),
    );
    return sort === "az" ? [...list].sort((a, b) => a.username.localeCompare(b.username)) : list;
  }, [data, q, tier, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const reset = () => setPage(1);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 pt-10 sm:px-6">
      <PageHero
        eyebrow="Gamemode leaderboard"
        title={`${mode.name} Rankings`}
        subtitle={mode.blurb}
        icon={<GamemodeIcon slug={mode.slug} className="size-7" />}
      />
      <ModeTabs />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              reset();
            }}
            placeholder="Search players"
            className="h-11 rounded-xl bg-card pl-9"
            aria-label="Search players"
          />
        </div>
        <Select
          value={tier}
          onValueChange={(v) => {
            setTier(v as TierCode | "all");
            reset();
          }}
        >
          <SelectTrigger className="h-11 rounded-xl bg-card sm:w-44" aria-label="Filter by tier">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tiers</SelectItem>
            {RANKED_TIERS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
          <SelectTrigger className="h-11 rounded-xl bg-card sm:w-48" aria-label="Sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rank">Sort by ranking</SelectItem>
            <SelectItem value="az">Sort A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Player</th>
                <th className="px-4 py-3 font-medium">Tier</th>
                <th className="px-4 py-3 font-medium">Previous</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Last tested</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Tester</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.username} className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <Position n={r.position} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to="/players/$username"
                      params={{ username: r.username }}
                      className="flex items-center gap-3 font-semibold hover:text-primary"
                    >
                      <PlayerAvatar username={r.username} size={36} />
                      <span>
                        {r.username}
                        <span className="block text-xs font-normal text-muted-foreground">{r.region}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <TierBadge tier={r.tier} />
                  </td>
                  <td className="px-4 py-3">
                    {r.previousTier ? (
                      <TierBadge tier={r.previousTier} className="opacity-60" />
                    ) : (
                      <span className="text-xs text-muted-foreground">New</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {format(parseISO(r.lastTested), "MMM d, yyyy")}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{r.tester ?? "—"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No players match these filters.
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
