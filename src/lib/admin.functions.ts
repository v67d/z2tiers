import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { GAMEMODES, TIERS, type GamemodeSlug, type TierCode } from "./tiers";

const modeSlugs = GAMEMODES.map((g) => g.slug) as [GamemodeSlug, ...GamemodeSlug[]];
const tierCodes = [...TIERS] as [TierCode, ...TierCode[]];

const tiersSchema = z.record(z.enum(modeSlugs), z.enum(tierCodes));
const usernameSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_]{3,16}$/, "Minecraft usernames are 3–16 letters, numbers or underscores");
const regionSchema = z.enum(["NA", "EU", "AS", "OCE", "SA", "ME", "AF"]);
const extraSchema = {
  tester: z.string().trim().max(32).optional(),
  notes: z.string().trim().max(300).optional(),
};

export type AdminPlayer = {
  id: string;
  username: string;
  region: string;
  tiers: Partial<Record<GamemodeSlug, TierCode>>;
};

export const getAdminState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("is_admin");
    if (error) throw new Error("Could not check admin access");
    const email = typeof context.claims.email === "string" ? context.claims.email : null;
    return { isAdmin: data === true, email };
  });

type Db = SupabaseClient<Database>;

async function assertAdmin(supabase: Db) {
  const { data } = await supabase.rpc("is_admin");
  if (data !== true) throw new Error("This account is not on the admin list");
}

export const listAdminPlayers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminPlayer[]> => {
    await assertAdmin(context.supabase);
    const { data, error } = await context.supabase
      .from("players")
      .select("id, username, region, rankings(gamemode, tier)")
      .order("username");
    if (error) throw new Error(`Could not load players: ${error.message}`);
    return (data ?? []).map((p) => ({
      id: p.id,
      username: p.username,
      region: p.region,
      tiers: Object.fromEntries(p.rankings.map((r) => [r.gamemode, r.tier])),
    }));
  });

async function applyTiers(
  supabase: Db,
  playerId: string,
  tiers: Partial<Record<GamemodeSlug, TierCode>>,
  tester?: string,
  notes?: string,
) {
  for (const [mode, tier] of Object.entries(tiers) as [GamemodeSlug, TierCode][]) {
    const { error } = await supabase.rpc("admin_set_tier", {
      _player_id: playerId,
      _gamemode: mode,
      _tier: tier,
      ...(tester ? { _tester: tester } : {}),
      ...(notes ? { _notes: notes } : {}),
    });
    if (error) throw new Error(`Could not save ${mode} tier: ${error.message}`);
  }
}

export const createPlayer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ username: usernameSchema, region: regionSchema, tiers: tiersSchema, ...extraSchema }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase);
    const { data: player, error } = await context.supabase
      .from("players")
      .insert({ username: data.username, region: data.region })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") throw new Error(`${data.username} is already on the tier list`);
      throw new Error(`Could not add player: ${error.message}`);
    }
    await applyTiers(context.supabase, player.id, data.tiers, data.tester, data.notes);
    return { id: player.id };
  });

export const updatePlayer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({ playerId: z.string().uuid(), region: regionSchema, tiers: tiersSchema, ...extraSchema })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase);
    const { error } = await context.supabase.from("players").update({ region: data.region }).eq("id", data.playerId);
    if (error) throw new Error(`Could not update player: ${error.message}`);
    await applyTiers(context.supabase, data.playerId, data.tiers, data.tester, data.notes);
    return { ok: true };
  });

export const deletePlayer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ playerId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase);
    const { error } = await context.supabase.rpc("admin_delete_player", { _player_id: data.playerId });
    if (error) throw new Error(`Could not delete player: ${error.message}`);
    return { ok: true };
  });
