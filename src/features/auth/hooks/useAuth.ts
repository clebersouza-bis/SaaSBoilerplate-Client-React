// features/auth/hooks/useAuth.ts
import { useAuthStore } from '../stores/auth.store';

export function useAuth() {
  return useAuthStore();
}