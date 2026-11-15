CREATE TABLE public.admin_emails (
  email text PRIMARY KEY CHECK (email = lower(email)),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_emails TO service_role;
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_emails
    WHERE email = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
$$;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

GRANT INSERT, UPDATE, DELETE ON public.players, public.rankings, public.tier_changes, public.testers TO authenticated;

CREATE POLICY "Admins add players" ON public.players FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins edit players" ON public.players FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete players" ON public.players FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Admins add rankings" ON public.rankings FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins edit rankings" ON public.rankings FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete rankings" ON public.rankings FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Admins add tier changes" ON public.tier_changes FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete tier changes" ON public.tier_changes FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Admins add testers" ON public.testers FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.admin_set_tier(
  _player_id uuid,
  _gamemode public.gamemode,
  _tier public.tier_code,
  _tester text DEFAULT NULL,
  _notes text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  prev public.tier_code;
  tid uuid;
  tname text := nullif(btrim(coalesce(_tester, '')), '');
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can change tiers';
  END IF;

  SELECT tier INTO prev FROM public.rankings WHERE player_id = _player_id AND gamemode = _gamemode;

  IF _tier = 'Unranked' THEN
    IF prev IS NULL THEN RETURN; END IF;
  ELSIF prev IS NOT DISTINCT FROM _tier THEN
    RETURN;
  END IF;

  IF tname IS NOT NULL THEN
    INSERT INTO public.testers (username) VALUES (tname) ON CONFLICT (username) DO NOTHING;
    SELECT id INTO tid FROM public.testers WHERE username = tname;
  END IF;

  IF _tier = 'Unranked' THEN
    DELETE FROM public.rankings WHERE player_id = _player_id AND gamemode = _gamemode;
  ELSE
    INSERT INTO public.rankings (player_id, gamemode, tier, previous_tier, tester_id, last_tested)
    VALUES (_player_id, _gamemode, _tier, prev, tid, CURRENT_DATE)
    ON CONFLICT (player_id, gamemode) DO UPDATE
      SET tier = EXCLUDED.tier,
          previous_tier = EXCLUDED.previous_tier,
          tester_id = EXCLUDED.tester_id,
          last_tested = CURRENT_DATE;
  END IF;

  INSERT INTO public.tier_changes (player_id, gamemode, from_tier, to_tier, tester_id, notes)
  VALUES (_player_id, _gamemode, prev, _tier, tid, nullif(btrim(coalesce(_notes, '')), ''));
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_set_tier(uuid, public.gamemode, public.tier_code, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_tier(uuid, public.gamemode, public.tier_code, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_delete_player(_player_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can delete players';
  END IF;
  DELETE FROM public.tier_changes WHERE player_id = _player_id;
  DELETE FROM public.rankings WHERE player_id = _player_id;
  DELETE FROM public.players WHERE id = _player_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_delete_player(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_player(uuid) TO authenticated;