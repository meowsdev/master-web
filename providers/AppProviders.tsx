'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/query-client';
import { useSessionSync } from '@/hooks/useSessionSync';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  // The shared client (not a per-render one) lets the auth layer clear the
  // cache from outside React when a session ends.
  useSessionSync();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
