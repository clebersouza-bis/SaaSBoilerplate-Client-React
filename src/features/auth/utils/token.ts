// features/auth/utils/token.ts
import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  userId: string;
  email: string;
  tenantId: string;
  permissions: string[];
  exp: number;
  iat: number;
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

export function getTokenExpiryTime(token: string): number | null {
  const decoded = decodeToken(token);
  return decoded?.exp || null;
}