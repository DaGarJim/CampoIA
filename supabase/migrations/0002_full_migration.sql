-- 0002_full_migration.sql
-- Additive migration for the full legacy→React parity migration. Mirrors the
-- authorization helpers and RLS patterns established in 0001 (has_role,
-- coach_owns_player, my_player_ids). Idempotent and reproducible.
-- NOTE: not applied automatically — apply with `supabase db push` after review.

-- ---------------------------------------------------------------------------
-- players: physical assessment + AI-derived data + demo flag.
-- ---------------------------------------------------------------------------
alter table public.players add column if not exists vertical_jump integer;
alter table public.players add column if not exists horizontal_jump integer;
alter table public.players add column if not exists flexibility_cmj numeric;
alter table public.players add column if not exists rm_squat integer;
alter table public.players add column if not exists rm_deadlift integer;
alter table public.players add column if not exists rm_bench integer;
alter table public.players add column if not exists ai_attributes jsonb;
alter table public.players add column if not exists ai_metrics jsonb;
alter table public.players add column if not exists strength text;
alter table public.players add column if not exists improve text;
alter table public.players add column if not exists demo boolean not null default false;

-- ---------------------------------------------------------------------------
-- training_sessions: completion tracked by the player.
-- ---------------------------------------------------------------------------
alter table public.training_sessions add column if not exists completed boolean not null default false;
alter table public.training_sessions add column if not exists completed_at timestamptz;

-- ---------------------------------------------------------------------------
-- coach_profiles: profile + PDF branding + preferences (one row per coach).
-- Replaces the legacy localStorage `campo_prefs` so settings persist across
-- devices and are readable server-side by the ai-coach edge function.
-- ---------------------------------------------------------------------------
create table if not exists public.coach_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  specialty text,
  experience_years integer,
  certifications text,
  club text,
  web text,
  brand_name text,
  brand_color text,
  brand_slogan text,
  logo_url text,
  report_footer text,
  report_disclaimer text,
  prefs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- videos: coach's private video library.
-- ---------------------------------------------------------------------------
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  url text not null,
  size_mb numeric,
  highlights jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- video_analysis: analysis shared with a player (link or uploaded file) plus
-- timestamped highlights. Coach owns; the linked player can read theirs.
-- ---------------------------------------------------------------------------
create table if not exists public.video_analysis (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  player_id uuid references public.players(id) on delete cascade,
  title text not null,
  video_url text,
  video_type text not null default 'link',
  comment text,
  highlights jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint video_analysis_type check (video_type in ('link', 'file'))
);

create index if not exists videos_coach_id_idx on public.videos(coach_id);
create index if not exists video_analysis_coach_id_idx on public.video_analysis(coach_id);
create index if not exists video_analysis_player_id_idx on public.video_analysis(player_id);

-- ---------------------------------------------------------------------------
-- RPC: a player marks their OWN training session complete (only the completed
-- flag + timestamp). Mirrors set_my_task_done from 0001.
-- ---------------------------------------------------------------------------
create or replace function public.set_my_training_done(session_id uuid, is_done boolean)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  updated_count integer;
begin
  update public.training_sessions
  set completed = is_done,
      completed_at = case when is_done then now() else null end
  where id = session_id
    and player_id in (select public.my_player_ids());

  get diagnostics updated_count = row_count;

  if updated_count = 0 then
    return jsonb_build_object('success', false, 'error', 'Sesión no encontrada.');
  end if;

  return jsonb_build_object('success', true);
end;
$$;

revoke execute on function public.set_my_training_done(uuid, boolean) from public;
grant execute on function public.set_my_training_done(uuid, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- RPC: a player sets their OWN profile photo. Players cannot write to the
-- players table under RLS, so this SECURITY DEFINER function scopes the update
-- to their linked row only.
-- ---------------------------------------------------------------------------
create or replace function public.set_my_photo(url text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  updated_count integer;
begin
  update public.players set photo_url = url where auth_user_id = auth.uid();
  get diagnostics updated_count = row_count;
  if updated_count = 0 then
    return jsonb_build_object('success', false, 'error', 'Sin ficha vinculada.');
  end if;
  return jsonb_build_object('success', true);
end;
$$;

revoke execute on function public.set_my_photo(text) from public;
grant execute on function public.set_my_photo(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Auto-status from check-in: a player cannot write to players under RLS, so a
-- SECURITY DEFINER trigger escalates their status from wellness signals. Only
-- escalates (risk/unavailable); never auto-recovers to 'available' so it can't
-- override a coach's manual call. Mirrors the legacy submitCheckIn thresholds.
-- ---------------------------------------------------------------------------
create or replace function public.apply_checkin_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(new.pain_level, 0) >= 7 or coalesce(new.mood, 5) <= 1 or coalesce(new.energy, 5) <= 1 then
    update public.players set status = 'unavailable' where id = new.player_id;
  elsif coalesce(new.pain_level, 0) >= 4 or coalesce(new.mood, 5) <= 2 then
    update public.players set status = 'risk' where id = new.player_id and status = 'available';
  end if;
  return new;
end;
$$;

drop trigger if exists check_ins_apply_status on public.check_ins;
create trigger check_ins_apply_status
after insert or update on public.check_ins
for each row execute function public.apply_checkin_status();

-- ---------------------------------------------------------------------------
-- RLS for new tables.
-- ---------------------------------------------------------------------------
alter table public.coach_profiles enable row level security;
alter table public.videos enable row level security;
alter table public.video_analysis enable row level security;

-- coach_profiles: self read/write only.
drop policy if exists coach_profiles_self_all on public.coach_profiles;
create policy coach_profiles_self_all on public.coach_profiles
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- videos: coach-owned, private to the coach.
drop policy if exists videos_coach_all on public.videos;
create policy videos_coach_all on public.videos
  for all
  using (public.has_role('coach') and coach_id = auth.uid())
  with check (public.has_role('coach') and coach_id = auth.uid());

-- video_analysis: coach owns; player reads theirs.
drop policy if exists video_analysis_coach_all on public.video_analysis;
create policy video_analysis_coach_all on public.video_analysis
  for all
  using (public.has_role('coach') and coach_id = auth.uid())
  with check (
    public.has_role('coach')
    and coach_id = auth.uid()
    and (player_id is null or public.coach_owns_player(player_id))
  );

drop policy if exists video_analysis_player_read on public.video_analysis;
create policy video_analysis_player_read on public.video_analysis
  for select using (player_id in (select public.my_player_ids()));

-- ---------------------------------------------------------------------------
-- Storage: single bucket `campo-files` for player photos, coach logos and
-- videos. Public read (so getPublicUrl works for shared analysis/photos);
-- writes restricted to the coach's own prefix `{kind}/{coachId}/...`.
-- The coach_id is always the 2nd path segment by construction (see lib/storage.ts).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('campo-files', 'campo-files', true)
on conflict (id) do update set public = true;

drop policy if exists campo_files_public_read on storage.objects;
create policy campo_files_public_read on storage.objects
  for select using (bucket_id = 'campo-files');

drop policy if exists campo_files_owner_insert on storage.objects;
create policy campo_files_owner_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'campo-files' and (storage.foldername(name))[2] = auth.uid()::text);

drop policy if exists campo_files_owner_update on storage.objects;
create policy campo_files_owner_update on storage.objects
  for update to authenticated
  using (bucket_id = 'campo-files' and (storage.foldername(name))[2] = auth.uid()::text)
  with check (bucket_id = 'campo-files' and (storage.foldername(name))[2] = auth.uid()::text);

drop policy if exists campo_files_owner_delete on storage.objects;
create policy campo_files_owner_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'campo-files' and (storage.foldername(name))[2] = auth.uid()::text);
