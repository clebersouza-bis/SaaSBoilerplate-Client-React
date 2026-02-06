// hooks/usePermissionError.ts
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from './useTranslation';
import { PermissionErrorEvent } from '@/types/errors';

interface PermissionErrorState {
  hasError: boolean;
  message?: string;
  resource?: string;
  action?: string;
  url?: string;
  method?: string;
}

export function usePermissionError() {
  const { t } = useTranslation();
  const [error, setError] = useState<PermissionErrorState>({ hasError: false });

  // Listener para eventos de erro de permissão
  useEffect(() => {
    const handlePermissionErrorEvent = (event: CustomEvent<PermissionErrorEvent>) => {
      const { detail } = event;
      
      setError({
        hasError: true,
        message: detail.message || t('errors.insufficientPermissions'),
        resource: detail.resource,
        action: detail.action,
        url: detail.url,
        method: detail.method
      });
    };

    // Adicionar event listener
    window.addEventListener('permissionError', handlePermissionErrorEvent as EventListener);

    return () => {
      window.removeEventListener('permissionError', handlePermissionErrorEvent as EventListener);
    };
  }, [t]);

  const handlePermissionError = useCallback((axiosError: any) => {
    const status = axiosError.response?.status;
    
    if (status === 403) {
      const url = axiosError.config?.url || '';
      const method = axiosError.config?.method?.toUpperCase() || '';
      const resource = axiosError.config?.resource || inferResourceFromUrl(url);
      const action = axiosError.config?.action || inferActionFromMethod(method);
      
      setError({
        hasError: true,
        message: t('errors.forbiddenAction', { resource, action }),
        resource,
        action,
        url,
        method
      });
      
      return true;
    }
    
    return false;
  }, [t]);

  const clearError = useCallback(() => {
    setError({ hasError: false });
  }, []);

  return {
    error,
    handlePermissionError,
    clearError
  };
}

// Funções auxiliares
function inferResourceFromUrl(url: string): string {
  if (url.includes('/customers')) return 'customers';
  if (url.includes('/users')) return 'users';
  if (url.includes('/roles')) return 'roles';
  if (url.includes('/products')) return 'products';
  if (url.includes('/orders')) return 'orders';
  if (url.includes('/settings')) return 'settings';
  return 'resource';
}

function inferActionFromMethod(method: string): string {
  switch (method) {
    case 'GET': return 'view';
    case 'POST': return 'create';
    case 'PUT': return 'update';
    case 'PATCH': return 'modify';
    case 'DELETE': return 'delete';
    default: return 'access';
  }
}