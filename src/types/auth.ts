// types/auth.ts - VERSÃO COMPLETA ATUALIZADA
export interface AuthUser {
  userId: string;
  email: string;
  tenantId: string;
  permissions: string[];
  name?: string;
  avatarUrl?: string;
}

export interface TenantAccess {
  tenantId: string;
  tenantName: string;
  isDefaultLogin: boolean;
  permissions: string[];
}

export interface UserTenantAccessesResponse {
  currentTenantId: string;
  accessibleTenants: TenantAccess[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  token: string;
  expiresAt: string;
  issuedAt: string;
  name: string;
  expiresIn: number;
  user?: {
    name?: string;
    email?: string;
    avatarUrl?: string;
  };
}

export interface RegisterUserRequest {
  email: string;
  password: string;
  name?: string;
  company: string;
}

export interface RegisterUserResponse {
  userId: string;
  email: string;
  name?: string;
  message: string;
  createdAt: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface RefreshTokenResponse extends LoginResponse {}

export interface SwitchTenantRequest {
  tenantId: string;
}

export interface SwitchTenantResponse extends LoginResponse {}

export interface ValidateTokenResponse {
  isValid: boolean;
  expiresIn?: number;
}