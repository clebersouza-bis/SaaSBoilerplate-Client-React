// features/auth/components/AuthProvider.tsx - VERSÃO OTIMIZADA
import * as React from 'react';
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useAuthStore } from '../stores/auth.store';
import { validateToken, switchTenant as apiSwitchTenant } from '../api/auth.api';
import { SessionExpiredModal } from './SessionExpiredModal';

interface AuthContextType {
  isInitializing: boolean;
  isValidating: boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  validateSession: (force?: boolean) => Promise<boolean>;
  lastValidation: React.MutableRefObject<number>; // ← Expoe para outros componentes
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const {
    token,
    isAuthenticated,
    login,
    logout,
    setLoading,
    setToken,
    loadTenantAccesses, // ← Importar esta função
  } = useAuthStore();
  
  const queryClient = useQueryClient();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  
  // Cache aprimorado
  const lastValidationTime = useRef<number>(0);
  const validationInProgress = useRef<boolean>(false);
  const VALIDATION_CACHE_MS = 30000; // 30 segundos (aumentado)

  // Função de validação com lock para evitar concorrência
  const validateSession = React.useCallback(async (force = false): Promise<boolean> => {
    if (!token) return false;
    
    const now = Date.now();
    
    // Já está validando? Retorna promessa em andamento
    if (validationInProgress.current) {
      console.log('[Auth] Validation already in progress, waiting...');
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!validationInProgress.current) {
            clearInterval(checkInterval);
            resolve(true); // Assume válido se outra validação terminou
          }
        }, 100);
      });
    }
    
    // Usar cache se recente (a menos que force)
    if (!force && now - lastValidationTime.current < VALIDATION_CACHE_MS) {
      console.log('[Auth] Using cached validation');
      return true;
    }
    
    validationInProgress.current = true;
    setIsValidating(true);
    
    try {
      const isValid = await validateToken();
      lastValidationTime.current = now;
      
      if (!isValid) {
        await logout();
        setShowSessionExpired(true);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('[Auth] Validation error:', error);
      return false;
    } finally {
      validationInProgress.current = false;
      setIsValidating(false);
    }
  }, [token, logout]);

   useEffect(() => {
    async function initializeAuth() {
      if (!token) {
        setIsInitializing(false);
        return;
      }

      setLoading(true);
      try {
        await validateSession(true); // Força validação inicial
        
        // ⬇⬇⬇ CARREGAR TENANT ACCESSES APÓS VALIDAÇÃO ⬇⬇⬇
        try {
          await loadTenantAccesses();
          console.log('[AuthProvider] Tenant accesses loaded during initialization');
        } catch (tenantError) {
          console.warn('[AuthProvider] Failed to load tenant accesses:', tenantError);
          // Não falha a inicialização se não conseguir carregar tenants
        }
        
      } catch (error) {
        console.error('Auth initialization error:', error);
        await logout();
      } finally {
        setLoading(false);
        setIsInitializing(false);
      }
    }

    initializeAuth();
  }, []);

  // Periodic token validation - APENAS SE NECESSÁRIO
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      // Só valida se passou mais de 30 segundos desde a última
      if (Date.now() - lastValidationTime.current > VALIDATION_CACHE_MS) {
        await validateSession();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Handle tenant switching (mantém igual)
  const handleSwitchTenant = async (tenantId: string) => {
    setIsValidating(true);
    try {
      const result = await apiSwitchTenant(tenantId);
      setToken(result.token);
      queryClient.clear();
      window.location.reload();
    } catch (error) {
      console.error('Failed to switch tenant:', error);
      throw error;
    } finally {
      setIsValidating(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isInitializing: false,
        isValidating,
        switchTenant: handleSwitchTenant,
        validateSession,
        lastValidation: lastValidationTime, // ← Exporta para outros componentes verificarem
      }}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <SessionExpiredModal
          isOpen={showSessionExpired}
          onClose={() => setShowSessionExpired(false)}
          onConfirm={() => {
            logout();
            window.location.href = '/login';
          }}
        />
      </ThemeProvider>
    </AuthContext.Provider>
  );
}