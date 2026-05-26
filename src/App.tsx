import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/app/queryClient';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { AppRoutes } from '@/routes/AppRoutes';
import { Toaster } from '@/components/ui/toast';
import { initNative } from '@/lib/native';
import { isDemo, seedDemoData } from '@/lib/demo';

if (isDemo()) seedDemoData(queryClient);

export default function App() {
  useEffect(() => initNative(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Toaster />
        {isDemo() && (
          <div className="pointer-events-none fixed bottom-2 left-2 z-[200] rounded-md bg-destructive/90 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-destructive-foreground">
            demo
          </div>
        )}
      </AuthProvider>
    </QueryClientProvider>
  );
}
