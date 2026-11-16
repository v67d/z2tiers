import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ClipboardCheck, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/pctiers/PageHero";
import { PlayerAvatar } from "@/components/pctiers/PlayerAvatar";
import { testersQuery } from "@/lib/queries";
import { DISCORD_URL } from "@/lib/tiers";
import type { DiscordStatus } from "@/lib/testers";

export const Route = createFileRoute("/testers")({
  head: () => ({
    meta: [
      { title: "Testers — PCTIERS" },
      { name: "description", content: "PCTIERS Minecraft PvP testers and who is online on Discord right now." },
      { property: "og:title", content: "Testers — PCTIERS" },
      { property: "og:description", content: "See which PCTIERS testers are online on Discord and ready to test." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(testersQuery()),
  component: TestersPage,
});

const STATUS: Record<DiscordStatus, { label: string; dot: string }> = {
  online: { label: "Online", dot: "bg-success" },
  idle: { label: "Idle", dot: "bg-[color:var(--tier-ht1)]" },
  dnd: { label: "Do not disturb", dot: "bg-destructive" },
  offline: { label: "Offline", dot: "bg-muted-foreground/50" },
};

function TestersPage() {
  const { data } = useSuspenseQuery(testersQuery());
  const online = data.testers.filter((t) => t.status !== "offline").length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 pt-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHero
          eyebrow="Testers"
          title="Testers"
          subtitle="Online testers on our Discord are shown first. Offline testers move to the bottom."
          icon={<Users className="size-7" />}
        />
        <Button asChild variant="hero">
          <a href={DISCORD_URL} target="_blank" rel="noreferrer">
            <MessageCircle /> Join Discord to get tested
          </a>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="surface flex items-center gap-2 px-3 py-2">
          <span className="size-2.5 rounded-full bg-success shadow-[0_0_10px] shadow-success" />
          <span className="font-semibold tabular-nums">{online}</span>
          <span className="text-muted-foreground">of {data.testers.length} testers online</span>
        </span>
        {!data.discordConnected && (
          <span className="text-muted-foreground">Live Discord status isn't available right now, so everyone shows as offline.</span>
        )}
      </div>

      {data.testers.length === 0 ? (
        <div className="surface p-12 text-center text-muted-foreground">No testers yet.</div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.testers.map((t) => {
            const s = STATUS[t.status];
            const isOnline = t.status !== "offline";
            return (
              <li
                key={t.id}
                className={`surface flex items-center gap-4 p-4 transition-opacity ${isOnline ? "border-success/40" : "opacity-60"}`}
              >
                <div className="relative">
                  <PlayerAvatar username={t.username} size={48} />
                  <span
                    className={`absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-card ${s.dot}`}
                    aria-hidden="true"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{t.username}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {t.discordName ? `@${t.discordName}` : "No Discord linked"}
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className={isOnline ? "font-semibold text-success" : "text-muted-foreground"}>{s.label}</div>
                  <div className="mt-1 flex items-center justify-end gap-1 text-muted-foreground">
                    <ClipboardCheck className="size-3.5" /> {t.tests} tests
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
