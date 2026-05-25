create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('coach', 'player');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.player_status as enum ('available', 'risk', 'injured', 'unavailable');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.trend as enum ('up', 'down', 'eq');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.task_priority as enum ('normal', 'high', 'urgent');
exception when duplicate_object then null;
end $$;

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.user_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  invite_code text unique,
  name text not null,
  pos text,
  pos_group text,
  age integer,
  foot text,
  club text,
  category text,
  status public.player_status not null default 'available',
  trend public.trend default 'eq',
  score integer,
  adherence integer default 0,
  mins integer default 0,
  callups integer default 0,
  played integer default 0,
  scored integer default 0,
  assisted integer default 0,
  sleep numeric,
  tag text,
  height_cm integer,
  weight_kg integer,
  photo_url text,
  created_at timestamptz not null default now(),
  constraint players_age_range check (age is null or age between 6 and 80),
  constraint players_score_range check (score is null or score between 0 and 100),
  constraint players_adherence_range check (adherence is null or adherence between 0 and 100)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  date date not null,
  rival text,
  result text,
  mins integer default 0,
  called text,
  role text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  player_id uuid references public.players(id) on delete cascade,
  description text not null,
  type text,
  priority public.task_priority default 'normal',
  due_date date,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  player_id uuid references public.players(id) on delete cascade,
  type text,
  duration integer,
  date date not null,
  rpe integer,
  goal text,
  notes text,
  created_at timestamptz not null default now(),
  constraint training_duration_range check (duration is null or duration between 0 and 600),
  constraint training_rpe_range check (rpe is null or rpe between 1 and 10)
);

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  date date not null,
  mood integer,
  energy integer,
  sleep_hours numeric,
  pain_level integer,
  pain_zone text,
  notes text,
  created_at timestamptz not null default now(),
  constraint checkins_unique_player_date unique (player_id, date),
  constraint checkins_mood_range check (mood is null or mood between 1 and 5),
  constraint checkins_energy_range check (energy is null or energy between 1 and 5),
  constraint checkins_sleep_range check (sleep_hours is null or sleep_hours between 0 and 14),
  constraint checkins_pain_range check (pain_level is null or pain_level between 0 and 10)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  sender public.user_role not null,
  body text not null,
  created_at timestamptz not null default now(),
  read boolean not null default false
);

create index if not exists players_coach_id_idx on public.players(coach_id);
create index if not exists players_auth_user_id_idx on public.players(auth_user_id);
create index if not exists matches_coach_id_idx on public.matches(coach_id);
create index if not exists matches_player_id_idx on public.matches(player_id);
create index if not exists tasks_coach_id_idx on public.tasks(coach_id);
create index if not exists tasks_player_id_idx on public.tasks(player_id);
create index if not exists training_sessions_coach_id_idx on public.training_sessions(coach_id);
create index if not exists training_sessions_player_id_idx on public.training_sessions(player_id);
create index if not exists check_ins_player_id_idx on public.check_ins(player_id);
create index if not exists messages_coach_player_idx on public.messages(coach_id, player_id);

create or replace function public.normalize_invite_code(code text)
returns text language sql immutable as $$
  select upper(regexp_replace(coalesce(code, ''), '[^A-Za-z0-9]', '', 'g'));
$$;

create or replace function public.generate_invite_code()
returns text language sql volatile as $$
  select upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
$$;

create or replace function public.ensure_player_invite_code()
returns trigger language plpgsql as $$
begin
  if new.invite_code is null or new.invite_code = '' then
    new.invite_code := public.generate_invite_code();
  else
    new.invite_code := public.normalize_invite_code(new.invite_code);
  end if;
  return new;
end;
$$;

drop trigger if exists players_invite_code_before_insert on public.players;
create trigger players_invite_code_before_insert
before insert on public.players
for each row execute function public.ensure_player_invite_code();

create or replace function public.my_player_ids()
returns setof uuid
language sql stable security definer set search_path = public as $$
  select id from public.players where auth_user_id = auth.uid();
$$;

create or replace function public.register_coach()
returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  insert into public.user_roles(user_id, role)
  values (auth.uid(), 'coach')
  on conflict do nothing;

  return jsonb_build_object('success', true, 'role', 'coach');
end;
$$;

create or replace function public.claim_invite_code(code text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  normalized text := public.normalize_invite_code(code);
  claimed_player public.players%rowtype;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into claimed_player
  from public.players
  where invite_code = normalized
    and auth_user_id is null
  limit 1;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Código de invitación no válido o ya usado.');
  end if;

  update public.players
  set auth_user_id = auth.uid()
  where id = claimed_player.id;

  insert into public.user_roles(user_id, role)
  values (auth.uid(), 'player')
  on conflict do nothing;

  return jsonb_build_object('success', true, 'role', 'player', 'player_id', claimed_player.id);
end;
$$;

create or replace function public.set_my_task_done(task_id uuid, is_done boolean)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  updated_count integer;
begin
  update public.tasks
  set done = is_done
  where id = task_id
    and player_id in (select public.my_player_ids());

  get diagnostics updated_count = row_count;

  if updated_count = 0 then
    return jsonb_build_object('success', false, 'error', 'Tarea no encontrada.');
  end if;

  return jsonb_build_object('success', true);
end;
$$;

alter table public.user_roles enable row level security;
alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.tasks enable row level security;
alter table public.training_sessions enable row level security;
alter table public.check_ins enable row level security;
alter table public.messages enable row level security;

drop policy if exists user_roles_self_read on public.user_roles;
create policy user_roles_self_read on public.user_roles
  for select using (user_id = auth.uid());

drop policy if exists players_coach_all on public.players;
create policy players_coach_all on public.players
  for all using (coach_id = auth.uid()) with check (coach_id = auth.uid());

drop policy if exists players_self_read on public.players;
create policy players_self_read on public.players
  for select using (auth_user_id = auth.uid());

drop policy if exists matches_coach_all on public.matches;
create policy matches_coach_all on public.matches
  for all using (coach_id = auth.uid()) with check (coach_id = auth.uid());

drop policy if exists matches_player_read on public.matches;
create policy matches_player_read on public.matches
  for select using (player_id in (select public.my_player_ids()));

drop policy if exists tasks_coach_all on public.tasks;
create policy tasks_coach_all on public.tasks
  for all using (coach_id = auth.uid()) with check (coach_id = auth.uid());

drop policy if exists tasks_player_read on public.tasks;
create policy tasks_player_read on public.tasks
  for select using (player_id in (select public.my_player_ids()));

drop policy if exists training_coach_all on public.training_sessions;
create policy training_coach_all on public.training_sessions
  for all using (coach_id = auth.uid()) with check (coach_id = auth.uid());

drop policy if exists training_player_read on public.training_sessions;
create policy training_player_read on public.training_sessions
  for select using (player_id in (select public.my_player_ids()));

drop policy if exists checkins_player_all on public.check_ins;
create policy checkins_player_all on public.check_ins
  for all using (player_id in (select public.my_player_ids()))
  with check (player_id in (select public.my_player_ids()));

drop policy if exists checkins_coach_read on public.check_ins;
create policy checkins_coach_read on public.check_ins
  for select using (player_id in (select id from public.players where coach_id = auth.uid()));

drop policy if exists messages_coach_read_write on public.messages;
create policy messages_coach_read_write on public.messages
  for all using (coach_id = auth.uid())
  with check (coach_id = auth.uid() and sender = 'coach');

drop policy if exists messages_player_read_write on public.messages;
create policy messages_player_read_write on public.messages
  for all using (player_id in (select public.my_player_ids()))
  with check (player_id in (select public.my_player_ids()) and sender = 'player');
