// app/App.tsx - VERSÃO ATUALIZADA (mantendo seu theme atual)
import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { AuthProvider } from '@/features/auth/components/AuthProvider';
import { router } from './router';
import { DebugPermissions } from '@/components/DebugPermissions';
import { Toaster } from '@/components/ui/toaster';
import { PermissionErrorProvider } from '@/components/providers/PermissionErrorProvider';

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
        <PermissionErrorProvider>
          {/* Componentes de debug DEVEM ficar DENTRO do AuthProvider */}
          <DebugPermissions />
          
          {/* APENAS UM RouterProvider */}
          <RouterProvider router={router} />
          
          {/* Toaster para notificações */}
          <Toaster />
        </PermissionErrorProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}