-- 0004_harden_grants.sql
-- Endurecimiento sugerido por los security advisors tras 0002/0003.
-- Reduce privilegios (no expande). Idempotente.

-- El trigger apply_checkin_status NO debe ser invocable como RPC por nadie:
-- solo se ejecuta desde el trigger AFTER INSERT/UPDATE on check_ins.
revoke execute on function public.apply_checkin_status() from public;
revoke execute on function public.apply_checkin_status() from anon;
revoke execute on function public.apply_checkin_status() from authenticated;

-- RPCs de jugador: solo usuarios autenticados (nunca anon).
revoke execute on function public.set_my_photo(text) from anon;
revoke execute on function public.set_my_training_done(uuid, boolean) from anon;

-- Bucket público campo-files: una SELECT policy amplia permite LISTAR todos los
-- objetos. El acceso por URL pública no necesita esta policy (bucket public=true),
-- así que la quitamos para evitar la enumeración de archivos.
drop policy if exists campo_files_public_read on storage.objects;
