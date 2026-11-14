import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, ClipboardCheck, MessageCircle, Trophy, Users } from "lucide-react";
import heroImage from "@/assets/hero-arena.jpg";
import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "@/components/pctiers/PlayerAvatar";
import { TierBadge } from "@/components/pctiers/TierBadge";
import { GamemodeIcon } from "@/components/pctiers/GamemodeIcon";
import { TierChangeItem } from "@/components/pctiers/TierChangeItem";
import { homeQuery } from "@/lib/queries";
import { DISCORD_URL, GAMEMODES } from "@/lib/tiers";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PCTIERS — Minecraft PvP Rankings" },
      { name: "description", content: "The competitive standard for Minecraft PvP. Tier rankings across Sword, Crystal, Mace, UHC and more." },
      { property: "og:title", content: "PCTIERS — Minecraft PvP Rankings" },
      { property: "og:description", content: "The competitive standard for Minecraft PvP. Tier rankings across 12 gamemodes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery()),
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(homeQuery());
  const stats = [
    { label: "Ranked players", value: data.stats.players, icon: Users },
    { label: "Tests completed", value: data.stats.tests, icon: ClipboardCheck },
    { label: "Testers", value: data.stats.testers, icon: Trophy },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/70">
        <img
          src={heroImage}
          alt=""
          width={1920}
          height={1024}
          className="absolute inset-0 h-full w-full object-cover object-right opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="pixel-grid absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28">
          <div className="max-w-2xl animate-float-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-pixel text-[11px] uppercase tracking-wider text-primary">
              <span className="size-1.5 animate-pulse-glow rounded-full bg-primary" /> Season live
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] sm:text-6xl">
              Minecraft PvP <span className="text-gradient">Rankings</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">The competitive standard for Minecraft PvP.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/rankings">
                  Browse Rankings <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="glass" size="xl">
                <a href={DISCORD_URL} target="_blank" rel="noreferrer">
                  <MessageCircle /> Join Discord
                </a>
              </Button>
            </div>
          </div>

          <div className="mt-14 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="surface animate-float-up bg-card/80 p-5 backdrop-blur"
                style={{ animationDelay: `${120 + i * 80}ms` }}
              >
                <s.icon className="size-5 text-secondary" />
                <div className="mt-3 font-display text-3xl font-bold tabular-nums">{s.value.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 pt-14 sm:px-6">
        {/* Gamemodes */}
        <section>
          <SectionTitle title="Gamemodes" subtitle="Every mode has its own leaderboard." />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {GAMEMODES.map((g) => (
              <Link
                key={g.slug}
                to="/rankings/$mode"
                params={{ mode: g.slug }}
                className="surface surface-hover group flex flex-col gap-3 p-4 hover:-translate-y-0.5"
              >
                <span className="grid size-10 place-items-center rounded-lg bg-muted text-primary transition-colors group-hover:bg-gradient-brand group-hover:text-primary-foreground">
                  <GamemodeIcon slug={g.slug} className="size-5" />
                </span>
                <div>
                  <div className="font-display text-sm font-semibold">{g.name}</div>
                  <div className="text-xs text-muted-foreground">{data.perMode[g.slug]} ranked</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Top overall */}
          <section className="surface p-5 lg:col-span-1">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Top players</h2>
              <Link to="/rankings" className="text-sm text-primary hover:underline">
                Overall
              </Link>
            </div>
            <ol className="space-y-1">
              {data.topPlayers.map((p) => (
                <li key={p.username}>
                  <Link
                    to="/players/$username"
                    params={{ username: p.username }}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/60"
                  >
                    <span className="w-6 text-center font-pixel text-sm text-muted-foreground">{p.position}</span>
                    <PlayerAvatar username={p.username} size={34} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{p.username}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.points} pts · {p.modes} modes
                      </div>
                    </div>
                    <TierBadge tier={p.bestTier} />
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          {/* Recently ranked */}
          <section className="surface p-5">
            <h2 className="mb-4 text-lg font-semibold">Recently ranked</h2>
            <ul className="space-y-0.5">
              {data.recentlyRanked.map((c) => (
                <TierChangeItem key={c.id} change={c} />
              ))}
            </ul>
          </section>

          {/* Latest changes */}
          <section className="surface p-5">
            <h2 className="mb-4 text-lg font-semibold">Latest tier changes</h2>
            <ul className="space-y-0.5">
              {data.latestChanges.map((c) => (
                <TierChangeItem key={c.id} change={c} />
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
