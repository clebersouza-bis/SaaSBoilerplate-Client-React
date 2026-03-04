import * as React from 'react';
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
import { useTranslation } from '@/hooks/useTranslation';

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmationDialogContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmationDialogContext = React.createContext<ConfirmationDialogContextValue | undefined>(undefined);

export function useConfirmationDialog() {
  const context = React.useContext(ConfirmationDialogContext);
  if (!context) {
    throw new Error('useConfirmationDialog must be used within ConfirmationDialogProvider');
  }
  return context;
}

export function ConfirmationDialogProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const resolverRef = React.useRef<((value: boolean) => void) | null>(null);
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<ConfirmOptions>({});

  const close = React.useCallback((result: boolean) => {
    setOpen(false);
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  }, []);

  const confirm = React.useCallback((nextOptions: ConfirmOptions) => {
    setOptions(nextOptions);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  return (
    <ConfirmationDialogContext.Provider value={{ confirm }}>
      {children}

      <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && close(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options.title || t('common.confirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {options.description || t('common.somethingWentWrong')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => close(false)}>
              {options.cancelText || t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => close(true)}>
              {options.confirmText || t('common.yes')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmationDialogContext.Provider>
  );
}

