-- 0006_auto_confirm_email_staging.sql
-- SOLO STAGING/PREVIEW. En staging la opción "Confirm email" de Supabase Auth
-- estaba activada, de modo que los registros no devolvían sesión y las cuentas
-- nuevas no podían iniciar sesión (login y registro "rotos" de cara al usuario).
-- Esto: (1) confirma las cuentas existentes para que puedan entrar, y (2) añade
-- un trigger que auto-confirma cada registro futuro — equivalente a "Confirm
-- email = OFF" sin depender del panel.
--
-- ⚠️ NO aplicar en producción real: allí se quiere la confirmación por email.
-- En prod, en su lugar, desactivar/activar el ajuste desde Auth → Providers →
-- Email según la política deseada, y NO crear este trigger.

update auth.users set email_confirmed_at = now() where email_confirmed_at is null;

create or replace function public.auto_confirm_users()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.email_confirmed_at is null then
    new.email_confirmed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists campo_auto_confirm on auth.users;
create trigger campo_auto_confirm
  before insert on auth.users
  for each row execute function public.auto_confirm_users();
