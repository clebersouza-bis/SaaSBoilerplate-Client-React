// features/auth/api/profile.api.ts
import api from '@/lib/api/client';

export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  photoPath?: string;
  active: boolean;
  emailConfirmed: boolean;
  phoneConfirmed: boolean;
  emailConfirmedDate?: string;
  phoneConfirmedDate?: string;
  createdAt: string;
  updatedAt?: string;
  roles?: string[];
  lastLogin?: string;
  language?: string;
  theme?: string;
  timezone?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdatePreferencesRequest {
  timezone?: string;
}

export interface UserPreferences {
  timezone?: string;
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActivity: string;
  current: boolean;
}

// Buscar perfil do usuário
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await api.get<UserProfile>('/users/me/profile');
    return response.data;
  } catch (error: any) {
    console.error('Get profile error:', error);
    throw error;
  }
};

export const getUserPreferences = async (): Promise<UserPreferences> => {
  try {
    const response = await api.get<UserPreferences>('/users/me/preferences');
    return response.data;
  } catch (error: any) {
    console.error('Get preferences error:', error);
    return {
      timezone: 'America/Sao_Paulo',
    };
  }
};

// Atualizar perfil
export const updateProfile = async (data: UpdateProfileRequest): Promise<UserProfile> => {
  try {
    const response = await api.patch<UserProfile>('/users/me', data);
    return response.data;
  } catch (error: any) {
    console.error('Update profile error:', error);
    throw error;
  }
};

// Alterar senha
export const changePassword = async (data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post('/users/me/change-password', data);
    return response.data;
  } catch (error: any) {
    console.error('Change password error:', error);
    throw error;
  }
};

export const updatePreferences = async (data: UpdatePreferencesRequest): Promise<UserPreferences> => {
  try {
    const response = await api.patch<UserPreferences>('/users/me/preferences', data);
    return response.data;
  } catch (error: any) {
    console.error('Update preferences error:', error);
    throw error;
  }
};

// Upload de foto
export const uploadProfilePhoto = async (file: File): Promise<{ photoPath: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/users/me/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Upload photo error:', error);
    throw error;
  }
};

// Buscar sessões ativas - CORRIGIDO
export const getUserSessions = async (): Promise<UserSession[]> => {
  try {
    const response = await api.get<any>('/auth/sessions');
    
    // Verifica se a resposta existe e é um array
    if (!response.data) {
      console.log('No sessions data returned, returning empty array');
      return [];
    }
    
    // Se for um array, retorna
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // Se for um objeto com uma propriedade sessions
    if (response.data.sessions && Array.isArray(response.data.sessions)) {
      return response.data.sessions;
    }
    
    // Se for um objeto com dados de sessão direto
    if (response.data.id || response.data.device) {
      return [response.data];
    }
    
    // Caso contrário, retorna array vazio
    console.log('Unexpected sessions data format:', response.data);
    return [];
    
  } catch (error: any) {
    console.error('Get sessions error:', error);
    
    // Se for erro 404 ou endpoint não existe, retorna array vazio
    if (error.response?.status === 404) {
      console.log('Sessions endpoint not found, returning empty array');
      return [];
    }
    
    // Para outros erros, retorna array vazio
    return [];
  }
};

// Revogar sessão - CORRIGIDO
export const revokeSession = async (sessionId: string): Promise<void> => {
  try {
    await api.delete(`/auth/sessions/${sessionId}`);
  } catch (error: any) {
    console.error('Revoke session error:', error);
    // Não lança erro, apenas loga
  }
};

// Revogar todas as sessões - CORRIGIDO
export const revokeAllSessions = async (): Promise<void> => {
  try {
    await api.delete('/auth/sessions');
  } catch (error: any) {
    console.error('Revoke all sessions error:', error);
    // Não lança erro, apenas loga
  }
};