// features/auth/hooks/usePermissions.ts - VERSÃO MELHORADA
import { useAuthStore } from '../stores/auth.store';

export function usePermissions() {
  const permissions = useAuthStore((state) => state.user?.permissions || []);
  
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };
  
  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some(permission => 
      permissions.includes(permission)
    );
  };
  
  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(permission => 
      permissions.includes(permission)
    );
  };
  
  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}