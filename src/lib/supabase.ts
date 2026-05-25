import { createClient } from '@supabase/supabase-js';
import { config } from './config';

/**
 * Cliente Supabase único para toda la app (auth + datos + storage).
 * Sin Database genérico todavía: se generará con `npm run db:types`
 * (supabase gen types) y se tipará el cliente más adelante.
 */
export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
