CREATE TYPE public.tier_code AS ENUM ('HT1','LT1','HT2','LT2','HT3','LT3','HT4','LT4','HT5','LT5','Unranked');
CREATE TYPE public.gamemode AS ENUM ('sword','axe','crystal','smp','uhc','pot','nethpot','mace','diamond','netherite','bow','crossbow');

CREATE TABLE public.testers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testers TO anon, authenticated;
GRANT ALL ON public.testers TO service_role;
ALTER TABLE public.testers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Testers are public" ON public.testers FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  region text NOT NULL DEFAULT 'NA',
  joined_at date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.players TO anon, authenticated;
GRANT ALL ON public.players TO service_role;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players are public" ON public.players FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  gamemode public.gamemode NOT NULL,
  tier public.tier_code NOT NULL DEFAULT 'Unranked',
  previous_tier public.tier_code,
  tester_id uuid REFERENCES public.testers(id) ON DELETE SET NULL,
  last_tested date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (player_id, gamemode)
);
CREATE INDEX rankings_gamemode_idx ON public.rankings (gamemode);
GRANT SELECT ON public.rankings TO anon, authenticated;
GRANT ALL ON public.rankings TO service_role;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rankings are public" ON public.rankings FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.tier_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  gamemode public.gamemode NOT NULL,
  from_tier public.tier_code,
  to_tier public.tier_code NOT NULL,
  tester_id uuid REFERENCES public.testers(id) ON DELETE SET NULL,
  notes text,
  changed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tier_changes_changed_at_idx ON public.tier_changes (changed_at DESC);
CREATE INDEX tier_changes_player_idx ON public.tier_changes (player_id);
GRANT SELECT ON public.tier_changes TO anon, authenticated;
GRANT ALL ON public.tier_changes TO service_role;
ALTER TABLE public.tier_changes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tier changes are public" ON public.tier_changes FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.testers (username) VALUES ('Kraxen'),('Velorae'),('SpikeMC'),('Obsidyn'),('Lunarix'),('TidePvP');
INSERT INTO public.players (username, region, joined_at) VALUES ('Vortexed','OC','2024-06-07'),('KyroPvP','EU','2026-07-07'),('Ashbloom','NA','2025-04-08'),('Netherwisp','SA','2024-06-24'),('Frostbyte_','NA','2025-07-20'),('Zephyrix','NA','2026-02-18'),('Blazeheart','OC','2024-11-04'),('Crimsonfang','SA','2026-03-07'),('Quartzling','NA','2025-10-19'),('Echoform','AS','2024-05-31'),('Riftwalker','AS','2024-07-20'),('Solstyce','NA','2024-06-05'),('Hexbound','AS','2024-12-23'),('Pyrelight','NA','2024-08-05'),('Driftmoon','EU','2025-10-18'),('Shardlock','OC','2025-11-10'),('Voidmere','NA','2025-11-26'),('Emberly','OC','2025-12-13'),('Cobaltz','NA','2024-09-05'),('Strafed','NA','2024-09-20'),('Nightquill','OC','2024-09-10'),('Glacyn','NA','2025-08-13'),('Torvik','AS','2026-04-15'),('Silkhaze','OC','2026-02-19'),('Mirevex','OC','2026-03-12'),('Ironvale','SA','2025-07-25'),('Starfall_','EU','2026-07-07'),('Duskborne','AS','2024-05-20'),('Phantomic','AS','2025-12-26'),('Wrenly','OC','2025-03-06'),('Basaltix','OC','2025-06-02'),('Coralyn','NA','2025-05-13'),('Thornez','NA','2026-06-11'),('Aetherial','SA','2024-05-23'),('Grimlow','SA','2025-02-20'),('Lumenix','OC','2025-05-11');
INSERT INTO public.rankings (player_id, gamemode, tier, previous_tier, tester_id, last_tested)
SELECT p.id, v.mode::public.gamemode, v.tier::public.tier_code, v.prev::public.tier_code, t.id, DATE '2026-11-13' - v.ago
FROM (VALUES ('Vortexed','diamond','HT4','LT4',6,214),('Vortexed','smp','LT1','HT2',6,47),('Vortexed','pot','LT3','LT4',1,0),('Vortexed','uhc','LT3','LT4',2,27),('Vortexed','crystal','LT3','HT4',4,111),('Vortexed','netherite','HT4','LT4',2,17),('KyroPvP','uhc','HT3',NULL,5,47),('KyroPvP','pot','LT2','HT3',2,21),('KyroPvP','axe','LT3','HT3',1,56),('KyroPvP','crossbow','HT1','LT1',3,56),('KyroPvP','smp','HT2','LT2',2,25),('KyroPvP','nethpot','LT2','HT3',1,4),('KyroPvP','crystal','LT2','HT3',5,62),('KyroPvP','bow','LT2',NULL,4,4),('Ashbloom','nethpot','LT2',NULL,6,13),('Ashbloom','netherite','HT2','LT2',5,43),('Ashbloom','axe','HT1',NULL,5,30),('Ashbloom','diamond','LT1','HT2',5,36),('Ashbloom','crossbow','HT1','LT1',3,107),('Ashbloom','bow','HT2','LT1',6,91),('Ashbloom','smp','HT1',NULL,2,8),('Netherwisp','mace','HT1',NULL,6,14),('Netherwisp','netherite','LT1','LT2',6,8),('Netherwisp','uhc','LT1','HT2',5,11),('Netherwisp','diamond','HT1','HT2',2,106),('Frostbyte_','uhc','LT2','LT3',6,55),('Frostbyte_','bow','HT1','HT2',5,5),('Frostbyte_','crossbow','LT1','LT2',5,34),('Frostbyte_','pot','HT1','LT1',2,6),('Frostbyte_','nethpot','LT1',NULL,3,6),('Frostbyte_','mace','LT2',NULL,3,13),('Frostbyte_','diamond','HT1','LT1',3,7),('Frostbyte_','crystal','LT3','HT3',4,5),('Zephyrix','smp','LT2','HT3',5,2),('Zephyrix','sword','HT3','LT3',1,74),('Zephyrix','uhc','LT2','HT3',1,0),('Zephyrix','pot','HT2','HT3',5,17),('Zephyrix','diamond','HT1','LT1',6,56),('Zephyrix','nethpot','HT2','LT2',4,48),('Zephyrix','mace','LT1','HT2',4,47),('Zephyrix','crossbow','HT3','LT3',1,12),('Zephyrix','axe','LT1','LT2',1,90),('Blazeheart','uhc','LT3','LT4',3,2),('Blazeheart','crystal','HT3','LT2',1,9),('Blazeheart','mace','LT1','HT1',6,7),('Blazeheart','pot','HT3','LT2',4,19),('Blazeheart','smp','HT3',NULL,3,76),('Blazeheart','diamond','HT2','LT1',6,53),('Blazeheart','sword','HT4','LT4',4,41),('Blazeheart','crossbow','HT4','HT5',4,9),('Blazeheart','axe','HT3',NULL,2,5),('Crimsonfang','nethpot','HT1',NULL,2,80),('Crimsonfang','bow','LT1','HT2',6,29),('Crimsonfang','crystal','HT2','LT1',4,27),('Crimsonfang','smp','HT1',NULL,1,82),('Crimsonfang','mace','HT1','LT1',2,31),('Quartzling','diamond','HT5','LT5',3,20),('Quartzling','bow','LT5',NULL,1,12),('Quartzling','axe','HT4','LT3',6,55),('Quartzling','crossbow','LT5',NULL,5,19),('Quartzling','uhc','HT3','HT4',4,29),('Echoform','pot','LT2','HT3',3,4),('Echoform','diamond','HT2','HT3',6,61),('Echoform','sword','LT3','HT3',5,38),('Echoform','netherite','LT2','HT3',4,8),('Riftwalker','crystal','LT2','HT3',5,73),('Riftwalker','pot','LT4','HT4',3,12),('Riftwalker','sword','LT3','HT4',1,102),('Riftwalker','crossbow','HT3',NULL,1,34),('Riftwalker','bow','HT3','LT3',1,17),('Riftwalker','smp','LT2','LT3',4,78),('Riftwalker','netherite','LT2',NULL,2,56),('Riftwalker','mace','LT3','LT4',4,21),('Solstyce','axe','LT4','HT5',4,36),('Solstyce','crystal','LT3','HT3',2,18),('Solstyce','netherite','HT4','LT4',5,108),('Solstyce','sword','HT5','LT4',6,53),('Solstyce','nethpot','LT5',NULL,3,10),('Solstyce','mace','HT4',NULL,3,15),('Solstyce','pot','LT3','LT4',1,41),('Hexbound','crossbow','LT1','HT2',2,28),('Hexbound','axe','HT3','LT3',3,4),('Hexbound','mace','HT2','LT2',6,52),('Hexbound','diamond','LT3','HT4',3,54),('Pyrelight','netherite','HT3','LT3',4,5),('Pyrelight','mace','HT5','LT5',6,31),('Pyrelight','bow','LT5',NULL,6,64),('Pyrelight','smp','LT3','HT4',4,10),('Pyrelight','crystal','HT4','LT3',1,68),('Pyrelight','pot','HT4','LT4',3,28),('Pyrelight','axe','LT3','HT4',3,87),('Pyrelight','crossbow','LT3','HT4',6,48),('Pyrelight','uhc','HT4',NULL,3,6),('Driftmoon','pot','LT4','HT5',1,39),('Driftmoon','nethpot','LT5',NULL,4,96),('Driftmoon','diamond','LT4','LT5',5,69),('Driftmoon','sword','LT5','HT5',2,128),('Shardlock','mace','LT1','HT2',5,58),('Shardlock','pot','HT3','LT3',5,18),('Shardlock','uhc','HT2','LT1',5,3),('Shardlock','crystal','LT3','HT4',2,116),('Shardlock','smp','LT3','LT4',1,16),('Shardlock','bow','LT3','HT3',2,19),('Shardlock','sword','HT2','LT2',6,3),('Voidmere','axe','HT3','LT2',1,48),('Voidmere','smp','LT3','HT4',3,36),('Voidmere','netherite','LT3','HT3',4,19),('Voidmere','nethpot','LT4','HT4',3,10),('Voidmere','uhc','LT4',NULL,5,14),('Voidmere','crystal','LT3','HT4',4,23),('Emberly','diamond','LT2','LT3',3,1),('Emberly','netherite','HT2','LT2',3,0),('Emberly','mace','LT2','LT3',5,7),('Emberly','crystal','LT3','HT4',4,1),('Emberly','pot','HT4','HT5',5,77),('Emberly','axe','HT3','HT4',6,65),('Cobaltz','netherite','LT5','HT5',4,196),('Cobaltz','diamond','LT5',NULL,1,27),('Cobaltz','uhc','LT5',NULL,4,57),('Cobaltz','smp','HT5','LT5',3,9),('Cobaltz','crossbow','LT3','HT4',5,8),('Strafed','diamond','LT3','HT3',3,151),('Strafed','crystal','LT3',NULL,5,29),('Strafed','nethpot','HT3','HT4',1,48),('Strafed','crossbow','HT3',NULL,6,15),('Strafed','bow','HT3','LT3',1,17),('Strafed','axe','HT2','LT2',5,59),('Nightquill','uhc','LT1','LT2',2,0),('Nightquill','smp','LT1','HT2',6,35),('Nightquill','nethpot','LT3',NULL,6,39),('Nightquill','bow','LT3','LT4',5,244),('Nightquill','diamond','LT3','HT4',5,38),('Nightquill','pot','LT3','HT4',4,6),('Nightquill','crystal','LT1','LT2',4,21),('Glacyn','netherite','LT2','HT2',6,48),('Glacyn','uhc','LT3','HT4',1,93),('Glacyn','crystal','LT3',NULL,1,1),('Glacyn','crossbow','LT4',NULL,4,192),('Glacyn','bow','HT5','LT5',6,22),('Glacyn','sword','HT3','LT3',1,71),('Glacyn','smp','HT4',NULL,1,33),('Glacyn','axe','LT3',NULL,3,47),('Glacyn','nethpot','HT4','LT4',2,13),('Torvik','nethpot','LT4','HT5',4,39),('Torvik','uhc','LT3',NULL,1,21),('Torvik','crossbow','LT4','LT5',1,45),('Torvik','netherite','HT5','LT5',3,16),('Torvik','smp','HT5','LT5',6,59),('Silkhaze','sword','LT1','HT2',6,20),('Silkhaze','crystal','HT1',NULL,5,30),('Silkhaze','uhc','HT1',NULL,6,45),('Silkhaze','nethpot','LT2','HT3',3,18),('Mirevex','bow','HT3','LT2',1,71),('Mirevex','crystal','HT4','LT4',1,19),('Mirevex','mace','LT3','LT4',4,26),('Mirevex','diamond','LT3','LT4',1,10),('Mirevex','uhc','HT3','LT3',5,98),('Mirevex','netherite','LT1','HT2',5,13),('Mirevex','sword','HT4','LT4',1,41),('Ironvale','smp','LT3','HT3',2,4),('Ironvale','bow','LT2','HT3',3,44),('Ironvale','pot','HT2','HT3',4,5),('Ironvale','uhc','HT3','HT4',6,21),('Ironvale','sword','HT4','LT4',6,17),('Ironvale','netherite','HT4',NULL,3,92),('Ironvale','crystal','HT2','LT1',4,61),('Ironvale','diamond','HT3','HT4',6,137),('Ironvale','axe','LT1','HT2',5,34),('Starfall_','pot','HT2','LT1',4,45),('Starfall_','diamond','LT4',NULL,5,84),('Starfall_','axe','LT2','LT3',3,59),('Starfall_','netherite','HT4','LT4',1,86),('Starfall_','nethpot','HT4','LT4',4,47),('Starfall_','bow','LT3','HT3',1,26),('Duskborne','bow','HT2',NULL,2,17),('Duskborne','nethpot','HT2','HT3',6,103),('Duskborne','smp','LT2','HT3',5,57),('Duskborne','sword','HT3','LT3',5,61),('Duskborne','crystal','LT3','HT4',4,8),('Duskborne','diamond','HT2','LT2',4,12),('Duskborne','uhc','HT2','HT3',1,28),('Duskborne','mace','HT4','LT4',3,31),('Duskborne','pot','LT2',NULL,4,41),('Phantomic','uhc','LT3','HT4',6,28),('Phantomic','crystal','HT4','HT5',6,22),('Phantomic','axe','HT3','LT2',2,12),('Phantomic','nethpot','HT4','LT4',2,79),('Phantomic','mace','LT2','LT3',6,117),('Phantomic','pot','HT5',NULL,5,124),('Wrenly','mace','HT3','HT4',2,40),('Wrenly','pot','HT3','LT3',6,6),('Wrenly','bow','LT4','HT5',6,17),('Wrenly','netherite','LT2',NULL,2,63),('Wrenly','axe','HT2','LT1',2,83),('Basaltix','diamond','HT3','LT2',1,94),('Basaltix','bow','LT4','HT4',5,56),('Basaltix','sword','LT4',NULL,1,30),('Basaltix','mace','LT3','HT4',3,70),('Basaltix','netherite','HT3',NULL,3,43),('Basaltix','crystal','LT3','HT4',6,4),('Basaltix','uhc','HT4',NULL,1,116),('Basaltix','smp','HT5',NULL,1,4),('Basaltix','axe','LT3',NULL,1,17),('Coralyn','diamond','HT2','LT2',1,88),('Coralyn','smp','HT3','LT2',2,18),('Coralyn','crystal','HT4','LT4',1,43),('Coralyn','nethpot','LT1','LT2',2,35),('Thornez','diamond','LT3','LT4',6,17),('Thornez','smp','LT3',NULL,5,168),('Thornez','netherite','LT1','HT2',6,5),('Thornez','nethpot','HT4',NULL,6,13),('Thornez','mace','LT2','HT3',2,103),('Thornez','pot','HT2','LT2',5,33),('Thornez','crossbow','HT4','LT4',6,47),('Aetherial','pot','HT5',NULL,3,0),('Aetherial','nethpot','LT3','HT4',1,93),('Aetherial','mace','LT3','HT4',6,15),('Aetherial','bow','LT4','LT5',3,50),('Aetherial','crossbow','LT3','HT3',2,42),('Aetherial','sword','HT3','LT3',3,132),('Aetherial','uhc','LT3','HT3',1,41),('Grimlow','sword','HT5','LT5',5,74),('Grimlow','crossbow','LT4','LT5',3,89),('Grimlow','diamond','LT4','HT5',1,74),('Grimlow','mace','HT4','LT3',2,31),('Grimlow','netherite','HT4','LT4',3,175),('Grimlow','crystal','LT5',NULL,1,146),('Lumenix','uhc','LT1','HT2',1,33),('Lumenix','nethpot','LT1',NULL,2,13),('Lumenix','pot','HT4','LT3',5,3),('Lumenix','axe','LT1','HT2',4,76),('Lumenix','netherite','HT3','HT4',3,15)) AS v(username, mode, tier, prev, tn, ago)
JOIN public.players p ON p.username = v.username
JOIN (SELECT id, row_number() OVER (ORDER BY username) AS n FROM public.testers) t ON t.n = v.tn;

-- Placement tests that led to each player's previous tier
INSERT INTO public.tier_changes (player_id, gamemode, from_tier, to_tier, tester_id, notes, changed_at)
SELECT r.player_id, r.gamemode, NULL, r.previous_tier, r.tester_id, 'Initial placement test',
  (r.last_tested - (30 + abs(hashtext(r.id::text)) % 90))::timestamp + make_interval(hours => 10 + abs(hashtext(r.gamemode::text || r.player_id::text)) % 12)
FROM public.rankings r WHERE r.previous_tier IS NOT NULL;

-- The most recent test that set each current tier
INSERT INTO public.tier_changes (player_id, gamemode, from_tier, to_tier, tester_id, notes, changed_at)
SELECT r.player_id, r.gamemode, r.previous_tier, r.tier, r.tester_id,
  CASE WHEN r.previous_tier IS NULL THEN 'Initial placement test' ELSE 'Retest' END,
  r.last_tested::timestamp + make_interval(hours => 9 + abs(hashtext(r.id::text)) % 13, mins => abs(hashtext(r.player_id::text)) % 60)
FROM public.rankings r;