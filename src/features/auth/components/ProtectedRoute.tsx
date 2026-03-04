// features/auth/components/ProtectedRoute.tsx - VERSÃO OTIMIZADA
import * as React from 'react';
import { useContext, useEffect } from 'react';
import { Navigate, useLocation } from '@tanstack/react-router';
import { useAuthStore } from '../stores/auth.store';
import { AuthContext } from './AuthProvider';
import { usePermissions } from '../hooks/usePermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
}

export function ProtectedRoute({ 
  children, 
  requiredPermissions = [] 
}: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore();
  const { hasAllPermissions } = usePermissions();
  const authContext = useContext(AuthContext);
  const location = useLocation();
  
  // Apenas valida se NUNCA validou antes ou se passou muito tempo
  useEffect(() => {
    if (!isAuthenticated || !authContext) return;
    
    // Se o AuthContext tem informação de última validação, verifica
    const shouldValidate = () => {
      if (!authContext.lastValidation) return true;
      
      const now = Date.now();
      const timeSinceLastValidation = now - authContext.lastValidation.current;
      
      // Valida apenas se passou mais de 1 minuto desde a última validação
      return timeSinceLastValidation > 60000;
    };
    
    if (shouldValidate()) {
      // Validação em background para não desmontar a tela atual e perder estado de formulário
      authContext.validateSession().catch((error) => {
        console.error('[ProtectedRoute] Background validation failed:', error);
      });
    }
  }, [isAuthenticated, location.pathname, authContext]);

  // Check permissions (LOCAL - não chama API)
  const hasRequiredPermissions = requiredPermissions.length === 0 
    ? true 
    : hasAllPermissions(requiredPermissions);

  // Não autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Sem permissões
  if (!hasRequiredPermissions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600 mt-2">
          Required permissions: {requiredPermissions.join(', ')}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
