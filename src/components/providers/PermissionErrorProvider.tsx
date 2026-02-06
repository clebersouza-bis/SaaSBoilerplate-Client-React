// components/providers/PermissionErrorProvider.tsx
import { useState, useEffect } from 'react';
import { PermissionErrorModal } from '@/components/modals/PermissionErrorModal';
import { PermissionErrorEvent } from '@/types/errors';

export function PermissionErrorProvider({ children }: { children: React.ReactNode }) {
  const [permissionError, setPermissionError] = useState<{
    show: boolean;
    error?: {
      message?: string;
      resource?: string;
      action?: string;
      url?: string;
      method?: string;
    };
  }>({ show: false });

  useEffect(() => {
    const handlePermissionErrorEvent = (event: CustomEvent<PermissionErrorEvent>) => {
      const { detail } = event;
      
      setPermissionError({
        show: true,
        error: {
          message: detail.message,
          resource: detail.resource,
          action: detail.action,
          url: detail.url,
          method: detail.method
        }
      });
    };

    window.addEventListener('permissionError', handlePermissionErrorEvent as EventListener);

    return () => {
      window.removeEventListener('permissionError', handlePermissionErrorEvent as EventListener);
    };
  }, []);

  const handleCloseModal = () => {
    setPermissionError({ show: false });
  };

  return (
    <>
      {children}
      <PermissionErrorModal
        open={permissionError.show}
        onOpenChange={handleCloseModal}
        error={permissionError.error}
      />
    </>
  );
}