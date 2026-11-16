ALTER TYPE public.gamemode ADD VALUE IF NOT EXISTS 'spearmace';
ALTER TYPE public.gamemode ADD VALUE IF NOT EXISTS 'elytra';
COMMENT ON TYPE public.gamemode IS 'bow and crossbow are DEPRECATED: removed from the site, kept only because enum values cannot be dropped';

ALTER TABLE public.testers ADD COLUMN IF NOT EXISTS discord_name text;
ALTER TABLE public.testers ADD CONSTRAINT testers_discord_name_len CHECK (discord_name IS NULL OR char_length(discord_name) BETWEEN 1 AND 40);

-- Admins can edit testers (Discord name, username) and remove them.
CREATE POLICY "Admins edit testers" ON public.testers
  FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete testers" ON public.testers
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Testers an admin has linked to Discord are listed publicly too.
DROP POLICY IF EXISTS "Credited testers are public" ON public.testers;
CREATE POLICY "Listed testers are public" ON public.testers
  FOR SELECT TO anon, authenticated
  USING (
    discord_name IS NOT NULL
    OR EXISTS (SELECT 1 FROM public.rankings r WHERE r.tester_id = testers.id)
    OR EXISTS (SELECT 1 FROM public.tier_changes c WHERE c.tester_id = testers.id)
  );