// features/auth/components/ProtectedRoute.tsx - VERSÃO OTIMIZADA
import * as React from 'react';
import { useState, useContext, useEffect } from 'react';
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
  const [isValidating, setIsValidating] = useState(false);
  
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
      setIsValidating(true);
      authContext.validateSession().finally(() => {
        setIsValidating(false);
      });
    }
  }, [isAuthenticated, location.pathname, authContext]);

  // Check permissions (LOCAL - não chama API)
  const hasRequiredPermissions = requiredPermissions.length === 0 
    ? true 
    : hasAllPermissions(requiredPermissions);

  // Loading state (apenas durante validação ocasional)
  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

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