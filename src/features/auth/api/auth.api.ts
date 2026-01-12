// features/auth/api/auth.api.ts - VERSÃO ATUALIZADA
import api from '@/lib/api/client';
import type {
  LoginResponse,
  RefreshTokenResponse,
  RegisterUserRequest,
  RegisterUserResponse,
  SwitchTenantRequest,
  SwitchTenantResponse,
  UserTenantAccessesResponse,
} from '@/types/auth';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  email?: string;
}

export interface ResendVerificationRequest {
  email: string;
}

// Cache de validação
let validationCache: {
  promise: Promise<boolean> | null;
  timestamp: number;
} = { promise: null, timestamp: 0 };

const CACHE_DURATION = 30000; // 30 segundos

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', data, {
    skipAuth: true,
  });
  return response.data;
}

export async function refreshToken(): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/refresh', {}, {
    skipAuth: true,
  });
  return response.data;
}

export async function validateToken(): Promise<boolean> {
  const now = Date.now();
  
  // Retorna cache se ainda é válido
  if (validationCache.promise && now - validationCache.timestamp < CACHE_DURATION) {
    console.log('[Auth API] Returning cached validation');
    return validationCache.promise;
  }
  
  console.log('[Auth API] Making validation request');
  
  // Cria nova promessa de validação
  validationCache.promise = (async () => {
    try {
      const response = await api.post<boolean>('/auth/validate', {}, {
        skipAuth: false,
      });
      return response.data;
    } catch (error) {
      console.error('[Auth API] Validation request failed:', error);
      return false;
    }
  })();
  
  validationCache.timestamp = now;
  
  return validationCache.promise;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout', {});
}

export async function switchTenant(tenantId: string): Promise<SwitchTenantResponse> {
  const response = await api.post<SwitchTenantResponse>(
    '/auth/switch-tenant',
    { tenantId }
  );
  return response.data;
}

export async function getUserTenantAccesses(): Promise<UserTenantAccessesResponse> {
  const response = await api.get<UserTenantAccessesResponse>('/users/me/tenant-accesses');
  return response.data;
}

export const register = async (data: RegisterUserRequest): Promise<RegisterUserResponse> => {
  try {
    console.log('Register API call:', data);
    
    const response = await api.post<RegisterUserResponse>('/auth/register', {
      email: data.email,
      password: data.password,
      name: data.name || null,
      company: data.company,
      language: data.language,
    });
    
    console.log('Register response:', response.data);
    return response.data;
    
  } catch (error: any) {
    console.error('Register API error:', error);
    throw error;
  }
};

export const forgotPassword = async (email: string, language: string): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>('/auth/forgot-password', { email, language });
    return response.data;
  } catch (error) {
    console.error('Forgot password API error:', error);
    throw error;
  }
};

export const resetPassword = async (token: string, newPassword: string): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error('Reset password API error:', error);
    throw error;
  }
};

export const verifyEmail = async (token: string): Promise<VerifyEmailResponse> => {
  try {
    const response = await api.post<VerifyEmailResponse>('/auth/verify-email', {
      token
    });
    console.log('Verify email response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Verify email error:', error);
    throw error;
  }
};

export const resendVerificationEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post('/auth/resend-verification', {
      email
    });
    return response.data;
  } catch (error: any) {
    console.error('Resend verification error:', error);
    throw error;
  }
};