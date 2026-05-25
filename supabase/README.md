# Supabase — CAMPO

El backend (Postgres + Auth + Storage) vive en Supabase. La **anon key** es pública
por diseño; **la seguridad la garantiza RLS**, no el secreto de la clave.

## Aplicar las políticas RLS

```bash
# Opción A: Supabase CLI
supabase link --project-ref <ref>
supabase db push

# Opción B: pegar supabase/migrations/0001_enable_rls.sql en el SQL editor.
```

Revisa los nombres de columnas (`coach_id`, `player_id`, `auth_user_id`) frente a tu
esquema real antes de aplicar. Completa `videos`, `video_analysis` y `assessments`
siguiendo el mismo patrón.

## Tipos generados (opcional, recomendado)

```bash
supabase gen types typescript --project-id <ref> > src/types/database.ts
```

Luego tipa el cliente: `createClient<Database>(url, key)` en `src/lib/supabase.ts`.

## IA (Gemini/Groq)

Las claves de IA **no** deben ir en el cliente. Crea una Edge Function que reciba el
prompt, llame al proveedor con la clave guardada como secreto del proyecto, y devuelva
la respuesta. El cliente solo llama a la función (autenticada).

## Required RPCs

- `register_coach()`: creates the authenticated user's coach role.
- `claim_invite_code(code text)`: links the authenticated user to an unclaimed player row and grants player role.
- `set_my_task_done(task_id uuid, is_done boolean)`: lets a player complete only their own task.

## Local validation

Run against a disposable Supabase project before production:

```bash
supabase db reset
supabase db push
```

Then manually verify:

- A coach can create a player and receives `invite_code`.
- A player can claim that code after signup/login.
- The player cannot select another player's tasks.
- The player cannot insert a `coach` message.
