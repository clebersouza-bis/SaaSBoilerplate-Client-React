// app/App.tsx - VERSÃO FINAL
import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { AuthProvider } from '@/features/auth/components/AuthProvider';
import { router } from './router';
import { DebugPermissions } from '@/components/DebugPermissions';
import { Toaster } from '@/components/ui/toaster'; // Se tiver

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Componentes de debug DEVEM ficar DENTRO do AuthProvider */}
        <DebugPermissions />
        
        {/* APENAS UM RouterProvider */}
        <RouterProvider router={router} />
        
        {/* Toaster para notificações */}
        {/* <Toaster /> */}
      </AuthProvider>
    </QueryClientProvider>
  );
}