-- ============================================================================
-- CAMPO — Row Level Security (RLS) base
-- Aplica políticas para que cada entrenador solo vea sus datos y cada jugador
-- solo los suyos. Revisa nombres de columnas con tu esquema real antes de
-- aplicar en producción:  supabase db push  (o pega en el SQL editor).
-- ============================================================================

-- Helper: ids de jugador asociados al usuario autenticado.
create or replace function public.my_player_ids()
returns setof uuid
language sql stable security definer set search_path = public as $$
  select id from public.players where auth_user_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- user_roles: cada usuario gestiona su(s) propio(s) rol(es)
-- ---------------------------------------------------------------------------
alter table public.user_roles enable row level security;
drop policy if exists user_roles_self on public.user_roles;
create policy user_roles_self on public.user_roles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- players: el entrenador es dueño (coach_id); el jugador puede leer su ficha
-- ---------------------------------------------------------------------------
alter table public.players enable row level security;
drop policy if exists players_coach_all on public.players;
create policy players_coach_all on public.players
  for all using (coach_id = auth.uid()) with check (coach_id = auth.uid());
drop policy if exists players_self_read on public.players;
create policy players_self_read on public.players
  for select using (auth_user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Tablas propiedad del entrenador (coach_id) con lectura del jugador implicado
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['matches','tasks','training_sessions'] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists %I_coach_all on public.%I;', t, t);
    execute format(
      'create policy %I_coach_all on public.%I for all using (coach_id = auth.uid()) with check (coach_id = auth.uid());',
      t, t);
    execute format('drop policy if exists %I_player_read on public.%I;', t, t);
    execute format(
      'create policy %I_player_read on public.%I for select using (player_id in (select public.my_player_ids()));',
      t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- check_ins: el jugador gestiona los suyos; el entrenador los lee
-- ---------------------------------------------------------------------------
alter table public.check_ins enable row level security;
drop policy if exists checkins_player_all on public.check_ins;
create policy checkins_player_all on public.check_ins
  for all using (player_id in (select public.my_player_ids()))
  with check (player_id in (select public.my_player_ids()));
drop policy if exists checkins_coach_read on public.check_ins;
create policy checkins_coach_read on public.check_ins
  for select using (player_id in (select id from public.players where coach_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- messages: entrenador y jugador implicado pueden leer/escribir su conversación
-- ---------------------------------------------------------------------------
alter table public.messages enable row level security;
drop policy if exists messages_coach_all on public.messages;
create policy messages_coach_all on public.messages
  for all using (coach_id = auth.uid()) with check (coach_id = auth.uid());
drop policy if exists messages_player_rw on public.messages;
create policy messages_player_rw on public.messages
  for all using (player_id in (select public.my_player_ids()))
  with check (player_id in (select public.my_player_ids()));

-- NOTA: añade políticas equivalentes para videos / video_analysis / assessments
-- según sus columnas (coach_id / player_id) siguiendo el mismo patrón.
