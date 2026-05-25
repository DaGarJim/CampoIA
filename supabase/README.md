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
