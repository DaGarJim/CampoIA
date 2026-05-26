-- 0003_spec_parity.sql
-- Cierra los gaps de esquema frente a la spec v10.0 (campos sueltos + tabla
-- assessments). Aditiva e idempotente. Aplicar tras 0001 y 0002.

-- ---------------------------------------------------------------------------
-- players: RPE promedio + email del jugador. Físicos a NUMERIC(5,1) (spec) para
-- conservar decimales (saltos/CMJ con paso 0.1, RM con paso 0.5).
-- ---------------------------------------------------------------------------
alter table public.players add column if not exists rpe numeric;
alter table public.players add column if not exists player_email text;

alter table public.players alter column height_cm type numeric(5, 1) using height_cm::numeric;
alter table public.players alter column weight_kg type numeric(5, 1) using weight_kg::numeric;
alter table public.players alter column vertical_jump type numeric(5, 1) using vertical_jump::numeric;
alter table public.players alter column horizontal_jump type numeric(5, 1) using horizontal_jump::numeric;
alter table public.players alter column flexibility_cmj type numeric(5, 1) using flexibility_cmj::numeric;
alter table public.players alter column rm_squat type numeric(5, 1) using rm_squat::numeric;
alter table public.players alter column rm_deadlift type numeric(5, 1) using rm_deadlift::numeric;
alter table public.players alter column rm_bench type numeric(5, 1) using rm_bench::numeric;

-- ---------------------------------------------------------------------------
-- matches: nivel de fatiga del partido (1-10).
-- ---------------------------------------------------------------------------
alter table public.matches add column if not exists fatigue integer;
alter table public.matches drop constraint if exists matches_fatigue_range;
alter table public.matches add constraint matches_fatigue_range check (fatigue is null or fatigue between 1 and 10);

-- ---------------------------------------------------------------------------
-- videos: asociar a jugador/partido + notas (spec 3.9).
-- ---------------------------------------------------------------------------
alter table public.videos add column if not exists player_id uuid references public.players(id) on delete set null;
alter table public.videos add column if not exists match_id uuid references public.matches(id) on delete set null;
alter table public.videos add column if not exists notes text;
create index if not exists videos_player_id_idx on public.videos(player_id);

-- ---------------------------------------------------------------------------
-- assessments: histórico de valoraciones físicas para tracking de evolución.
-- ---------------------------------------------------------------------------
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  date date not null default current_date,
  height_cm numeric(5, 1),
  weight_kg numeric(5, 1),
  vertical_jump numeric(5, 1),
  horizontal_jump numeric(5, 1),
  flexibility_cmj numeric(5, 1),
  rm_squat numeric(5, 1),
  rm_deadlift numeric(5, 1),
  rm_bench numeric(5, 1),
  notes text,
  ai_analysis jsonb,
  created_at timestamptz not null default now()
);

create index if not exists assessments_coach_id_idx on public.assessments(coach_id);
create index if not exists assessments_player_id_idx on public.assessments(player_id);

alter table public.assessments enable row level security;

drop policy if exists assessments_coach_all on public.assessments;
create policy assessments_coach_all on public.assessments
  for all
  using (public.has_role('coach') and coach_id = auth.uid())
  with check (
    public.has_role('coach')
    and coach_id = auth.uid()
    and public.coach_owns_player(player_id)
  );

drop policy if exists assessments_player_read on public.assessments;
create policy assessments_player_read on public.assessments
  for select using (player_id in (select public.my_player_ids()));

-- ---------------------------------------------------------------------------
-- claim_invite_code: además de vincular auth_user_id, guarda el email del
-- jugador (auth.email()) en players.player_email (spec 3.11 / 4.3).
-- ---------------------------------------------------------------------------
create or replace function public.claim_invite_code(code text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  normalized text := public.normalize_invite_code(code);
  claimed_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  update public.players
  set auth_user_id = auth.uid(),
      player_email = auth.email()
  where invite_code = normalized
    and auth_user_id is null
  returning id into claimed_id;

  if claimed_id is null then
    return jsonb_build_object('success', false, 'error', 'Código de invitación no válido o ya usado.');
  end if;

  insert into public.user_roles(user_id, role)
  values (auth.uid(), 'player')
  on conflict do nothing;

  return jsonb_build_object('success', true, 'role', 'player', 'player_id', claimed_id);
end;
$$;

revoke execute on function public.claim_invite_code(text) from public;
grant execute on function public.claim_invite_code(text) to authenticated;
