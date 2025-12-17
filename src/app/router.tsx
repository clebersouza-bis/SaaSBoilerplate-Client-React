// app/router.tsx - VERSÃO COMPLETA COM PERMISSÕES
import * as React from 'react';
import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/features/dashboard/components/DashboardPage';
import { CustomersPage } from '@/features/customers/components/CustomersPage';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';
import { SettingsPage } from '@/features/settings/components/SettingsPage';

// Root route
const rootRoute = createRootRoute();

// Login route (public)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginForm,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterForm,
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/forgot-password',
  component: ForgotPasswordForm,
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  component: ResetPasswordForm,
});

// Dashboard route (protected with permission)
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <ProtectedRoute requiredPermissions={['dashboard.view']}>
      <AppLayout>
        <DashboardPage />
      </AppLayout>
    </ProtectedRoute>
  ),
});

// Customers route (protected with permission)
const customersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customers',
  component: () => (
    <ProtectedRoute requiredPermissions={['customers.read']}>
      <AppLayout>
        <CustomersPage />
      </AppLayout>
    </ProtectedRoute>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <SettingsPage />
      </AppLayout>
    </ProtectedRoute>
  ),
});

// Settings route (protected with permission)
// const settingsRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: '/settings',
//   component: () => (
//     <ProtectedRoute requiredPermissions={['settings.view']}>
//       <AppLayout>
//         <SettingsPage />
//       </AppLayout>
//     </ProtectedRoute>
//   ),
// });

// Create route tree
const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  dashboardRoute,
  customersRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  settingsRoute,

  // settingsRoute,
]);

// Create router
export const router = createRouter({ routeTree });

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}