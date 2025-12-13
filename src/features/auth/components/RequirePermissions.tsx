// features/auth/components/RequirePermissions.tsx
import * as React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Navigate } from '@tanstack/react-router';

interface RequirePermissionsProps {
  children: React.ReactNode;
  required: string[];
  fallback?: React.ReactNode;
}

export function RequirePermissions({ 
  children, 
  required, 
  fallback 
}: RequirePermissionsProps) {
  const { hasAllPermissions } = usePermissions();
  
  const hasAccess = hasAllPermissions(required);
  
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600 mt-2">
          You don't have permission to access this resource.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  return <>{children}</>;
}