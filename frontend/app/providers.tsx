'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          {children}
          <Toaster richColors position="top-right" />
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
} 