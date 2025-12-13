// lib/api/client.ts - VERSÃO DIRETA E FUNCIONAL
import axios from 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
  }
}

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7064';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage (simples e direto)
let authToken: string | null = null;

// Export função para setar token
export function setAuthToken(token: string | null) {
  authToken = token;
  console.log('[Axios] Token set:', token ? 'YES' : 'NO');
}

// Request interceptor DIRETO
api.interceptors.request.use(
  (config) => {
    console.log('[Axios] Request to:', config.url);
    
    // Skip auth para login/refresh
    if (config.skipAuth) {
      console.log('[Axios] Skipping auth for:', config.url);
      return config;
    }

    // Adiciona token se existir
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
      console.log('[Axios] ✓ Token added to headers');
    } else {
      console.warn('[Axios] ✗ No token available for:', config.url);
    }

    return config;
  },
  (error) => {
    console.error('[Axios] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('[Axios] Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.log('[Axios] Error:', error.response?.status, error.config?.url);
    
    // Se não é 401, ou já tentou refresh, ou skipAuth
    if (error.response?.status !== 401 || originalRequest?._retry || originalRequest?.skipAuth) {
      return Promise.reject(error);
    }
    
    originalRequest._retry = true;
    console.log('[Axios] Attempting token refresh...');
    
    try {
      // Import dinâmico para evitar circular deps
      const { useAuthStore } = await import('@/features/auth/stores/auth.store');
      const store = useAuthStore.getState();
      const success = await store.refreshToken();
      
      if (success) {
        // Atualiza token local
        authToken = useAuthStore.getState().token;
        originalRequest.headers.Authorization = `Bearer ${authToken}`;
        console.log('[Axios] Retrying with new token');
        return api(originalRequest);
      } else {
        console.error('[Axios] Refresh failed');
        return Promise.reject(error);
      }
    } catch (refreshError) {
      console.error('[Axios] Refresh error:', refreshError);
      return Promise.reject(refreshError);
    }
  }
);

export default api;