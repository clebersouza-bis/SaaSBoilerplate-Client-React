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
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  photoPath?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdatePreferencesRequest {
  language?: string;
  theme?: string;
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

// Buscar sessões ativas
export const getUserSessions = async (): Promise<UserSession[]> => {
  try {
    const response = await api.get<UserSession[]>('/auth/sessions');
    return response.data;
  } catch (error: any) {
    console.error('Get sessions error:', error);
    throw error;
  }
};

// Revogar sessão
export const revokeSession = async (sessionId: string): Promise<void> => {
  try {
    await api.delete(`/auth/sessions/${sessionId}`);
  } catch (error: any) {
    console.error('Revoke session error:', error);
    throw error;
  }
};

// Revogar todas as sessões
export const revokeAllSessions = async (): Promise<void> => {
  try {
    await api.delete('/auth/sessions');
  } catch (error: any) {
    console.error('Revoke all sessions error:', error);
    throw error;
  }
};