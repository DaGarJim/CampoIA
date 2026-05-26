import { QueryClient } from '@tanstack/react-query';
import { isDemo } from '@/lib/demo';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // En modo demo las queries se sirven desde la caché pre-sembrada (sin backend):
      // staleTime infinito + sin reintentos evita refetch contra Supabase.
      staleTime: isDemo() ? Number.POSITIVE_INFINITY : 30_000,
      retry: isDemo() ? false : 1,
      refetchOnWindowFocus: false,
    },
  },
});
