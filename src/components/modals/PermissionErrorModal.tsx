// components/modals/PermissionErrorModal.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Lock, Mail, HelpCircle, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useEffect, useState } from 'react';

interface PermissionErrorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  error?: {
    message?: string;
    resource?: string;
    action?: string;
    url?: string;
    method?: string;
  };
}

export function PermissionErrorModal({
  open,
  onOpenChange,
  error
}: PermissionErrorModalProps) {
  const { t } = useTranslation();
  const [errorDetails, setErrorDetails] = useState<string>('');

  useEffect(() => {
    if (error) {
      const details = [
        error.resource && `Resource: ${error.resource}`,
        error.action && `Action: ${error.action}`,
        error.method && `Method: ${error.method}`,
        error.url && `Endpoint: ${error.url}`
      ].filter(Boolean).join('\n');
      
      setErrorDetails(details);
    }
  }, [error]);

  const handleContactAdmin = () => {
    const subject = encodeURIComponent(`Permission Request: ${error?.action || 'access'} ${error?.resource || 'resource'}`);
    const body = encodeURIComponent(
      `Hello Administrator,\n\nI need permission to ${error?.action || 'access'} the ${error?.resource || 'resource'}.\n\n` +
      `Error Details:\n${errorDetails}\n\n` +
      `User: [Your Name]\nRole: [Your Role]\n\nThank you.`
    );
    window.open(`mailto:admin@company.com?subject=${subject}&body=${body}`, '_blank');
  };

  const handleCopyDetails = () => {
    const textToCopy = `Permission Error:\n\n` +
      `Message: ${error?.message || 'Access denied'}\n` +
      `${errorDetails}`;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        alert('Error details copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  const handleRequestAccess = () => {
    // Integração com sistema de request de acesso
    console.log('Requesting access for:', error);
    
    // Exemplo de implementação:
    const requestData = {
      resource: error?.resource,
      action: error?.action,
      requestedAt: new Date().toISOString(),
      reason: 'Need access to perform job duties'
    };
    
    // Aqui você faria uma chamada API para seu sistema de requests
    // api.post('/access-requests', requestData, { skipPermissionErrorModal: true });
    
    alert(t('permission.requestSubmitted'));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-destructive text-xl">
                {t('errors.accessDenied')}
              </DialogTitle>
              <DialogDescription className="text-base">
                {t('errors.permissionRequired')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Mensagem de erro principal */}
          <div className="bg-muted/30 p-4 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {error?.message || t('errors.insufficientPermissions')}
                </p>
                
                {errorDetails && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground font-medium">
                        Technical Details:
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={handleCopyDetails}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
                      {errorDetails}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Como obter acesso */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {t('permission.howToGetAccess')}
                </p>
                <ul className="text-xs text-blue-600 dark:text-blue-400 mt-2 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 bg-blue-400 rounded-full mt-1.5"></div>
                    <span>{t('permission.contactYourManager')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 bg-blue-400 rounded-full mt-1.5"></div>
                    <span>{t('permission.submitAccessRequest')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 bg-blue-400 rounded-full mt-1.5"></div>
                    <span>{t('permission.checkRolePermissions')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 order-2 sm:order-1"
            >
              {t('common.dismiss')}
            </Button>
            
            <div className="flex gap-2 order-1 sm:order-2 sm:flex-1">
              <Button
                variant="default"
                onClick={handleRequestAccess}
                className="flex-1 gap-2"
              >
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">{t('permission.requestAccess')}</span>
                <span className="sm:hidden">{t('permission.request')}</span>
              </Button>
              
              <Button
                variant="secondary"
                onClick={handleContactAdmin}
                className="flex-1 gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">{t('permission.contactAdmin')}</span>
                <span className="sm:hidden">{t('permission.admin')}</span>
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}