-- 0005_fix_invite_code_function.sql
-- Bugfix: en 0001, generate_invite_code() llamaba a gen_random_bytes(4) de
-- pgcrypto, que en Supabase vive en el schema `extensions`. La función fija
-- `set search_path = public` y es invocada por el trigger
-- ensure_player_invite_code en cada INSERT en `players`, por lo que en runtime
-- no encuentra gen_random_bytes y aborta el INSERT con:
--   ERROR: function gen_random_bytes(integer) does not exist
-- Cambiamos a primitivas core de PostgreSQL (md5 + random) — sin dependencia de
-- extensiones — manteniendo el mismo formato: 6 caracteres hex en mayúsculas.
create or replace function public.generate_invite_code()
returns text language sql volatile set search_path = public as $$
  select upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
$$;
