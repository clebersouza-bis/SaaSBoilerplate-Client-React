// features/auth/stores/auth.store.ts - VERSÃO COMPLETA COM URL RELATIVA
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
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  tenantAccesses: TenantAccess[];
  currentTenantId: string | null;
  name: string | null;

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
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      tenantAccesses: [],
      currentTenantId: null,
      name: null,

      login: async (data) => {
        try {
          console.log('[AuthStore] Login - Token received, name:', data.name);
          const decoded: any = jwtDecode(data.token);

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
            const roles = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            permissions = Array.isArray(roles) ? roles : [roles];
          }

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

          setAuthToken(data.token);

        } catch (error) {
          console.error('[AuthStore] Login error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        console.log('[AuthStore] Logging out...');

        try {
          await apiLogout();
        } catch (error) {
          console.warn('[AuthStore] Backend logout error:', error);
        }

        get().clearAuth();
      },

      refreshToken: async (): Promise<boolean> => {
        console.log('[AuthStore] Refreshing token...');
        set({ isLoading: true });

        try {
          const result = await apiRefresh();

          if (!result?.token) {
            console.error('[AuthStore] No token in refresh response');
            set({ isLoading: false });
            return false;
          }

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

          setAuthToken(result.token);

          console.log('[AuthStore] Token refreshed successfully');
          return true;

        } catch (error: any) {
          console.error('[AuthStore] Refresh token error:', error.message);
          set({ isLoading: false });
          return false;
        }
      },

      switchTenant: async (tenantId: string): Promise<boolean> => {
        console.log('[AuthStore] Switching tenant to:', tenantId);
        set({ isLoading: true });

        try {
          const result = await apiSwitchTenant(tenantId);
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

          setAuthToken(result.token);

          return true;

        } catch (error: any) {
          console.error('[AuthStore] Switch tenant error:', error.message);
          set({ isLoading: false });
          return false;
        }
      },

      // ATUALIZADO: URL RELATIVA
      validateToken: async (): Promise<boolean> => {
        const { token } = get();
        if (!token) return false;

        try {
          // URL RELATIVA - /api/auth/validate
          const response = await fetch('/api/auth/validate', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) return false;

          const isValid = await response.json();
          return isValid;

        } catch (error) {
          console.error('[AuthStore] Token validation error:', error);
          return false;
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setTenantAccesses: (accesses: TenantAccess[]) => {
        set({ tenantAccesses: accesses });
      },

      loadTenantAccesses: async () => {
        set({ isLoading: true });

        try {
          const response = await getUserTenantAccesses();

          set({
            tenantAccesses: response.accessibleTenants,
            currentTenantId: response.currentTenantId,
            isLoading: false,
          });

          return response;
        } catch (error) {
          console.error('[AuthStore] Failed to load tenant accesses:', error);
          set({ isLoading: false });
          throw error;
        }
      },

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

          setAuthToken(token);

        } catch (error) {
          console.error('[AuthStore] Error updating token:', error);
        }
      },

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

        setAuthToken(null);
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
            setAuthToken(state.token);
          }
        };
      },
    }
  )
);

export const hasPermission = (permission: string): boolean => {
  const { user } = useAuthStore.getState();
  return user?.permissions?.includes(permission) || false;
};

export const hasAnyPermission = (permissions: string[]): boolean => {
  const { user } = useAuthStore.getState();
  return permissions.some(permission =>
    user?.permissions?.includes(permission)
  ) || false;
};

export const hasAllPermissions = (permissions: string[]): boolean => {
  const { user } = useAuthStore.getState();
  return permissions.every(permission =>
    user?.permissions?.includes(permission)
  ) || false;
};

export const getCurrentTenantAccess = (): TenantAccess | null => {
  const { currentTenantId, tenantAccesses } = useAuthStore.getState();
  return tenantAccesses.find(access => access.tenantId === currentTenantId) || null;
};