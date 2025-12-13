// features/auth/stores/auth.store.ts - VERSÃO COMPLETA ATUALIZADA
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import {
  refreshToken as apiRefresh,
  logout as apiLogout,
  getUserTenantAccesses,
  switchTenant as apiSwitchTenant
} from '../api/auth.api';
import type { AuthUser, TenantAccess, UserTenantAccessesResponse } from '@/types/auth';
import { setAuthToken } from '@/lib/api/client';

interface AuthState {
  // State
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Tenants
  tenantAccesses: TenantAccess[];
  currentTenantId: string | null;

  name: string | null;

  // Actions
  login: (data: { token: string; userId: string, name: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  switchTenant: (tenantId: string) => Promise<boolean>;
  validateToken: () => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  setTenantAccesses: (accesses: TenantAccess[]) => void;
  loadTenantAccesses: () => Promise<UserTenantAccessesResponse>;
  setToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      tenantAccesses: [],
      currentTenantId: null,
      name: null,

      // Login - Save token and decode user info
      login: async (data) => {
        try {
          console.log('[AuthStore] Login - Token received, name:', data.name);
          const decoded: any = jwtDecode(data.token);

          console.log('[AuthStore] Decoded token claims:', {
            sub: decoded.sub,
            email: decoded.email,
            tenantId: decoded.tenantId,
            permissions: decoded.permissions,
            exp: decoded.exp,
            name: data.name,
          });

          // Extract permissions from token
          let permissions: string[] = [];
          if (Array.isArray(decoded.permissions)) {
            permissions = decoded.permissions;
          } else if (typeof decoded.permissions === 'string') {
            permissions = [decoded.permissions];
          } else if (decoded.permission) {
            permissions = Array.isArray(decoded.permission)
              ? decoded.permission
              : [decoded.permission];
          } else if (decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) {
            // Handle .NET role claims
            const roles = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            permissions = Array.isArray(roles) ? roles : [roles];
          }

          console.log('[AuthStore] Extracted permissions:', permissions);

          const user: AuthUser = {
            userId: data.userId || decoded.sub || '',
            email: decoded.email || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decoded.sub || '',
            tenantId: decoded.tenantId || decoded['tenantId'] || '',
            name: data.name,
            permissions,
          };

          set({
            user,
            token: data.token,
            isAuthenticated: true,
            currentTenantId: user.tenantId,
            isLoading: false,
          });

          // Sync token with axios
          setAuthToken(data.token);

          console.log('[AuthStore] Login successful:', {
            email: user.email,
            name: user.name,
            tenantId: user.tenantId,
            permissionsCount: user.permissions.length,
          });

        } catch (error) {
          console.error('[AuthStore] Login error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Logout - Clear everything
      logout: async () => {
        console.log('[AuthStore] Logging out...');

        try {
          // Call backend logout
          await apiLogout();
          console.log('[AuthStore] Backend logout successful');
        } catch (error) {
          console.warn('[AuthStore] Backend logout error (ignoring):', error);
        }

        // Clear local state
        get().clearAuth();
      },

      // Refresh token
      refreshToken: async (): Promise<boolean> => {
        console.log('[AuthStore] Refreshing token...');
        set({ isLoading: true });

        try {
          const result = await apiRefresh();
          console.log('[AuthStore] Refresh response:', result);

          if (!result?.token) {
            console.error('[AuthStore] No token in refresh response');
            set({ isLoading: false });
            return false;
          }

          // Decode new token
          const decoded: any = jwtDecode(result.token);

          let permissions: string[] = [];
          if (Array.isArray(decoded.permissions)) {
            permissions = decoded.permissions;
          } else if (typeof decoded.permissions === 'string') {
            permissions = [decoded.permissions];
          }

          const user: AuthUser = {
            userId: result.userId || decoded.sub || '',
            email: decoded.email || decoded.sub || '',
            tenantId: decoded.tenantId || '',
            name: result.name,
            permissions,
          };

          set({
            user,
            token: result.token,
            currentTenantId: user.tenantId,
            isLoading: false,
            name: user.name,
          });

          // Sync new token with axios
          setAuthToken(result.token);

          console.log('[AuthStore] Token refreshed successfully');
          return true;

        } catch (error: any) {
          console.error('[AuthStore] Refresh token error:', error.message);
          set({ isLoading: false });
          return false;
        }
      },

      // Switch tenant with API call
      // features/auth/stores/auth.store.ts - ATUALIZAR APENAS switchTenant method
      switchTenant: async (tenantId: string): Promise<boolean> => {
        console.log('[AuthStore] Switching tenant to:', tenantId);
        set({ isLoading: true });

        try {
          // 1. Chamar backend para switch tenant
          const result = await apiSwitchTenant(tenantId);

          // 2. Decodificar novo token
          const decoded: any = jwtDecode(result.token);

          let permissions: string[] = [];
          if (Array.isArray(decoded.permissions)) {
            permissions = decoded.permissions;
          } else if (typeof decoded.permissions === 'string') {
            permissions = [decoded.permissions];
          }

          const user: AuthUser = {
            userId: result.userId || decoded.sub || '',
            email: decoded.email || decoded.sub || '',
            tenantId: decoded.tenantId || '',
            name: result.name,
            permissions,
          };

          // 3. Atualizar store local
          set({
            user,
            token: result.token,
            currentTenantId: user.tenantId,
            isLoading: false,
            name: user.name,
          });

          // 4. Sincronizar com axios
          setAuthToken(result.token);

          console.log('[AuthStore] Tenant switched - store updated');

          // ✅ Retorna true para indicar sucesso
          return true;

        } catch (error: any) {
          console.error('[AuthStore] Switch tenant error:', error.message);
          set({ isLoading: false });
          return false;
        }
      },

      // Validate token with backend
      validateToken: async (): Promise<boolean> => {
        const { token } = get();
        if (!token) return false;

        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:7064'}/api/auth/validate`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) return false;

          const isValid = await response.json();
          console.log('[AuthStore] Token validation result:', isValid);

          return isValid;

        } catch (error) {
          console.error('[AuthStore] Token validation error:', error);
          return false;
        }
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Set tenant accesses
      setTenantAccesses: (accesses: TenantAccess[]) => {
        set({ tenantAccesses: accesses });

        // Find current tenant access
        const { currentTenantId } = get();
        const currentAccess = accesses.find(a => a.tenantId === currentTenantId);

        if (currentAccess) {
          console.log('[AuthStore] Current tenant access found:', currentAccess.tenantName);
        }
      },

      // Load tenant accesses from API
      loadTenantAccesses: async () => {
        set({ isLoading: true });

        try {
          const response = await getUserTenantAccesses();

          set({
            tenantAccesses: response.accessibleTenants,
            currentTenantId: response.currentTenantId,
            isLoading: false,
          });

          console.log('[AuthStore] Tenant accesses loaded:', response.accessibleTenants.length);

          return response;
        } catch (error) {
          console.error('[AuthStore] Failed to load tenant accesses:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Update token (used after tenant switch)
      setToken: (token: string) => {
        try {
          const decoded: any = jwtDecode(token);

          let permissions: string[] = [];
          if (Array.isArray(decoded.permissions)) {
            permissions = decoded.permissions;
          } else if (typeof decoded.permissions === 'string') {
            permissions = [decoded.permissions];
          }

          set({
            token,
            user: get().user ? {
              ...get().user!,
              tenantId: decoded.tenantId || '',
              permissions,
            } : null,
            currentTenantId: decoded.tenantId || '',
            name: get().user?.name || null,
          });

          // Sync with axios
          setAuthToken(token);

          console.log('[AuthStore] Token updated');
        } catch (error) {
          console.error('[AuthStore] Error updating token:', error);
        }
      },

      // Clear auth state without calling backend
      clearAuth: () => {
        console.log('[AuthStore] Clearing auth state');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          tenantAccesses: [],
          currentTenantId: null,
        });

        // Clear axios token
        setAuthToken(null);

        // Clear localStorage persistence
        localStorage.removeItem('auth-storage');
      },

    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        currentTenantId: state.currentTenantId,
        name: state.user?.name,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('[AuthStore] Rehydration error:', error);
          } else if (state?.token) {
            console.log('[AuthStore] Rehydrated from storage:', {
              email: state.user?.email,
              hasToken: !!state.token,
            });
            // Sync rehydrated token with axios
            setAuthToken(state.token);
          }
        };
      },
    }
  )
);

// Utility function to check permissions
export const hasPermission = (permission: string): boolean => {
  const { user } = useAuthStore.getState();
  return user?.permissions?.includes(permission) || false;
};

// Utility function to check any permission
export const hasAnyPermission = (permissions: string[]): boolean => {
  const { user } = useAuthStore.getState();
  return permissions.some(permission =>
    user?.permissions?.includes(permission)
  ) || false;
};

// Utility function to check all permissions
export const hasAllPermissions = (permissions: string[]): boolean => {
  const { user } = useAuthStore.getState();
  return permissions.every(permission =>
    user?.permissions?.includes(permission)
  ) || false;
};

// Utility function to get current tenant access
export const getCurrentTenantAccess = (): TenantAccess | null => {
  const { currentTenantId, tenantAccesses } = useAuthStore.getState();
  return tenantAccesses.find(access => access.tenantId === currentTenantId) || null;
};