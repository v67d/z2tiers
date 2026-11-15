import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LogOut, Pencil, Plus, Search, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StormBackdrop } from "@/components/pctiers/StormBackdrop";
import { PlayerAvatar } from "@/components/pctiers/PlayerAvatar";
import { TierBadge } from "@/components/pctiers/TierBadge";
import { GamemodeIcon } from "@/components/pctiers/GamemodeIcon";
import { TierPicker } from "@/components/pctiers/TierPicker";
import {
  createPlayer,
  deletePlayer,
  getAdminState,
  listAdminPlayers,
  updatePlayer,
  type AdminPlayer,
} from "@/lib/admin.functions";
import { tierEdits, type TierMap } from "@/lib/admin-tiers";
import { GAMEMODES } from "@/lib/tiers";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — PCTIERS" },
      { name: "description", content: "Add players, set their tiers and manage the PCTIERS rankings." },
      { property: "og:title", content: "Admin Panel — PCTIERS" },
      { property: "og:description", content: "Manage PCTIERS players and tiers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const REGIONS = ["NA", "EU", "AS", "OCE", "SA", "ME", "AF"] as const;
type Region = (typeof REGIONS)[number];

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : "Something went wrong";
}

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchState = useServerFn(getAdminState);
  const state = useQuery({ queryKey: ["admin", "state"], queryFn: () => fetchState() });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <StormBackdrop />
      <div className="mx-auto max-w-7xl space-y-8 px-4 pt-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-pixel text-[11px] uppercase tracking-wider text-primary">Staff only</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Admin Panel</h1>
            {state.data?.email && <p className="mt-1 text-sm text-muted-foreground">Signed in as {state.data.email}</p>}
          </div>
          <Button variant="glass" onClick={signOut}>
            <LogOut /> Sign out
          </Button>
        </div>

        {state.isPending ? (
          <div className="surface bg-card/80 p-10 text-center text-muted-foreground backdrop-blur">Checking access…</div>
        ) : state.isError ? (
          <div className="surface bg-card/80 p-10 text-center text-destructive backdrop-blur">
            Couldn't check your access. Refresh to try again.
          </div>
        ) : !state.data.isAdmin ? (
          <div className="surface mx-auto max-w-lg bg-card/80 p-8 text-center backdrop-blur">
            <ShieldAlert className="mx-auto size-10 text-destructive" />
            <h2 className="mt-4 text-xl font-semibold">Not on the admin list</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {state.data.email ?? "This account"} can't manage the tier list. Sign out and use an approved Gmail account.
            </p>
          </div>
        ) : (
          <AdminTools />
        )}
      </div>
    </div>
  );
}

function useRefreshAll() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries();
}

function AdminTools() {
  const list = useServerFn(listAdminPlayers);
  const players = useQuery({ queryKey: ["admin", "players"], queryFn: () => list() });
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<AdminPlayer | null>(null);
  const [deleting, setDeleting] = useState<AdminPlayer | null>(null);

  const filtered = useMemo(
    () => (players.data ?? []).filter((p) => p.username.toLowerCase().includes(q.trim().toLowerCase())),
    [players.data, q],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <AddPlayerCard />

      <section className="surface bg-card/80 p-5 backdrop-blur">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Players ({players.data?.length ?? 0})</h2>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search players" className="pl-9" aria-label="Search players" />
          </div>
        </div>
        {players.isPending ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading players…</p>
        ) : players.isError ? (
          <p className="py-10 text-center text-sm text-destructive">{errMsg(players.error)}</p>
        ) : filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            {q.trim() ? `No players match "${q}".` : "No players yet. Add your first one."}
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {filtered.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3">
                <PlayerAvatar username={p.username} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">
                    {p.username} <span className="text-xs font-normal text-muted-foreground">{p.region}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {GAMEMODES.filter((g) => p.tiers[g.slug]).map((g) => (
                      <span key={g.slug} className="flex items-center gap-1 rounded-md bg-muted/70 py-0.5 pl-1 pr-0.5" title={g.name}>
                        <GamemodeIcon slug={g.slug} className="size-3 text-muted-foreground" />
                        <TierBadge tier={p.tiers[g.slug]!} className="px-1 py-0.5 text-[9px]" />
                      </span>
                    ))}
                    {Object.keys(p.tiers).length === 0 && <span className="text-xs text-muted-foreground">No tiers yet</span>}
                  </div>
                </div>
                <Button variant="glass" size="sm" onClick={() => setEditing(p)} aria-label={`Edit ${p.username}`}>
                  <Pencil /> Edit
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleting(p)} aria-label={`Delete ${p.username}`}>
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editing && <EditPlayerDialog player={editing} onClose={() => setEditing(null)} />}
      {deleting && <DeletePlayerDialog player={deleting} onClose={() => setDeleting(null)} />}
    </div>
  );
}

function RegionSelect({ value, onChange }: { value: Region; onChange: (r: Region) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Region)}>
      <SelectTrigger className="bg-card" aria-label="Region">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {REGIONS.map((r) => (
          <SelectItem key={r} value={r}>
            {r}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function TesterNotes({ tester, notes, setTester, setNotes }: { tester: string; notes: string; setTester: (v: string) => void; setNotes: (v: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="tester">Tester (optional)</Label>
        <Input id="tester" value={tester} onChange={(e) => setTester(e.target.value)} maxLength={32} placeholder="Who tested them" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} placeholder="e.g. Won 3–1" />
      </div>
    </div>
  );
}

function AddPlayerCard() {
  const create = useServerFn(createPlayer);
  const refresh = useRefreshAll();
  const [username, setUsername] = useState("");
  const [region, setRegion] = useState<Region>("NA");
  const [tiers, setTiers] = useState<TierMap>({});
  const [tester, setTester] = useState("");
  const [notes, setNotes] = useState("");

  const m = useMutation({
    mutationFn: () => create({ data: { username: username.trim(), region, tiers: tierEdits({}, tiers), tester, notes } }),
    onSuccess: () => {
      toast.success(`${username.trim()} added to the tier list`);
      setUsername("");
      setTiers({});
      setNotes("");
      refresh();
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  return (
    <section className="surface bg-card/80 p-5 backdrop-blur">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <ShieldCheck className="size-5 text-primary" /> Add player
      </h2>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          m.mutate();
        }}
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
          <div className="space-y-1.5">
            <Label htmlFor="username">Minecraft username</Label>
            <div className="flex items-center gap-2">
              {username.trim().length >= 3 && <PlayerAvatar username={username.trim()} size={36} />}
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={16}
                pattern="[A-Za-z0-9_]{3,16}"
                placeholder="Notch"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Region</Label>
            <RegionSelect value={region} onChange={setRegion} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Tiers</Label>
          <TierPicker value={tiers} onChange={setTiers} />
        </div>
        <TesterNotes tester={tester} notes={notes} setTester={setTester} setNotes={setNotes} />
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={m.isPending}>
          <Plus /> {m.isPending ? "Adding…" : "Add player"}
        </Button>
      </form>
    </section>
  );
}

function EditPlayerDialog({ player, onClose }: { player: AdminPlayer; onClose: () => void }) {
  const update = useServerFn(updatePlayer);
  const refresh = useRefreshAll();
  const [region, setRegion] = useState<Region>((REGIONS as readonly string[]).includes(player.region) ? (player.region as Region) : "NA");
  const [tiers, setTiers] = useState<TierMap>(player.tiers);
  const [tester, setTester] = useState("");
  const [notes, setNotes] = useState("");

  const m = useMutation({
    mutationFn: () => update({ data: { playerId: player.id, region, tiers: tierEdits(player.tiers, tiers), tester, notes } }),
    onSuccess: () => {
      toast.success(`${player.username} updated`);
      refresh();
      onClose();
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <PlayerAvatar username={player.username} size={32} /> {player.username}
          </DialogTitle>
          <DialogDescription>Change tiers, or pick "No tier" to take a tier away.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="max-w-[8rem] space-y-1.5">
            <Label>Region</Label>
            <RegionSelect value={region} onChange={setRegion} />
          </div>
          <TierPicker value={tiers} onChange={setTiers} />
          <TesterNotes tester={tester} notes={notes} setTester={setTester} setNotes={setNotes} />
        </div>
        <DialogFooter>
          <Button variant="glass" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="hero" onClick={() => m.mutate()} disabled={m.isPending}>
            {m.isPending ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeletePlayerDialog({ player, onClose }: { player: AdminPlayer; onClose: () => void }) {
  const del = useServerFn(deletePlayer);
  const refresh = useRefreshAll();
  const m = useMutation({
    mutationFn: () => del({ data: { playerId: player.id } }),
    onSuccess: () => {
      toast.success(`${player.username} deleted`);
      refresh();
      onClose();
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  return (
    <AlertDialog open onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {player.username}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes them from every leaderboard and deletes all their tiers and tier history. It can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(e) => {
              e.preventDefault();
              m.mutate();
            }}
            disabled={m.isPending}
          >
            {m.isPending ? "Deleting…" : "Delete player"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
