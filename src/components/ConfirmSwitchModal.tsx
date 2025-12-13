// components/ConfirmSwitchModal.tsx
import * as React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmSwitchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantName: string;
  onConfirm: () => Promise<void>;
}

export function ConfirmSwitchModal({
  open,
  onOpenChange,
  tenantName,
  onConfirm,
}: ConfirmSwitchModalProps) {
  const { t } = useTranslation();
  const [isSwitching, setIsSwitching] = React.useState(false);

  const handleConfirm = async () => {
    setIsSwitching(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Switch failed:', error);
      setIsSwitching(false);
      onOpenChange(false);
    }
  };

 return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('tenant.switchTenant')}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              {t('tenant.confirmSwitch', { tenant: tenantName })}
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              ⚠️ {t('tenant.confirmSwitchDescription')}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSwitching}>
            {t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={isSwitching}
            className="bg-primary hover:bg-primary/90"
          >
            {isSwitching ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                {t('tenant.switching')}
              </>
            ) : (
              t('tenant.switchTenant')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}