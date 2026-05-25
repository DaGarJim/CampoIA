/**
 * Configuración de entorno. Las variables VITE_* se inyectan en build time.
 * La anon key de Supabase es pública por diseño; la seguridad la garantiza RLS.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Faltan variables de entorno de Supabase. Copia .env.example a .env y rellena ' +
      'VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
  );
}

export const config = {
  supabaseUrl: url,
  supabaseAnonKey: anonKey,
} as const;
