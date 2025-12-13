// components/DebugPermissions.tsx
import * as React from 'react';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export function DebugPermissions() {
  const { user } = useAuthStore();
  
  React.useEffect(() => {

    console.log('=== DEBUG PERMISSIONS ===');
    console.log('User permissions:', user?.permissions);
    console.log('User name:', user?.name);
    console.log('Has customers.read:', user?.permissions?.includes('customers.read'));
    console.log('=======================');
  }, [user]);
  
  return null;
}