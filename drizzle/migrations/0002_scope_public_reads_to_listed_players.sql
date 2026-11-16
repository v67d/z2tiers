-- Players: public sees only players currently on the tier list; admins see everyone.
DROP POLICY IF EXISTS "Players are public" ON public.players;
CREATE POLICY "Listed players are public" ON public.players
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.rankings r WHERE r.player_id = players.id));
CREATE POLICY "Admins view all players" ON public.players
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Testers: public sees only testers credited on a ranking or tier change; admins see everyone.
DROP POLICY IF EXISTS "Testers are public" ON public.testers;
CREATE POLICY "Credited testers are public" ON public.testers
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM public.rankings r WHERE r.tester_id = testers.id)
    OR EXISTS (SELECT 1 FROM public.tier_changes c WHERE c.tester_id = testers.id)
  );
CREATE POLICY "Admins view all testers" ON public.testers
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Tier history: public sees history only for players currently on the tier list; admins see everything.
DROP POLICY IF EXISTS "Tier changes are public" ON public.tier_changes;
CREATE POLICY "Listed players tier changes are public" ON public.tier_changes
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.rankings r WHERE r.player_id = tier_changes.player_id));
CREATE POLICY "Admins view all tier changes" ON public.tier_changes
  FOR SELECT TO authenticated
  USING (public.is_admin());