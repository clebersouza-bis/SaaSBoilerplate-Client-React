// lib/api/client.ts
import axios from 'axios';
import { toast } from '@/hooks/use-toast';
import { PermissionErrorEvent } from '@/types/errors';
import { extractApiErrorMessage } from '@/lib/api/error-utils';
import { inferActionFromMethod, inferResourceFromUrl } from '@/lib/api/permission-utils';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
    skipErrorToast?: boolean;
    skipPermissionErrorModal?: boolean;
    resource?: string;
    action?: string;
  }
}

const getApiBaseUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    if (window.location.port === '5173' || window.location.port === '') {
      return 'https://localhost:7064/api';
    }
  }
  
  return '/api';
};

const API_BASE_PATH = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_PATH,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

// Emitir eventos personalizados para erros de permissão
const emitPermissionError = (errorData: {
  status: number;
  message: string;
  resource?: string;
  action?: string;
  url?: string;
  method?: string;
}) => {
  const event = new CustomEvent<PermissionErrorEvent>('permissionError', {
    detail: {
      status: errorData.status,
      message: errorData.message,
      resource: errorData.resource,
      action: errorData.action,
      url: errorData.url,
      method: errorData.method,
      timestamp: new Date().toISOString()
    }
  });
  window.dispatchEvent(event);
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (config.skipAuth) {
      return config;
    }

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || '';
    const method = originalRequest?.method?.toUpperCase() || '';
    const skipPermissionModal = originalRequest?.skipPermissionErrorModal;
    const resource = originalRequest?.resource;
    const action = originalRequest?.action;

    // Tratamento específico para 403
    if (status === 403 && !skipPermissionModal) {
      // Emitir evento de erro de permissão
      emitPermissionError({
        status: 403,
        message: error.response?.data?.message || 'Access denied',
        resource: resource || inferResourceFromUrl(url),
        action: action || inferActionFromMethod(method),
        url,
        method
      });
    }

    // Não mostrar toast para erros de permissão se estamos mostrando modal
    if (status === 403 && !skipPermissionModal) {
      // Não mostrar toast, apenas retornar o erro
      return Promise.reject(error);
    }

    // Toast para outros erros
    if (!originalRequest?.skipErrorToast && error.response) {
      switch (status) {
        case 401:
          if (!originalRequest?._retry && !originalRequest?.skipAuth) {
            toast({
              title: 'Session Expired',
              description: 'Please login again',
              variant: 'destructive',
            });
          }
          break;
          
        case 400:
        case 409:
        case 422:
          const errorMessage = extractApiErrorMessage(error, {
            fallbackMessage: 'Validation error',
          });
          toast({
            title: 'Validation Error',
            description: errorMessage,
            variant: 'destructive',
          });
          break;
          
        case 404:
          toast({
            title: 'Not Found',
            description: 'The requested resource was not found',
            variant: 'destructive',
          });
          break;
          
        case 500:
        case 502:
        case 503:
          toast({
            title: 'Server Error',
            description: 'Please try again later',
            variant: 'destructive',
          });
          break;
          
        default:
          toast({
            title: `Error ${status}`,
            description: 'An unexpected error occurred',
            variant: 'destructive',
          });
      }
    } else if (error.request && !originalRequest?.skipErrorToast) {
      toast({
        title: 'Network Error',
        description: 'Please check your internet connection',
        variant: 'destructive',
      });
    }

    // Refresh token para 401
    if (status === 401 && !originalRequest?._retry && !originalRequest?.skipAuth) {
      originalRequest._retry = true;
      
      try {
        const { useAuthStore } = await import('@/features/auth/stores/auth.store');
        const store = useAuthStore.getState();
        const success = await store.refreshToken();
        
        if (success) {
          authToken = useAuthStore.getState().token;
          originalRequest.headers.Authorization = `Bearer ${authToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('[Axios] Refresh error:', refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
